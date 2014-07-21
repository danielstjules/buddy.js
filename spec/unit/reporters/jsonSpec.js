var expect         = require('expect.js');
var chalk          = require('chalk');
var JSONReporter = require('../../../lib/reporters/json.js');
var Detector       = require('../../../lib/detector.js');

describe('JSONReporter', function() {
  var write, restoreWrite, captureWrite, output;

  // Helpers for capturing and restoring stdout output
  write = process.stdout.write;

  restoreWrite = function() {
    process.stdout.write = write;
  };

  captureWrite = function() {
    process.stdout.write = function(string) {
      output = string;
    };
  };

  beforeEach(function() {
    output = null;
  });

  describe('constructor', function() {
    it('accepts a detector as an argument', function() {
      var detector = new Detector(['']);
      var reporter = new JSONReporter(detector);
      expect(reporter._detector).to.be(detector);
    });

    it('registers a listener for the found event', function() {
      var detector = new Detector(['']);
      var reporter = new JSONReporter(detector);
      expect(detector.listeners('found')).to.have.length(1);
    });
  });

  it('outputs an open bracket on detector start', function() {
    captureWrite();
    var detector = new Detector(['']);
    var reporter = new JSONReporter(detector);
    detector.emit('start');
    restoreWrite();

    expect(output).to.be('[');
  });

  it('outputs a close bracket on detector end', function() {
    captureWrite();
    var detector = new Detector(['']);
    var reporter = new JSONReporter(detector);
    detector.emit('end');
    restoreWrite();

    expect(output).to.be("]\n");
  });

  describe('when a magic number is found', function() {
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

    it('precedes the output with a comma and newline if not the first', function() {
      var detector = new Detector(['']);
      var reporter = new JSONReporter(detector);
      reporter._found = 2;
      var result = reporter._getOutput(magicNumber);

      expect(result.slice(0, 2)).to.be(",\n");
    });

    it('outputs the magic number with a combined context', function() {
      var detector = new Detector(['']);
      var reporter = new JSONReporter(detector);
      var result = reporter._getOutput(magicNumber);

      expect(result).to.be('{"value":60,"file":"secondsInMinute.js",' +
        '"fileLength":3,"lineNumber":2,"lineSource":"  return 60;",' +
        '"startColumn":9,"endColumn":11,"context":'+
        '"function getSecondsInMinute() {\\n  return 60;\\n}"}');
    });
  });
});
