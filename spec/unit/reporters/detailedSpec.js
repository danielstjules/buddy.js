var expect         = require('expect.js');
var chalk          = require('chalk');
var DetailedReporter = require('../../../lib/reporters/detailed.js');
var Detector       = require('../../../lib/detector.js');

describe('DetailedReporter', function() {
  describe('constructor', function() {
    it('accepts a detector as an argument', function() {
      var detector = new Detector(['']);
      var reporter = new DetailedReporter(detector);
      expect(reporter._detector).to.be(detector);
    });

    it('registers a listener for the found event', function() {
      var detector = new Detector(['']);
      var reporter = new DetailedReporter(detector);
      expect(detector.listeners('found')).to.have.length(1);
    });
  });

  describe('when a magic number is found', function() {
    var enabled = chalk.enabled;

    var magicNumber = {
      value: 60,
      file: 'secondsInMinute.js',
      fileLength: 3,
      lineNumber: 2,
      lineSource: '  return 60;',
      startColumn: 9,
      endColumn: 11,
      contextLines: ['function getSecondsInMinute() {', '  return 60;', '}'],
      contextIndex: 1
    };

    beforeEach(function() {
      chalk.enabled = false;
    });

    afterEach(function() {
      chalk.enabled = enabled;
    });

    it('outputs its location and surrounding lines', function() {
      var detector = new Detector(['']);
      var reporter = new DetailedReporter(detector);
      var result = reporter._getOutput(magicNumber);

      expect(result).to.be("\nsecondsInMinute.js:2 | magic number: 60\n" +
        "function getSecondsInMinute() {\n  return 60;\n}\n");
    });

    it('colors the string if enabled, and highlights the value', function() {
      chalk.enabled = true;
      var detector = new Detector(['']);
      var reporter = new DetailedReporter(detector);
      var result = reporter._getOutput(magicNumber);

      expect(result).to.be("\nsecondsInMinute.js:2 | magic number: 60\n" +
        "\u001b[90mfunction getSecondsInMinute() {\u001b[39m\n" +
        "\u001b[90m  return \u001b[39m\u001b[31m60\u001b[39m\u001b[90m;" +
        "\u001b[39m\n\u001b[90m}\u001b[39m\n");
    });
  });
});
