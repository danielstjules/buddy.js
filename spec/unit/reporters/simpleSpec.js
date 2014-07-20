var expect         = require('expect.js');
var SimpleReporter = require('../../../lib/reporters/simple.js');
var Detector       = require('../../../lib/detector.js');

describe('SimpleReporter', function() {
  describe('constructor', function() {
    it('accepts a detector as an arg', function() {
      var detector = new Detector(['']);
      var reporter = new SimpleReporter(detector);
      expect(reporter._detector).to.be(detector);
    });
  });
});
