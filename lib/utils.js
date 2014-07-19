/**
 * A file containing a variety of utility functions.
 */

/**
 * Pads a string to the specified length, appending the given character, or
 * defaulting to a space. Only single character strings should be provided
 * as the padChar.
 *
 * @param {string} string    The string to pad
 * @param {int}    length    Final length of the padded string
 * @param {string} [padChar] Char to use for padding, defaults to whitespace
 *
 * @returns {string} The padded string
 */
exports.pad = function(string, length, padChar) {
  string = string.toString();
  padChar = (!padChar) ? ' ' : padChar;

  while (string.length < length) {
    string += padChar;
  }

  return string;
};

/**
 * Gives a string, returns a count of the leading whitespace characters.
 *
 * @param {string} string The string for which to count whitespace
 *
 * @returns {int} The number of leading whitespace
 */
exports.countLeadingWhitespace = function (string) {
  var whitespace = [" ", "\t", "\n"];
  for (var i = 0; i < string.length; i++) {
    if (whitespace.indexOf(string[i]) === -1) {
      return i;
    }
  }

  return string.length;
};
