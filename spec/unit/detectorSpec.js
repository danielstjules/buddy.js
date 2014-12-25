var expect       = require('expect.js');
var EventEmitter = require('events').EventEmitter;
var fixtures     = require('../fixtures');
var Detector     = require('../../lib/detector.js');

describe('Detector', function() {
  // Used to test emitted events
  var found;
  var listener = function(magicNumber) {
    found.push(magicNumber);
  };

  beforeEach(function() {
    found = [];
  });

  describe('constructor', function() {
    it('inherits from EventEmitter', function() {
      expect(new Detector()).to.be.an(EventEmitter);
    });

    it('accepts an array of file paths', function() {
      var filePaths = ['path1.js', 'path2.js'];
      var detector = new Detector(filePaths);

      expect(detector._filePaths).to.be(filePaths);
    });

    it('accepts a boolean to enforce the use of const', function() {
      var detector = new Detector([], {
        enforceConst: true
      });
      expect(detector._enforceConst).to.be(true);
    });

    it('accepts an array of numbers to ignore', function() {
      var ignore = [1, 2, 3.4];
      var detector = new Detector([], {
        ignore: ignore
      });
      expect(detector._ignore).to.be(ignore);
    });
  });

  describe('run', function() {
    it('is compatible with callbacks', function(done) {
      var detector = new Detector([fixtures.emptyFile]);
      detector.run(function(err) {
        done(err);
      });
    });

    it('is compatible with promises', function(done) {
      var detector = new Detector([fixtures.emptyFile]);
      detector.run().then(function() {
        done();
      }).catch(done);
    });

    it('returns an Error if not given an array of file paths', function(done) {
      var detector = new Detector();
      detector.run().catch(function(err) {
        expect(err).to.be.an(Error);
        expect(err.message).to.be('filePaths must be a non-empty array of paths');
        done();
      });
    });
  });

  it('emits end on completion, passing the number of files parsed', function(done) {
    var detector = new Detector([fixtures.emptyFile, fixtures.singleVariable]);
    detector.on('end', function(numFiles) {
      expect(numFiles).to.be(2);
      done();
    });

    detector.run().catch(done);
  });

  it('emits no events when parsing an empty file', function(done) {
    var detector = new Detector([fixtures.emptyFile]);
    detector.on('found', listener);

    detector.run().then(function() {
      expect(found).to.be.empty();
      done();
    }).catch(done);
  });

  it('emits no events when the file contains only named constants', function(done) {
    var detector = new Detector([fixtures.singleVariable]);
    detector.on('found', listener);

    detector.run().then(function() {
      expect(found).to.be.empty();
      done();
    }).catch(done);
  });

 it('emits no events for literals assigned to object properties', function(done) {
    var detector = new Detector([fixtures.objectProperties]);
    detector.on('found', listener);

    detector.run().then(function() {
      expect(found).to.have.length(2);
      expect(found[0].value).to.be('4');
      expect(found[1].value).to.be('5');
      done();
    }).catch(done);
  });

 it('emits no events for literals used in AssignmentExpressions', function(done) {
    var detector = new Detector([fixtures.assignmentExpressions]);
    detector.on('found', listener);

    detector.run().then(function() {
      expect(found).to.have.length(0);
      done();
    }).catch(done);
  });

  it('emits no events for numbers marked by ignore:line', function(done) {
    var detector = new Detector([fixtures.lineIgnore]);
    detector.on('found', listener);

    detector.run().then(function() {
      expect(found).to.be.empty();
      done();
    }).catch(done);
  });

  it('emits no events between ignore:start / ignore:end', function(done) {
    var detector = new Detector([fixtures.blockIgnore]);
    detector.on('found', listener);

    detector.run().then(function() {
      expect(found).to.be.empty();
      done();
    }).catch(done);
  });

  it('emits a "found" event containing a magic number, when found', function(done) {
    var detector = new Detector([fixtures.secondsInMinute]);
    detector.on('found', listener);

    detector.run().then(function() {
      expect(found).to.have.length(1);
      expect(found[0].value).to.be('60');
      expect(found[0].file.substr(-18)).to.be('secondsInMinute.js');
      expect(found[0].startColumn).to.be(9);
      expect(found[0].endColumn).to.be(11);
      expect(found[0].fileLength).to.be(4);
      expect(found[0].lineNumber).to.be(2);
      expect(found[0].lineSource).to.be('  return 60;');
      expect(found[0].contextLines).to.eql([
        'function getSecondsInMinute() {', '  return 60;', '}'
      ]);
      expect(found[0].contextIndex).to.eql(1);
      done();
    }).catch(done);
  });

  it('correctly emits hex and octal values', function(done) {
    var detector = new Detector([fixtures.hexOctal]);
    detector.on('found', listener);

    detector.run().then(function() {
      expect(found).to.have.length(3);
      expect(found[0].value).to.be('0x1A');
      expect(found[1].value).to.be('0x02');
      expect(found[2].value).to.be('071');
      done();
    }).catch(done);
  });

  it('skips unnamed constants within the ignore list', function(done) {
    var detector = new Detector([fixtures.ignore], {
      ignore: [0]
    });
    detector.on('found', listener);

    detector.run().then(function() {
      expect(found).to.have.length(1);
      expect(found[0].value).to.be('1');
      done();
    }).catch(done);
  });

  it('ignores the shebang at the start of a file', function(done) {
    var detector = new Detector([fixtures.shebang]);
    detector.on('found', listener);

    detector.run().then(function() {
      expect(found).to.have.length(1);
      expect(found[0].lineNumber).to.be(4);
      expect(found[0].value).to.be('100');
      done();
    }).catch(done);
  });

  describe('with detectObjects set to true', function() {
    it('emits a "found" event for object literals', function(done) {
      var detector = new Detector([fixtures.objectLiterals], {
        detectObjects: true
      });
      detector.on('found', listener);

      detector.run().then(function() {
        expect(found).to.have.length(1);
        expect(found[0].value).to.be('42');
        done();
      }).catch(done);
    });

    it('emits a "found" event for property assignments', function(done) {
      var detector = new Detector([fixtures.objectProperties], {
        detectObjects: true
      });
      detector.on('found', listener);

      detector.run().then(function() {
        expect(found).to.have.length(4);
        expect(found[0].value).to.be('2');
        expect(found[1].value).to.be('3');
        expect(found[2].value).to.be('4');
        expect(found[3].value).to.be('5');
        done();
      }).catch(done);
    });
  });

  describe('with enforceConst set to true', function() {
    it('emits a "found" event for variable declarations', function(done) {
      var detector = new Detector([fixtures.constVariable], {
        enforceConst: true
      });
      detector.on('found', listener);

      detector.run().then(function() {
        expect(found).to.have.length(1);
        expect(found[0].value).to.be('10');
        done();
      }).catch(done);
    });

    it('emits a "found" event for object expressions', function(done) {
      var detector = new Detector([fixtures.constObject], {
        enforceConst: true
      });
      detector.on('found', listener);

      detector.run().then(function() {
        expect(found).to.have.length(1);
        expect(found[0].value).to.be('10');
        done();
      }).catch(done);
    });
  });
});
