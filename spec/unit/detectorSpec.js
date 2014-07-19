var Promise      = require('bluebird');
var expect       = require('expect.js');
var EventEmitter = require('events').EventEmitter;
var fs           = Promise.promisifyAll(require('fs'));
var mockfs       = require('mock-fs');
var fixtures     = require('../fixtures/mockfsTestFiles.js');
var Detector     = require('../../lib/detector.js');

describe('Detector', function() {
  // Used to test emitted events
  var found;
  var listener = function(magicNumber) {
    found.push(magicNumber);
  };

  before(function() {
    mockfs(fixtures);
  });

  after(function() {
    mockfs.restore();
  });

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
      var detector = new Detector([], true);
      expect(detector._enforceConst).to.be(true);
    });

    it('accepts an array of numbers to ignore', function() {
      var ignore = [1, 2, 3.4];
      var detector = new Detector([], false, ignore);
      expect(detector._ignore).to.be(ignore);
    });
  });

  describe('run', function() {
    it('is compatible with callbacks', function(done) {
      var detector = new Detector(['emptyFile.js']);
      detector.run(function(err) {
        done(err);
      });
    });

    it('is compatible with promises', function(done) {
      var detector = new Detector(['emptyFile.js']);
      detector.run().then(function() {
        done();
      }).catch(function(err) {
        done(err);
      });
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
    var detector = new Detector(['emptyFile.js', 'singleVariable.js']);
    detector.on('end', function(numFiles) {
      expect(numFiles).to.be(2);
      done();
    });

    detector.run().catch(function(err) {
      done(err);
    });
  });

  it('emits no events when parsing an empty file', function(done) {
    var detector = new Detector(['emptyFile.js']);
    detector.on('found', listener);

    detector.run().then(function() {
      expect(found).to.be.empty();
      done();
    }).catch(function(err) {
      done(err);
    });
  });

  it('emits no events when the file contains only named constants', function(done) {
    var detector = new Detector(['singleVariable.js']);
    detector.on('found', listener);

    detector.run().then(function() {
      expect(found).to.be.empty();
      done();
    }).catch(function(err) {
      done(err);
    });
  });

  it('emits a "found" event containing a magic number, when found', function(done) {
    var detector = new Detector(['secondsInMinute.js']);
    detector.on('found', listener);

    detector.run().then(function() {
      expect(found).to.have.length(1);
      expect(found[0].value).to.be(60);
      expect(found[0].file).to.be('secondsInMinute.js');
      expect(found[0].startColumn).to.be(9);
      expect(found[0].endColumn).to.be(11);
      expect(found[0].fileLength).to.be(3);
      expect(found[0].lineNumber).to.be(2);
      expect(found[0].lineSource).to.be('  return 60;');
      expect(found[0].contextLines).to.eql([
        'function getSecondsInMinute() {', '  return 60;', '}'
      ]);
      expect(found[0].contextIndex).to.eql(1);
      done();
    }).catch(function(err) {
      done(err);
    });
  });

  it('skips unnamed constants within the ignore list', function(done) {
    var detector = new Detector(['ignore.js'], false, [0]);
    detector.on('found', listener);

    detector.run().then(function() {
      expect(found).to.have.length(1);
      expect(found[0].value).to.be(1);
      done();
    }).catch(function(err) {
      done(err);
    });
  });

  describe('with enforceConst set to true', function() {
    it('emits a "found" event for variable declarations', function(done) {
      var detector = new Detector(['constVariable.js'], true);
      detector.on('found', listener);

      detector.run().then(function() {
        expect(found).to.have.length(1);
        expect(found[0].value).to.be(10);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('emits a "found" event for object expressions', function(done) {
      var detector = new Detector(['constObject.js'], true);
      detector.on('found', listener);

      detector.run().then(function() {
        expect(found).to.have.length(1);
        expect(found[0].value).to.be(10);
        done();
      }).catch(function(err) {
        done(err);
      });
    });
  });
});
