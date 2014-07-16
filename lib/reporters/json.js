var _            = require('underscore');
var util         = require('util');
var BaseReporter = require('./base');

/**
 * A JSON reporter that displays the file, line number, value, associated line,
 * and surrounding lines of any found magic number. If the value of a magic
 * number is included in the optional array of numbers, it is ignored.
 *
 * @constructor
 *
 * @param {Detector} detector The instance on which to register its listeners
 * @param {number[]} [ignore] An array of ints and floats to ignore
 */
function JSONReporter(detector, ignore) {
  this._detector = detector;
  this._ignore = ignore || [];
  this._registerListener();

  // Track whether or not this is the first magicNumber printed
  this._first = true;

  detector.on('start', function() {
    process.stdout.write('[');
  });

  detector.on('end', function() {
    process.stdout.write("]\n");
  });
}

util.inherits(JSONReporter, BaseReporter);
module.exports = JSONReporter;

/**
 * Prints an array of JSON objects with the following properties: file,
 * lineNUmber, value, lineSource, and surroundingLines.
 *
 * @private
 */
JSONReporter.prototype._print = function(magicNumber) {
  var json = JSON.stringify({
    file: magicNumber.file,
    lineNumber: magicNumber.lineNumber,
    value: magicNumber.value,
    lineSource: magicNumber.lineSource,
    surroundingLines: magicNumber.surroundingLines.join("\n")
  });

  if (this._first) {
    this._first = false;
  } else {
    process.stdout.write(",\n");
  }

  process.stdout.write(json);
};
