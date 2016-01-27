var util         = require('util');
var EventEmitter = require('events').EventEmitter;
var Promise      = require('bluebird');
var parse        = require('acorn/dist/acorn_loose').parse_dammit;
var acornWalk    = require('acorn/dist/walk');
var fs           = Promise.promisifyAll(require('fs'));
var utils        = require('./utils');

/**
 * Creates a new Detector, which extends EventEmitter. A listener can be
 * attached to the "found" event, emitted when a magic number is detected.
 * filePaths is expected to be an array of string paths. It may also be passed
 * an options object with up to three keys: detectObjects, enforceConst, and
 * ignore. When detectObjects is true, the detector will report magic numbers
 * found in object literals, or as part of property assignments. If enforceConst
 * is true, any numeric literal not defined using the const keyword is flagged.
 * And the ignore key accepts an array of numbers, indicating values to ignore.
 *
 * @constructor
 * @extends EventEmitter
 *
 * @param {string[]} filePaths The files on which to run the detector
 * @param {object}   [opts]    Options to set for the detector
 */
function Detector(filePaths, opts) {
  opts = opts || {};

  this._filePaths = filePaths || [];
  this._detectObjects = opts.detectObjects;
  this._enforceConst = opts.enforceConst;
  this._ignore = opts.ignore || [];
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
  var self, numFiles, opts;

  self = this;
  numFiles = this._filePaths.length;
  opts = {encoding: 'utf8'};

  return this._validateFilePaths().then(function() {
    self.emit('start');

    var promises = [];
    self._filePaths.forEach(function(filePath) {
      var promise = fs.readFileAsync(filePath, opts).then(function(contents) {
        self._parseContents(filePath, contents);
      });

      promises.push(promise);
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
 * Invoked acorn's parser on the given file contents to build a syntax tree
 * conforming to the Mozilla Parser API. Each node includes its location, as
 * well as the source file. The AST is then searched. Returns a promise that
 * is resolved upon completion.
 *
 * @private
 *
 * @param {string} filePath The original filepath
 * @param {string} contents The contents to parse
 *
 * @returns {Promise}
 */
Detector.prototype._parseContents = function(filePath, contents) {
  var originalContents, ignoredLines, ignoredBlocks, rangeStart;

  originalContents = contents;
  ignoredLines  = [];
  ignoredRanges = [];

  var commentHandler = function(block, text, startoff, endoff, start) {
    if (text.indexOf('buddy ignore:line') !== -1) {
      ignoredLines.push(start.line);
    } else if (text.indexOf('buddy ignore:start') !== -1 && !rangeStart) {
      rangeStart = start.line;
    } else if (text.indexOf('buddy ignore:end') !== -1 && rangeStart) {
      ignoredRanges.push([rangeStart, start.line]);
      rangeStart = null;
    }
  };

  // Ignore a shebang found in the first line of a file
  if (contents.substr(0, 2) === '#!') {
    contents = contents.replace('#!', '//');
  }

  var syntaxTree = parse(contents, {
    ecmaVersion: 6,
    allowReturnOutsideFunction: true,
    locations: true,
    sourceFile: filePath,
    onComment: commentHandler
  });

  return this._detectMagicNumbers(syntaxTree, originalContents,
    ignoredLines, ignoredRanges);
};

/**
 * Given a file's syntax tree, as well as its contents, the function walks
 * the AST and emits a found event as necessary. Using acorn's ancestor walk,
 * only Literal nodes are searched. Ignores nodes whose value is not a
 * number, or whose parent is an ObjectExpresion or VariableDeclaration if
 * _enforceConst is false. Otherwise, it ignores nodes whose parent belongs to
 * a VariableDeclaration using the const keyword. Two optional arrays may
 * also be provided to ignore lines, or ranges.
 *
 * @private
 *
 * @param {Node}    syntaxTree      Syntax tree corresponding to the file
 * @param {string}  contents        The file's contents
 * @param {int[]}   [ignoredLines]  Optional lines to ignore
 * @param {int[][]} [ignoredRanges] Optional ranges of lines to ignore
 */
Detector.prototype._detectMagicNumbers = function(syntaxTree, contents,
                                                  ignoredLines, ignoredRanges) {
  var self, lines, fileLength, collect;

  self = this;
  lines = contents.split("\n");
  fileLength = lines.length;

  ignoredLines = ignoredLines || [];
  ignoredRanges = ignoredRanges || [];

  collect = function(node, ancestors) {
    var idx, parent, ignoredTypes, line, start, end, context;

    if (ignoredLines.indexOf(node.loc.end.line) !== -1 ||
        utils.inRanges(node.loc.end.line, ignoredRanges) ||
        typeof node.value !== 'number' ||
        self._ignore.indexOf(node.value) !== -1) {
      return;
    }

    idx = ancestors.length - 1;
    parent = ancestors[idx - 1];
    ancestor = ancestors[idx - 2];

    ignoredTypes = ['VariableDeclaration', 'VariableDeclarator'];
    if (!self._detectObjects) {
      ignoredTypes.push('ObjectExpression', 'Property', 'AssignmentExpression');
    }

    if (self._enforceConst) {
      if ((parent.kind === 'const') ||
          (ancestors[idx - 2] && ancestors[idx - 2].kind === 'const') ||
          (parent.type === 'UnaryExpression' && ancestors[idx - 3] &&
          ancestors[idx - 3].kind === 'const')) {
        return;
      }
    } else {
      if ((ignoredTypes.indexOf(parent.type) !== -1) ||
           (parent.type === 'UnaryExpression' && ancestors[idx - 2] &&
            ignoredTypes.indexOf(ancestors[idx - 2].type) !== -1) ||
          (!self._detectObjects && parent.left &&
            parent.left.type === 'MemberExpression') ||
          (self._detectObjects &&
            parent.type === 'AssignmentExpression' &&
            parent.left.type !== 'MemberExpression')) {
        return;
      }
    }

    line = lines[node.loc.start.line - 1];
    start = node.loc.start.column;
    end = node.loc.end.column;
    context = self._getContext(node, lines);

    // fix columns, since acorn <= 0.9 counts parens in their location
    if (line.slice(start, start + 1) === '(') {
      start += 1;
    }

    if (line.slice(end - 1, end) === ')') {
      end -= 1;
    }

    self.emit('found', {
      value: (node.raw !== undefined) ? node.raw : node.value,
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
