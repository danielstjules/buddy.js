module.exports = {
  'emptyFile.js': '',
  'singleVariable.js': 'var MINUTE = 60;',
  'es5.js': '"use strict";',
  'secondsInMinute.js':
    "function getSecondsInMinute() {\n" +
    "  return 60;\n" +
    "}",
  'lineIgnore.js':
    "var SECOND = 1000;\n" +
    "var MINUTE = 60 * SECOND; // buddy ignore:line\n" +
    "var HOUR = 60 * MINUTE; // buddy ignore:line",
  'blockIgnore.js':
    "// buddy ignore:start\n" +
    "var SECOND = 1000;\n" +
    "var MINUTE = 60 * SECOND;\n" +
    "var HOUR = 60 * MINUTE;\n" +
    "// buddy ignore:end",
  'objectProperties.js':
    "var colors = {};\n" +
    "colors.RED = 1;\n" +
    "colors.YELLOW = 2;\n" +
    "colors.BLUE = 2 + 1;",
  'ignore.js':
    "setTimeout(function() {\n" +
    "  console.log(1);\n" +
    "}, 0);",
  'constVariable.js':
    "var invalid = 10;\n" +
    "const valid = 20;",
  'constObject.js':
    "var test = {key: 10};\n" +
    "const valid = 20;"
};
