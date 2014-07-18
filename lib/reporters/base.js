var chalk = require('chalk');

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
 *
 * @private
 */
BaseReporter.prototype._registerListener = function() {
  var self = this;
  this._detector.on('found', function(magicNumber) {
    self._found++;
    self._print(magicNumber);
  });
};

/**
 * Registers a listener that prints a final summary outlining the number of
 * unnamed numeric constants detected.
 */
BaseReporter.prototype._registerSummary = function() {
  var self = this;
  this._detector.on('end', function(numFiles) {
    var summary;
    var files = (numFiles > 1) ? 'files' : 'file';

    if (!self._found) {
      summary = chalk.black.bgGreen("\n No magic numbers found across " +
        numFiles + ' ' + files);
    } else {
      summary = chalk.bgRed("\n " + self._found +
        " magic numbers found across " + numFiles + ' ' + files);
    }

    process.stdout.write(summary + "\n");
  });
};
