var util         = require('util');
var chalk        = require('chalk');
var BaseReporter = require('./base');
var utils        = require('../utils');

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
  var i, location, value, lines, counts, minCount, start, end;

  location = magicNumber.file + ':' + magicNumber.lineNumber;
  value = 'magic number: ' + magicNumber.value;

  lines = magicNumber.contextLines;
  counts = lines.map(function(line) {
    return utils.countLeadingWhitespace(line);
  });

  minCount = Math.min.apply(Math, counts);
  for (i = 0; i < lines.length; i++) {
    lines[i] = chalk.gray(lines[i].substr(minCount));
  }

  // Highlight the magic number's value
  start = magicNumber.lineSource.slice(minCount, magicNumber.startColumn);
  end = magicNumber.lineSource.slice(magicNumber.endColumn).trimRight();
  lines[magicNumber.contextIndex] = chalk.gray(start) +
    chalk.red(magicNumber.value) +
    chalk.gray(end);

  process.stdout.write("\n" + location + ' | ' + value + "\n" +
    lines.join("\n") + "\n");
};
