var expect = require('expect.js');
var utils  = require('../../lib/utils.js');

describe('utils', function() {
  describe('pad', function() {
    it('pads the string to the specified length', function() {
      var result = utils.pad('foo', 7);
      expect(result).to.be('foo    ');
    });

    it('returns the string if no padding is required', function() {
      var result = utils.pad('foo', 3);
      expect(result).to.be('foo');
    });

    it('takes a third arg to pad the string with the specified char', function() {
      var result = utils.pad('foo', 6, '-');
      expect(result).to.be('foo---');
    });
  });

  describe('countLeadingWhitespace', function() {
    it('counts the number of leading tabs and spaces', function() {
      var result = utils.countLeadingWhitespace("  \tfoo");
      expect(result).to.be(3);
    });

    it('returns the length of the string if all whitespace', function() {
      var result = utils.countLeadingWhitespace(" \t \t");
      expect(result).to.be(4);
    });
  });
});
