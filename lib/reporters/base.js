/**
 * A base reporter from which all others inherit.
 *
 * @constructor
 *
 * @param {Detector} detector The instance on which to register its listeners
 * @param {number[]} [ignore] An array of ints and floats to ignore
 */
function BaseReporter(detector, ignore) {
  this._detector = detector;
  this._ignore = ignore;
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
    if (self._ignore.indexOf(magicNumber.value) !== -1) {
      return;
    }

    self._print(magicNumber);
  });
};
