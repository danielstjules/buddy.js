var expect         = require('expect.js');
var SimpleReporter = require('../../../lib/reporters/simple.js');
var Detector       = require('../../../lib/detector.js');

describe('SimpleReporter', function() {
  describe('constructor', function() {
    it('accepts a detector as an argument', function() {
      var detector = new Detector(['']);
      var reporter = new SimpleReporter(detector);
      expect(reporter._detector).to.be(detector);
    });

    it('registers a listener for the found event', function() {
      var detector = new Detector(['']);
      var reporter = new SimpleReporter(detector);
      expect(detector.listeners('found')).to.have.length(1);
    });
  });
});
