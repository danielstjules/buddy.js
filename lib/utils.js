/**
 * A file containing a variety of utility functions.
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
