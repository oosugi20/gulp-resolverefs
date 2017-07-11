'use strict';
const fs = require('fs');
const path = require('path');

const File = require('vinyl');
const through = require('through2');
const jsonRefs = require('json-refs');
const YAML = require('yaml-js');


module.exports = function (distFile, options) {

  let distFileName;
  let resolvedContent;

  const transform = function (file, encoding, callback) {
    // ignore empty files
    if (file.isNull()) {
      callback();
      return;
    }

    // we don't do streams (yet)
    if (file.isStream()) {
      this.emit('error', new Error('gulp-resolverefs: Streaming not supported'));
      callback();
      return;
    }

    //console.log(1,file.path);

    if (!/\.yaml$/.test(file.path)) {
      callback();
      return;
    }

    var refsRoot = YAML.load(fs.readFileSync(file.path).toString());
    var refsOpt = {
      filter        : ['relative', 'remote'],
      location: file.path,
      loaderOptions : {
        processContent : function (res, callback) {
          callback(null, YAML.load(res.text));
        }
      }
    };

    jsonRefs.clearCache();

    jsonRefs.resolveRefs(refsRoot, refsOpt).then(function (results) {
      resolvedContent = JSON.stringify(results.resolved, null, 2);
      callback();
    });
  };


  const flush = function (callback) {
    if (!resolvedContent) {
      callback();
      return;
    }

    this.push(new File({
      path: distFileName,
      contents: new Buffer(resolvedContent)
    }));

    callback();
  };


  if (!distFile) {
    throw new Error('gulp-resolverefs: Missing file option');
  }

  if (typeof distFile === 'string') {
    distFileName = distFile;
  } else if (typeof distFile.path === 'string') {
    distFileName = path.basename(distFile.path);
  } else {
    throw new Error('gulp-resolverefs: Missing path in file options');
  }


  return through.obj(transform, flush);

};

