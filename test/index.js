const should = require('should');
const assert = require('stream-assert');
const path = require('path');
const fs = require('fs');
const File = require('vinyl');
const gulp = require('gulp');

const resolveRefs = require('../index.js');

const fixtures = function (glob) { return path.join(__dirname, 'fixtures', glob); }


describe('gulp-resolverefs', function () {

  describe('resolveRefs()', function () {

    it('should throw, when arguments is missing', function () {
      resolveRefs.should.throw('gulp-resolverefs: Missing file option');
    });


    it('should ignore null files', function (done) {
      let stream = resolveRefs('missing.js');
      stream
        .pipe(assert.length(0))
        .pipe(assert.end(done));
      stream.write(new File());
      stream.end();
    });


    it('should emit error on streamed file', function (done) {
      gulp.src(fixtures('*'), { buffer: false })
        .pipe(resolveRefs('missing.js'))
        .once('error', function (err) {
          err.message.should.eql('gulp-resolverefs: Streaming not supported');
          done();
        });
    });


    it('should ignore not yaml files', function (done) {
      gulp.src(__dirname + '/fixtures/*')
        .pipe(assert.length(3))
        .pipe(resolveRefs('index.json'))
        .pipe(assert.length(1))
        .pipe(assert.end(done))
      ;
    });


    it('should resolve splited yaml to json', function (done) {
      var test = fs.readFileSync(__dirname + '/yaml/_index.json');
      var dist = __dirname + '/yaml/index.json';
      gulp.src(__dirname + '/yaml/index.yaml')
        .pipe(resolveRefs(dist))
        .pipe(assert.first(function (newFile) {
          var newFilePath = path.resolve(newFile.path);
          var expectedFilePath = path.resolve(dist);
          newFilePath.should.equal(expectedFilePath);
          newFile.contents.toString().should.equal(test.toString());
        }))
        .pipe(assert.end(done))
      ;
    });

  });

});
