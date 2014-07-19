var util         = require('util');
var EventEmitter = require('events').EventEmitter;
var Promise      = require('bluebird');
var acorn        = require('acorn');
var acornWalk    = require('acorn/util/walk');
var fs           = Promise.promisifyAll(require('fs'));

/**
 * Creates a new Detector, which extends EventEmitter. A listener can be
 * attached to the "found" event, emitted when a magic number is detected.
 * filePaths is expected to be an array of string paths. If the value of a
 * magic number is included in the optional array of numbers, it is ignored.
 * If enforceConst is true, any numeric literal not defined using the const
 * keyword is flagged.
 *
 * @constructor
 * @extends EventEmitter
 *
 * @param {string[]} filePaths      The files on which to rnu the detector
 * @param {boolean}  [enforceConst] Whether or not to require const
 * @param {number[]} [ignore]       An array of ints and floats to ignore
 */
function Detector(filePaths, enforceConst, ignore) {
  this._filePaths = filePaths || [];
  this._enforceConst = enforceConst;
  this._ignore = ignore || [];
}

util.inherits(Detector, EventEmitter);
module.exports = Detector;

/**
 * Runs the detector on the given file paths, as provided in the constructor.
 * Causes the detector to emit a "found" event when a magic number is detected,
 * passing the listeners an instance of MagicNumber. The callback is invoked
 * with an error on failure, and returns a promise if no callback is supplied.
 *
 * @param {function} [fn] Optional callback to invoke
 *
 * @returns {Promise}
 */
Detector.prototype.run = function(fn) {
  var self = this;
  var numFiles = this._filePaths.length;

  return this._validateFilePaths().then(function() {
    self.emit('start');

    var promises = [];
    self._filePaths.forEach(function(filePath) {
      promises.push(self._parseFile(filePath));
    });

    // Parse the files
    return Promise.all(promises);
  }).then(function() {
    self.emit('end', numFiles);
  }).nodeify(fn);
};

/**
 * Validates the file paths, ensuring that a non-empty array of string paths
 * was provided. On failure, the promise returns an error.
 *
 * @private
 *
 * @returns {Promise}
 */
Detector.prototype._validateFilePaths = function() {
  var self = this;

  return new Promise(function(resolve, reject) {
    if (!(self._filePaths instanceof Array) || !self._filePaths.length) {
      throw new Error('filePaths must be a non-empty array of paths');
    }

    resolve();
  });
};

/**
 * Retrieves the given file's contents and invoked acorn's parser to build a
 * syntax tree conforming to the Mozilla Parser API. Each node includes its
 * location, as well as the source file. The AST is then searched. Returns a
 * promise that is resolved upon completion.
 *
 * @private
 *
 * @param {string} filePath The path to the file to parse
 *
 * @returns {Promise}
 */
Detector.prototype._parseFile = function(filePath) {
  var self = this;
  var opts = {encoding: 'utf8'};

  return fs.readFileAsync(filePath, opts).then(function(contents) {
    var syntaxTree = acorn.parse(contents, {
      ecmaVersion: 6,
      allowReturnOutsideFunction: true,
      locations: true,
      sourceFile: filePath
    });

    self._detectMagicNumbers(syntaxTree, contents);
  });
};

/**
 * Given a file's syntax tree, as well as its contents, the function walks
 * the AST and emits a found event as necessary. Using acorn's ancestor walk,
 * only Literal nodes are searched. Ignores nodes whose value is not a
 * number, or whose parent is an ObjectExpresion or VariableDeclaration if
 * _enforceConst is false. Otherwise, it ignores nodes whose parent belongs to
 * a VariableDeclaration using the const keyword.
 *
 * @private
 *
 * @param {Node}   syntaxTree The syntax tree corresponding to the parsed file
 * @param {string} contents   The file's contents
 */
Detector.prototype._detectMagicNumbers = function(syntaxTree, contents)  {
  var self, lines, fileLength, collect;

  self = this;
  lines = contents.split("\n");
  fileLength = lines.length;

  collect = function(node, ancestors) {
    var nodexIndex, parent, ignoredTypes, line, start, end, context;

    if (typeof node.value !== 'number') {
      return;
    }

    if (self._ignore.indexOf(node.value) !== -1) {
      return;
    }

    nodeIndex = ancestors.length - 1;
    parent = ancestors[nodeIndex - 1];

    ignoredTypes = ['ObjectExpression', 'VariableDeclaration'];
    if (!self._enforceConst && ignoredTypes.indexOf(parent.type) !== -1) {
      return;
    }

    if (self._enforceConst && parent.kind === 'const') {
      return;
    }

    line = lines[node.loc.start.line - 1];
    start = node.loc.start.column;
    end = node.loc.end.column;
    context = self._getContext(node, lines);

    // fix columns, since acorn counts parens in their location
    if (line.slice(start, start + 1) === '(') {
      start += 1;
    }

    if (line.slice(end - 1, end) === ')') {
      end -= 1;
    }

    self.emit('found', {
      value: node.value,
      file: node.loc.source,
      fileLength: fileLength,
      lineNumber: node.loc.start.line,
      lineSource: line,
      startColumn: start,
      endColumn: end,
      contextLines: context.lines,
      contextIndex: context.index
    });
  };

  acornWalk.ancestor(syntaxTree, {Literal: collect});
};

/**
 * A helper function for retrieving the source code lines surrounding a given
 * Node instance, as created by acorn's parser. Attempts to return 3 lines,
 * when possible: the line on which the node is found, the one above, and the
 * one below. For the sake of visual consistency, the function will retrieve
 * the two lines below if the node is located at the top of the file,
 * and two above if located at the bottom. The function returns an object
 * with two properties: lines, and index, where lines is the array described
 * above, and index the location of the node in that array.
 *
 * @param {Node}     node  The node for which to extract the surrounding lines
 * @param {string[]} lines The parent file's contents as an array
 *
 * @returns {object} An object with two properties: linex, and index
 */
Detector.prototype._getContext = function(node, lines) {
  var contextLines, contextIndex, index, start, end, i;

  contextLines = [];
  index = node.loc.start.line - 1;

  start = index - 1;
  end = index + 1;

  // Handle when the line is at the top or bottom
  if (!index) {
    start++;
    end++;
  } else if (index === lines.length - 1) {
    start--;
    end--;
  }

  for (i = start; i <= end && lines.length - 1; i++) {
    // Skip empty lines at the start or end
    if ((i !== start && i !== end) || (lines[i] && lines[i].trim())) {
      contextLines.push(lines[i]);
    }

    if (i === index) {
      contextIndex = contextLines.length - 1;
    }
  }

  return {
    lines: contextLines,
    index: contextIndex
  };
};
