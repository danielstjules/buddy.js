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
 * Prints a JSON string corresponding to the given magicNumber.
 *
 * @private
 *
 * @param {object} magicNumber The magic number to print
 */
JSONReporter.prototype._print = function(magicNumber) {
  magicNumber = Object.create(magicNumber);
  magicNumber.surroundingLines = magicNumber.surroundingLines.join("\n");

  if (this._found > 1) {
    process.stdout.write(",\n");
  }

  process.stdout.write(JSON.stringify(magicNumber));
};
