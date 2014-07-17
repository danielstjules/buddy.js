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
 * was found.
 *
 * @private
 */
SimpleReporter.prototype._print = function(magicNumber) {
  var padLength = magicNumber.fileLength.toString().length;
  var location = magicNumber.file + chalk.gray(':') +
    utils.pad(magicNumber.lineNumber, padLength);

  var source = magicNumber.lineSource.trim();

  console.log(location, '|', chalk.gray(source));
};
