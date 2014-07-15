/**
 * A detailed reporter that displays the file, line number, and surrounding
 * lines of any found magic number. If the value of a magic number is included
 * in the optional array of numbers, it is ignored.
 *
 * @constructor
 *
 * @param {Detector} detector The instance on which to register its listeners
 * @param {number[]} [ignore] An array of ints and floats to ignore
 */
function Detailed(detector, ignore) {
  this._detector = detector;
  this._ignore = ignore || [];
  this._registerListener();
}

module.exports = Detailed;

/**
 * Prints the file, line number, and the surrounding lines.
 *
 * @private
 */
Detailed.prototype._print = function(magicNumber) {
  var location = magicNumber.file + ':' + magicNumber.lineNumber;
  var source = magicNumber.surroundingLines.join("\n");
  process.stdout.write(location + "\n" + source + "\n");
};

/**
 * Registers a listener to the "found" event exposed by the Detector instance.
 *
 * @private
 */
Detailed.prototype._registerListener = function() {
  var self = this;

  this._detector.on('found', function(magicNumber) {
    if (self._ignore.indexOf(magicNumber.value) !== -1) {
      return;
    }

    self._print(magicNumber);
  });
};
