var util         = require('util');
var EventEmitter = require('events').EventEmitter;
var Promise      = require('bluebird');
var acorn        = require('acorn');
var acornWalk    = require('acorn/util/walk');
var utils        = require('./utils');
var fs           = Promise.promisifyAll(require('fs'));

function Detector(filePaths) {
  this._filePaths = filePaths || [];
}

util.inherits(Detector, EventEmitter);
module.exports = Detector;

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

Detector.prototype._validateFilePaths = function() {
  var self = this;

  return new Promise(function(resolve, reject) {
    if (!(self._filePaths instanceof Array) || !self._filePaths.length) {
      throw new Error('filePaths must be a non-empty array of paths');
    }

    resolve();
  });
};

Detector.prototype._parseFile = function(filePath) {
  var self = this;
  var opts = {encoding: 'utf8'};

  return fs.readFileAsync(filePath, opts).then(function(content) {
    var syntaxTree = acorn.parse(content, {
      ecmaVersion: 5,
      allowReturnOutsideFunction: true,
      locations: true,
      sourceFile: filePath
    });

    self._detectMagicNumbers(syntaxTree, content);
  });
};

Detector.prototype._detectMagicNumbers = function(syntaxTree, content)  {
  var self = this;
  var magicNumbers = [];
  var lines = content.split("\n");

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

    var magicNumber = {
      value: node.value,
      file: node.loc.source,
      line: node.loc.start.line,
      lineSource: lines[node.loc.start.line - 1],
      surroundingLines: utils.getSurroundingLines(node, lines)
    };

    self.emit('found', magicNumber);
  };

  acornWalk.ancestor(syntaxTree, {Literal: collect});
};
