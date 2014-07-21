var expect         = require('expect.js');
var chalk          = require('chalk');
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

  describe('when a magic number is found', function() {
    var enabled = chalk.enabled;

    var magicNumber = {
      value: 60,
      file: 'secondsInMinute.js',
      startColumn: 9,
      endColumn: 10,
      fileLength: 3,
      lineNumber: 2,
      lineSource: '  return 60;',
      contextLines: ['function getSecondsInMinute() {', '  return 60;', '}'],
      contextIndex: 1
    };

    beforeEach(function() {
      chalk.enabled = false;
    });

    afterEach(function() {
      chalk.enabled = enabled;
    });

    it('precedes the output with a newline if the first', function() {
      var detector = new Detector(['']);
      var reporter = new SimpleReporter(detector);
      var result = reporter._getOutput(magicNumber);

      expect(result.slice(0, 1)).to.be("\n");
    });

    it('outputs its location and source', function() {
      var detector = new Detector(['']);
      var reporter = new SimpleReporter(detector);
      reporter._found = 2;
      var result = reporter._getOutput(magicNumber);

      expect(result).to.be("secondsInMinute.js:2 | return 600;\n");
    });

    it('colors the string if enabled, and highlights the value', function() {
      chalk.enabled = true;
      var detector = new Detector(['']);
      var reporter = new SimpleReporter(detector);
      reporter._found = 2;
      var result = reporter._getOutput(magicNumber);

      expect(result).to.be("secondsInMinute.js\u001b[90m:\u001b[39m2 | " +
        "\u001b[90mreturn \u001b[39m\u001b[31m60\u001b[39m\u001b[90m0;" +
        "\u001b[39m\n");
    });
  });
});
