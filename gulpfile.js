// Install with:  npm install gulp-util  --no-bin-link


var gulp = require('gulp');
var source = require('vinyl-source-stream'); // Used to stream bundle for further handling
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var concat = require('gulp-concat');
var babelify = require('babelify');
var uglify = require('gulp-uglify');
var notify = require('gulp-notify');
var streamify = require('gulp-streamify');

// gulp.task('browserifyWatchless', function(){
//   browserify({
//     entries: ['./src/main.jsx'],
//     transform: [babelify]
//   })
//     .bundle()
//     .pipe(source('react-structured-filter.js'))
//     .pipe(streamify(uglify()))
//     .pipe(gulp.dest('./build'));
// });
// // This code is largely from: http://christianalfoni.github.io/javascript/2014/08/15/react-js-workflow.html
// gulp.task('browserify', function() {
// browserify({
//     entries: ['./src/main.js'], // Only need initial file, browserify finds the deps
//     transform: [babelify], // We want to convert JSX to normal javascript
//     debug: true, // Gives us sourcemapping
//     cache: {}, packageCache: {},
//     // fullPaths: true, // Requirement of watchify
//     paths: ['./node_modules','./src']
//   })
//   .bundle() // Create the initial bundle when starting the task
//   .pipe(source('react-structured-filter.js'))
//   .pipe(gulp.dest('./build'));
// });
gulp.task('build', function() {
  browserify({
    entries: ['./src/main.js'],
    transform: [babelify],
    debug: true
  })
  .bundle()
  .pipe(source('structured-filter.js'))
  //.pipe(streamify(uglify()))
  .pipe(gulp.dest('./build'));
});

// Just running the two tasks
gulp.task('default', ['build']);
