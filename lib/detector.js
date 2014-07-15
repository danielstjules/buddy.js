var util         = require('util');
var EventEmitter = require('events').EventEmitter;
var Promise      = require('bluebird');
var acorn        = require('acorn');
var acornWalk    = require('acorn/util/walk');
var utils        = require('./utils');
var fs           = Promise.promisifyAll(require('fs'));

/**
 * Creates a new Detector, which extends EventEmitter. A listener can be
 * attached to the "found" event, emitted when a magic number is detected.
 *
 * @constructor
 * @extends EventEmitter
 *
 * @param {string[]} filePaths The files on which to rnu the detector
 */
function Detector(filePaths) {
  this._filePaths = filePaths || [];
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
    var promises = [];
    self._filePaths.forEach(function(filePath) {
      promises.push(self._parseFile(filePath));
    });

    // Parse the files
    return Promise.all(promises);
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
      ecmaVersion: 5,
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
 * number, or whose parent is an ObjectExpresion or VariableDeclaration.
 *
 * @private
 *
 * @param {Node}   syntaxTree The syntax tree corresponding to the parsed file
 * @param {string} contents   The file's contents
 */
Detector.prototype._detectMagicNumbers = function(syntaxTree, contents)  {
  var self = this;
  var magicNumbers = [];
  var lines = contents.split("\n");
  var fileLength = lines.length;

  var collect = function(node, ancestors) {
    if (typeof node.value !== 'number') {
      return;
    }

    var nodeIndex = ancestors.length - 1;
    var parent = ancestors[nodeIndex - 1];
    var ignoredTypes = ['ObjectExpression', 'VariableDeclaration'];

    if (ignoredTypes.indexOf(parent.type) !== -1) {
      return;
    }

    self.emit('found', {
      value: node.value,
      file: node.loc.source,
      fileLength: fileLength,
      lineNumber: node.loc.start.line,
      lineSource: lines[node.loc.start.line - 1],
      surroundingLines: utils.getSurroundingLines(node, lines)
    });
  };

  acornWalk.ancestor(syntaxTree, {Literal: collect});
};
