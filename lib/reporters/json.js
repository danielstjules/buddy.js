var util         = require('util');
var BaseReporter = require('./base');

/**
 * A JSON reporter that displays the file, line number, value, associated line,
 * and context of any found magic number.
 *
 * @constructor
 *
 * @param {Detector} detector The instance on which to register its listeners
 */
function JSONReporter(detector) {
  BaseReporter.call(this, detector);

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
 * Returns a formatted partial JSON string containing a majority of the magic
 * number's properties. A context property is added consisting of the
 * contextLines joined with newlines. contextLine and contextIndex are removed
 * from the output. Since the JSON reporter outputs an array of objects, the
 * returned objects are preceded by a comma, except for the first.
 *
 * @private
 *
 * @param {object} magicNumber The magic number to print
 *
 * @returns {string} The formatted output
 */
JSONReporter.prototype._getOutput = function(magicNumber) {
  var formatted, output, property;
  formatted = {};
  output = '';

  for (property in magicNumber) {
    formatted[property] = magicNumber[property];
  }

  formatted.context = magicNumber.contextLines.join("\n");
  delete formatted.contextIndex;
  delete formatted.contextLines;

  if (this._found > 1) {
    output += ",\n";
  }

  output += JSON.stringify(formatted);

  return output;
};
