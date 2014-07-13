var util         = require('util');
var EventEmitter = require('events').EventEmitter;
var Promise      = require('bluebird');
var acorn        = require('acorn');
var acornWalk    = require('acorn/util/walk');
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
    if (!(self._filePaths instanceof Array)) {
      throw new Error('filePaths must be an array');
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

  var collect = function(node) {
    if (typeof node.value !== 'number') {
      return;
    }

    self.emit('found', node);
  };

  acornWalk.simple(syntaxTree, {Literal: collect});
};

Detector.prototype._getSurroundingLines = function(node, lines) {
  var surrounding = [];
  var index = node.loc.start - 1;

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

