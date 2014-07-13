var Promise  = require('bluebird');
var expect   = require('expect.js');
var fs       = Promise.promisifyAll(require('fs'));
var Detector = require('../../lib/detector.js');

describe('Detector', function() {
  describe('constructor', function() {
    it('accepts an array of file paths', function() {
      var filePaths = ['path1.js', 'path2.js'];
      var detector = new Detector(filePaths);

      expect(detector._filePaths).to.be(filePaths);
    });

    it('defaults to an empty array', function() {
      var detector = new Detector();
      expect(detector._filePaths).to.be.an(Array);
      expect(detector._filePaths).to.be.empty();
    });
  });

  describe('run', function() {
    it('test', function(done) {
      var detector;

      fs.realpathAsync('spec/fixtures/testFile.js').then(function(path) {
        detector = new Detector([path]);
        return detector.run();
      }).then(function() {
        done();
      }).catch(function(err) {
        done(err);
      });
    });
  });
});
