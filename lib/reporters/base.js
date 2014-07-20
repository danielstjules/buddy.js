var chalk = require('chalk');
var util  = require('util');

/**
 * A base reporter from which all others inherit.
 *
 * @constructor
 *
 * @param {Detector} detector The instance on which to register its listeners
 */
function BaseReporter(detector) {
  this._detector = detector;
  this._found = 0;
  this._registerListener();
}

module.exports = BaseReporter;

/**
 * Registers a listener to the "found" event exposed by the Detector instance.
 * Invokes the object's _getOutput method, writing it to stdout.
 *
 * @private
 */
BaseReporter.prototype._registerListener = function() {
  var self = this;
  this._detector.on('found', function(magicNumber) {
    self._found++;
    process.stdout.write(self._getOutput(magicNumber));
  });
};

/**
 * Registers a listener that prints a final summary outlining the number of
 * unnamed numeric constants detected.
 */
BaseReporter.prototype._registerSummary = function() {
  var self = this;
  this._detector.on('end', function(numFiles) {
    var summary, files, numbers;
    files = (numFiles > 1) ? 'files' : 'file';
    numbers = (self._found > 1) ? 'numbers' : 'number';

    if (!self._found) {
      summary = chalk.black.bgGreen(util.format(
        "\n No magic numbers found across %d %s", numFiles, files));
    } else {
      summary = chalk.bgRed(util.format("\n %d magic %s found across %d %s",
        self._found, numbers, numFiles, files));
    }

    process.stdout.write(summary + "\n");
  });
};
