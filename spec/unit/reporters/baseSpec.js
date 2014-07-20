var expect       = require('expect.js');
var BaseReporter = require('../../../lib/reporters/base.js');
var Detector     = require('../../../lib/detector.js');

describe('BaseReporter', function() {
  describe('constructor', function() {
    it('accepts a detector as an arg', function() {
      var detector = new Detector(['']);
      var reporter = new BaseReporter(detector);
      expect(reporter._detector).to.be(detector);
    });
  });
});
