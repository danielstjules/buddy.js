/**
 * A file containing a variety of utility functions.
 */

/**
 * A helper function for retrieving the source code lines surrounding a given
 * Node instance, as created by acorn's parser. Attempts to return 3 lines,
 * when possible: the line on which the node is found, the one above, and the
 * one below. For the sake of visual consistency, the function will return
 * the two lines below if the node is located at the top of the file,
 * and two above if located at the bottom.
 *
 * @param {Node}     node  The node for which to extract the surrounding lines
 * @param {string[]} lines The parent file's contents as an array
 *
 * @returns {string[]} The lines surrounding the node
 */
exports.getSurroundingLines = function(node, lines) {
  var surrounding = [];
  var index = node.loc.start.line - 1;

  var start = index - 1;
  var end = index + 1;

  // Handle when the line is at the top or bottom
  if (!index) {
    start++;
    end++;
  } else if (index === lines.length - 1) {
    start--;
    end--;
  }

  for (var i = start; i <= end && lines.length - 1; i++) {
    surrounding.push(lines[i]);
  }

  return surrounding;
};

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
