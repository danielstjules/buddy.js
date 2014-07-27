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
  var whitespace = [" ", "\t"];
  for (var i = 0; i < string.length; i++) {
    if (whitespace.indexOf(string[i]) === -1) {
      return i;
    }
  }

  return string.length;
};

/**
 * Returns true if the given number is within the range of any tuple in the
 * given array.
 *
 * @param {int}   num    Value for which to verify its membership
 * @param {int[]} ranges An array of tuples
 *
 * @returns {boolean} Whether or not the number is in any of the ranges
 */
exports.inRanges = function(num, ranges) {
  for (var i = 0; i < ranges.length; i++) {
    if (num > ranges[i][1]) {
      return false;
    } else if (num <= ranges[i][1]) {
      return true;
    }
  }

  return false;
};
