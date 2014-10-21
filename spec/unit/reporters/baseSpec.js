var expect       = require('expect.js');
var util         = require('util');
var chalk        = require('chalk');
var fixtures     = require('../../fixtures');
var BaseReporter = require('../../../lib/reporters/base.js');
var Detector     = require('../../../lib/detector.js');

// A simple TestReporter for testing the BaseReporter
function TestReporter(detector) {
  BaseReporter.call(this, detector);
  this._registerSummary();
}

util.inherits(TestReporter, BaseReporter);

TestReporter.prototype._getOutput = function(magicNumber) {
  return magicNumber.value;
};

describe('BaseReporter', function() {
  describe('constructor', function() {
    it('accepts a detector as an argument', function() {
      var detector = new Detector(['']);
      var reporter = new BaseReporter(detector);
      expect(reporter._detector).to.be(detector);
    });

    it('registers a listener for the found event', function() {
      var detector = new Detector(['']);
      var reporter = new BaseReporter(detector);
      expect(detector.listeners('found')).to.have.length(1);
    });
  });

  describe('summary', function() {
    var enabled, write, restoreWrite, output;

    enabled = chalk.enabled;
    write = process.stdout.write;

    // Helper that must be ran before test completion,
    // otherwise Mocha won't output the spec in its results
    restoreWrite = function() {
      process.stdout.write = write;
    };

    beforeEach(function() {
      chalk.enabled = false;
      output = null;
      process.stdout.write = function(string) {
        output = string;
      };
    });

    afterEach(function() {
      chalk.enabled = enabled;
    });

    it('can be printed on detector end', function(done) {
      var detector = new Detector([fixtures.emptyFile]);
      var reporter = new TestReporter(detector);

      detector.run(function(err) {
        restoreWrite();
        if (err) return done(err);

        expect(output).to.not.be(null);
        done();
      });
    });

    it('prints the correct results if no numbers were found', function(done) {
      var detector = new Detector([fixtures.emptyFile]);
      var reporter = new TestReporter(detector);

      detector.run(function(err) {
        restoreWrite();
        if (err) return done(err);

        expect(output).to.be("\n No magic numbers found across 1 file\n");
        done();
      });
    });

    it('prints the correct results if magic numbers were found', function(done) {
      var detector = new Detector([fixtures.secondsInMinute, fixtures.emptyFile]);
      var reporter = new TestReporter(detector);

      detector.run(function(err) {
        restoreWrite();
        if (err) return done(err);

        expect(output).to.be("\n 1 magic number found across 2 files\n");
        done();
      });
    });
  });
});
