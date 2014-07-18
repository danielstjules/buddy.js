var util         = require('util');
var BaseReporter = require('./base');

/**
 * A detailed reporter that displays the file, line number, and surrounding
 * lines of any found magic number.
 *
 * @constructor
 *
 * @param {Detector} detector The instance on which to register its listeners
 */
function DetailedReporter(detector) {
  BaseReporter.call(this, detector);
  this._registerSummary();
}

util.inherits(DetailedReporter, BaseReporter);
module.exports = DetailedReporter;

/**
 * Prints the file, line number, and the surrounding lines.
 *
 * @private
 *
 * @param {object} magicNumber The magic number to print
 */
DetailedReporter.prototype._print = function(magicNumber) {
  var location = magicNumber.file + ':' + magicNumber.lineNumber;
  var source = magicNumber.surroundingLines.join("\n");
  process.stdout.write(location + "\n" + source + "\n");
};
