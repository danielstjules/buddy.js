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
 */
exports.pad = function(string, length, padChar) {
  string = string.toString();
  padChar = (!padChar) ? ' ' : padChar;

  while (string.length < length) {
    string += padChar;
  }

  return string;
};
