var expect   = require('expect.js');
var fixtures = require('../fixtures');
var fs       = require('fs');
var exec     = require('child_process').exec;

describe('bin/buddy', function() {
  it('correctly outputs all magic numbers in the test file', function(done) {
    var opt = {encoding: 'utf8'};
    fs.readFile(fixtures.testFileOutput, opt, function(err, expectedOut) {
      if (err) return done(err);

      exec('./bin/buddy -C ' + fixtures.testFile, function(err, stdout, stderr) {
        expect(stderr).to.be.empty();
        expect(stdout).to.be(expectedOut);
        done();
      });
    });
  });
});
