module.exports = {
  'emptyFile.js': '',
  'singleVariable.js': 'var MINUTE = 60;',
  'es5.js': '"use strict";',
  'secondsInMinute.js':
    "function getSecondsInMinute() {\n" +
    "  return 60;\n" +
    "}",
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
