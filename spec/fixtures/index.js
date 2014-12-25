var path = require('path');

var absolutePaths = {};
var fixtures = ['emptyFile', 'singleVariable', 'es5', 'secondsInMinute',
                'lineIgnore', 'blockIgnore', 'objectProperties',
                'ignore', 'constVariable', 'constObject', 'shebang',
                'testFile', 'hexOctal', 'assignmentExpressions',
                'objectLiterals'];

absolutePaths.testFileOutput = path.resolve(__dirname, 'testFileOutput');

fixtures.forEach(function(fixture) {
  absolutePaths[fixture] = path.resolve(__dirname, fixture + '.js');
});

module.exports = absolutePaths;
