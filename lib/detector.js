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
 * If constants is true, any numeric literal not defined using the const
 * keyword is flagged.
 *
 * @constructor
 * @extends EventEmitter
 *
 * @param {string[]} filePaths   The files on which to rnu the detector
 * @param {boolean}  [constants] Whether or not to require constants
 * @param {number[]} [ignore]    An array of ints and floats to ignore
 */
function Detector(filePaths, constants, ignore) {
  this._filePaths = filePaths || [];
  this._constants = constants;
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
 * _constant is false. Otherwise, it ignores nodes whose parent belongs to
 * a VariableDeclaration using the const keyword.
 *
 * @private
 *
 * @param {Node}   syntaxTree The syntax tree corresponding to the parsed file
 * @param {string} contents   The file's contents
 */
Detector.prototype._detectMagicNumbers = function(syntaxTree, contents)  {
  var self = this;
  var lines = contents.split("\n");
  var fileLength = lines.length;

  var collect = function(node, ancestors) {
    if (typeof node.value !== 'number') {
      return;
    }

    if (self._ignore.indexOf(node.value) !== -1) {
      return;
    }

    var nodeIndex = ancestors.length - 1;
    var parent = ancestors[nodeIndex - 1];

    var ignoredTypes = ['ObjectExpression', 'VariableDeclaration'];
    if (!self._constants && ignoredTypes.indexOf(parent.type) !== -1) {
      return;
    }

    if (self._constants && parent.kind === 'const') {
      return;
    }

    var line = lines[node.loc.start.line - 1];
    var startColumn = node.loc.start.column;
    var endColumn = node.loc.end.column;

    // fix columns, since acorn counts parens in their location
    if (line.slice(startColumn, startColumn + 1) === '(') {
      startColumn += 1;
    }

    if (line.slice(endColumn - 1, endColumn) === ')') {
      endColumn -= 1;
    }

    self.emit('found', {
      value: node.value,
      file: node.loc.source,
      fileLength: fileLength,
      lineNumber: node.loc.start.line,
      lineSource: line,
      startColumn: startColumn,
      endColumn: endColumn,
      surroundingLines: self._getSurroundingLines(node, lines)
    });
  };

  acornWalk.ancestor(syntaxTree, {Literal: collect});
};

/**
 * A helper function for retrieving the source code lines surrounding a given
 * Node instance, as created by acorn's parser. Attempts to return 3 lines,
 * when possible: the line on which the node is found, the one above, and the
 * one below. For the sake of visual consistency, the function will return
 * the two lines below if the node is located at the top of the file,
 * and two above if located at the bottom.
 *
 * @param {Node}     node  The node for which to extract the surrounding lines
 * @param {string[]} lines The parent file's contents as an array
 *
 * @returns {string[]} The lines surrounding the node
 */
Detector.prototype._getSurroundingLines = function(node, lines) {
  var surrounding = [];
  var index = node.loc.start.line - 1;

  var start = index - 1;
  var end = index + 1;

  // Handle when the line is at the top or bottom
  if (!index) {
    start++;
    end++;
  } else if (index === lines.length - 1) {
    start--;
    end--;
  }

  for (var i = start; i <= end && lines.length - 1; i++) {
    surrounding.push(lines[i]);
  }

  return surrounding;
};
