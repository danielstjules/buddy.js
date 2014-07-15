/**
 * A simple reporter that displays the file, line number, and line on which
 * magic numbers are found. If the value of a magic number is included
 * in the optional array of numbers, it is ignored.
 *
 * @constructor
 *
 * @param {Detector} detector The instance on which to register its listeners
 * @param {number[]} [ignore] An array of ints and floats to ignore
 */
function Simple(detector, ignore) {
  this._detector = detector;
  this._ignore = ignore || [];
  this._registerListener();
}

module.exports = Simple;

/**
 * Prints the file, line number, and line on which the supplied magic number
 * was found.
 *
 * @private
 */
Simple.prototype._print = function(magicNumber) {
  var location = magicNumber.file + ':' + magicNumber.lineNumber;
  console.log(location, '|', magicNumber.lineSource);
};

/**
 * Registers a listener to the "found" event exposed by the Detector instance.
 *
 * @private
 */
Simple.prototype._registerListener = function() {
  var self = this;

  this._detector.on('found', function(magicNumber) {
    if (self._ignore.indexOf(magicNumber.value) !== -1) {
      return;
    }

    self._print(magicNumber);
  });
};
