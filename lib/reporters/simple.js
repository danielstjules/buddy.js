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
 * Returns a string containing the file path, line number, and line on which
 * the supplied magic number was found. Highlights the value in red if color
 * output is enabled.
 *
 * @private
 *
 * @param {object} magicNumber The magic number to print
 *
 * @returns {string} The formatted output
 */
SimpleReporter.prototype._getOutput = function(magicNumber) {
  var output, padLength, location, start, end, source;

  output = '';
  if (this._found <= 1) {
    output += "\n";
  }

  padLength = magicNumber.fileLength.toString().length;
  location = magicNumber.file + chalk.gray(':') +
    utils.pad(magicNumber.lineNumber, padLength);

  start = magicNumber.lineSource.slice(0, magicNumber.startColumn);
  end = magicNumber.lineSource.slice(magicNumber.endColumn);

  // trim surrounding whitespace
  source = chalk.gray(start.trimLeft()) +
    chalk.red(magicNumber.value) +
    chalk.gray(end.trimRight());

  output += location + ' | ' + source + "\n";

  return output;
};
