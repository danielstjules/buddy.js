var util         = require('util');
var BaseReporter = require('./base');

/**
 * A JSON reporter that displays the file, line number, value, associated line,
 * and surrounding lines of any found magic number.
 *
 * @constructor
 *
 * @param {Detector} detector The instance on which to register its listeners
 */
function JSONReporter(detector) {
  BaseReporter.call(this, detector);

  detector.on('start', function() {
    process.stdout.write('[');
  });

  detector.on('end', function() {
    process.stdout.write("]\n");
  });
}

util.inherits(JSONReporter, BaseReporter);
module.exports = JSONReporter;

/**
 * Prints an array of JSON objects with the following properties: file,
 * lineNUmber, value, lineSource, and surroundingLines.
 *
 * @private
 */
JSONReporter.prototype._print = function(magicNumber) {
  var json = JSON.stringify({
    file: magicNumber.file,
    lineNumber: magicNumber.lineNumber,
    value: magicNumber.value,
    lineSource: magicNumber.lineSource,
    surroundingLines: magicNumber.surroundingLines.join("\n")
  });

  if (this._found > 1) {
    process.stdout.write(",\n");
  }

  process.stdout.write(json);
};
