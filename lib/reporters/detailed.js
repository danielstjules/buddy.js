var _            = require('underscore');
var util         = require('util');
var BaseReporter = require('./base');

/**
 * A detailed reporter that displays the file, line number, and surrounding
 * lines of any found magic number. If the value of a magic number is included
 * in the optional array of numbers, it is ignored.
 *
 * @constructor
 *
 * @param {Detector} detector The instance on which to register its listeners
 * @param {number[]} [ignore] An array of ints and floats to ignore
 * @param {boolean}  color    Whether or not to enable color output
 */
function DetailedReporter(detector, ignore, color) {
  this._detector = detector;
  this._ignore = ignore || [];
  this._color = color;
  this._registerListener();
}

util.inherits(DetailedReporter, BaseReporter);
module.exports = DetailedReporter;

/**
 * Prints the file, line number, and the surrounding lines.
 *
 * @private
 */
DetailedReporter.prototype._print = function(magicNumber) {
  var location = magicNumber.file + ':' + magicNumber.lineNumber;
  var source = magicNumber.surroundingLines.join("\n");
  process.stdout.write(location + "\n" + source + "\n");
};
