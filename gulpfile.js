const gulp = require('gulp');
const sass = require('gulp-sass');
const eslint = require('gulp-eslint');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const htmlmin = require('gulp-htmlmin');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();
const del = require('del');

// Lint JavaScript
gulp.task('lint', function() {
    return gulp.src(['dev/js/app/**/*.js', 'dev/sw.js'])
               .pipe(eslint())
               .pipe(eslint.failAfterError())
               .pipe(browserSync.stream());
});

// Minify HTML and inline scripts and CSS
gulp.task('minifyhtml', function() {
  return gulp.src('dev/**/*.html')
             .pipe(htmlmin({
               removeComments: true,
               collapseWhitespace: true
             }))
             .pipe(gulp.dest('dist'));
});

// Compile Sass
gulp.task('sass', function () {
  return gulp.src('dev/scss/*.scss')
             .pipe(sass({outputStyle: 'compressed'}))
             .pipe(gulp.dest('dist/css'));
});

// Compile Sass
gulp.task('sass-serve', function () {
  return gulp.src('dev/scss/*.scss')
             .pipe(sass.sync().on('error', sass.logError))
             .pipe(gulp.dest('dist/css'))
             .pipe(browserSync.stream());
});

// Move library files
gulp.task('movelibjs', function() {
  return gulp.src('bower_components/angular/angular.min.js')
    .pipe(rename('angular.js'))
    .pipe(gulp.dest('dist/js/lib'));
});

gulp.task('movelibjs-serve', function() {
  return gulp.src('bower_components/angular/angular.js')
    .pipe(gulp.dest('dist/js/lib'));
});

// Minify JavaScript
gulp.task('minifyjs', function() {
  return gulp.src(['bower_components/fetch/**/*.js', 'dev/js/lib/**/*.js', 'dev/js/app/**/*.js'])
             .pipe(concat('app.js'))
             .pipe(babel({presets: ['es2015']}))
             .pipe(uglify())
             .pipe(gulp.dest('dist/js/'));
});

// Concat js but don't minify for dev
gulp.task('js-serve', function() {
  return gulp.src(['bower_components/fetch/**/*.js', 'dev/js/lib/**/*.js', 'dev/js/app/**/*.js'])
             .pipe(concat('app.js'))
             .pipe(babel({presets: ['es2015']}))
             .pipe(gulp.dest('dist/js/'))
             .pipe(browserSync.stream());
});

// Deal with the service worker file separately since it lives in the root
gulp.task('sw-js', function() {
  return gulp.src('dev/sw.js')
             .pipe(babel({presets: ['es2015']}))
             .pipe(uglify())
             .pipe(gulp.dest('dist'));
});

gulp.task('sw-js-serve', function() {
  return gulp.src('dev/sw.js')
             .pipe(babel({presets: ['es2015']}))
             .pipe(gulp.dest('dist'))
             .pipe(browserSync.stream());
});

// Just move HTML on change
gulp.task('html-serve', function() {
  return gulp.src('dev/**/*.html')
             .pipe(gulp.dest('dist/'));
});

// Move images with PNG or JPG extension
gulp.task('moveimages', function() {
  return gulp.src('dev/img/**/*.+(png|jpg)')
             .pipe(gulp.dest('dist/img/'));
});

gulp.task('clean', function(cb) {
  del(['dist/*']);
  cb();
});

// Do everything by default
gulp.task('default', ['serve']);

// Watch HTML, Sass, JavaScript files and update on change
// Since this is for dev, we don't minify the js for debugging
gulp.task('serve', function() {

  gulp.start('html-serve', 'js-serve', 'sw-js-serve', 'sass-serve', 'movelibjs-serve', 'moveimages');

  browserSync.init({
      server: './dist'
  });

  // Watch Sass files and update
  gulp.watch('dev/scss/*.scss', ['sass-serve']);

  // Watch js files, lint and move
  gulp.watch('dev/js/lib/*.js', ['lint', 'js-serve']);
  gulp.watch('dev/sw.js', ['lint', 'sw-js-serve']);

  gulp.watch('dev/**/*.html', ['html-serve']).on('change', browserSync.reload);
});

// Prepare for actual dist, clean the directory, then build and minify
// everything.
gulp.task('build', ['clean'], function() {
  gulp.start('moveimages', 'movelibjs', 'sw-js', 'minifyhtml', 'sass', 'minifyjs');
});
