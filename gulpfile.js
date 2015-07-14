'use strict';

var gulp = require('gulp'),
  mocha = require('gulp-mocha'),
  jsdoc = require('gulp-jsdoc'),
  watch = require('gulp-watch'),
  batch = require('gulp-batch');

var paths = {
  src: ['./src/**/*.js'],
  test: ['./test/**/*.js'],
  docs: './documentation'
};

gulp.task('default', ['testonce', 'docs']);

gulp.task('test', function() {
  watch(paths.test, batch(function(events, done) { // jshint ignore:line
    gulp.start('testonce', done);
  }));
});

gulp.task('testonce', function() {
  return gulp.src(paths.test, { read: false })
    .pipe(mocha({
      // grep: '.*',
      reporter: 'spec',
      bail: false,
    }));
});

gulp.task('doc-watch', function() {
  watch(paths.src, batch(function(events, done) { // jshint ignore:line
    gulp.start('docs', done);
  }));
});

gulp.task('docs', function() {
  return gulp.src(paths.src.concat(['README.md']))
    .pipe(jsdoc(paths.docs));
});
