var expect   = require('expect.js');
var path     = require('path');
var dirmap   = require('dirmap');
var fixtures = dirmap(path.resolve(__dirname, '../fixtures'), true);
var fs       = require('fs');
var exec     = require('child_process').exec;

describe('bin/buddy', function() {
  it('correctly outputs all magic numbers in the test file', function(done) {
    // Absolute paths may vary
    var expectedOutput = [
      'buddy.js/spec/fixtures/testFile.js:10 | another: 10 * 10,',
      'buddy.js/spec/fixtures/testFile.js:10 | another: 10 * 10,',
      'buddy.js/spec/fixtures/testFile.js:15 | return 24 * HOUR;',
      'buddy.js/spec/fixtures/testFile.js:21 | (1000)',
      'buddy.js/spec/fixtures/testFile.js:30 | setTimeout(func, 10);',
      '5 magic numbers found across 1 file'
    ];

    exec('./bin/buddy -C ' + fixtures.testFile, function(err, stdout, stderr) {
      // Ignore err, since the command will fail due to detected
      // magic numbers
      expect(stderr).to.be.empty();
      expectedOutput.forEach(function(str) {
        expect(stdout).to.contain(str);
      });
      done();
    });
  });
});
