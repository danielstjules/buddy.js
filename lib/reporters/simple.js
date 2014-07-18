var util         = require('util');
var chalk        = require('chalk');
var BaseReporter = require('./base');
var utils        = require('../utils');

/**
 * A simple reporter that displays the file, line number, and line on which
 * magic numbers are found.
 *
 * @constructor
 *
 * @param {Detector} detector The instance on which to register its listeners
 */
function SimpleReporter(detector) {
  BaseReporter.call(this, detector);
  this._registerSummary();
}

util.inherits(SimpleReporter, BaseReporter);
module.exports = SimpleReporter;

/**
 * Prints the file, line number, and line on which the supplied magic number
 * was found. Highlights the value in red if color output is enabled.
 *
 * @private
 *
 * @param {object} magicNumber The magic number to print
 */
SimpleReporter.prototype._print = function(magicNumber) {
  var padLength = magicNumber.fileLength.toString().length;
  var location = magicNumber.file + chalk.gray(':') +
    utils.pad(magicNumber.lineNumber, padLength);

  var start = magicNumber.lineSource.slice(0, magicNumber.startColumn);
  var end = magicNumber.lineSource.slice(magicNumber.endColumn);

  // trim surrounding whitespace
  var source = chalk.gray(start.trimLeft()) +
    chalk.red(magicNumber.value) +
    chalk.gray(end.trimRight());

  console.log(location, '|', source);
};
