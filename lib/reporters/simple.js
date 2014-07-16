var _            = require('underscore');
var util         = require('util');
var BaseReporter = require('./base');

/**
 * A simple reporter that displays the file, line number, and line on which
 * magic numbers are found. If the value of a magic number is included
 * in the optional array of numbers, it is ignored.
 *
 * @constructor
 *
 * @param {Detector} detector The instance on which to register its listeners
 * @param {number[]} [ignore] An array of ints and floats to ignore
 * @param {boolean}  color    Whether or not to enable color output
 */
function SimpleReporter(detector, ignore, color) {
  this._detector = detector;
  this._ignore = ignore || [];
  this._color = color;
  this._registerListener();
}

util.inherits(SimpleReporter, BaseReporter);
module.exports = SimpleReporter;

/**
 * Prints the file, line number, and line on which the supplied magic number
 * was found.
 *
 * @private
 */
SimpleReporter.prototype._print = function(magicNumber) {
  var location = magicNumber.file + ':' + magicNumber.lineNumber;
  console.log(location, '|', magicNumber.lineSource);
};
