import browserify from 'browserify';
import babelify from 'babelify';
import del from 'del';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import gulp from 'gulp';
import loadPlugins from 'gulp-load-plugins';
const plugins = loadPlugins({
  lazy: false,
});

const babelOptions = {
  'stage': 1,
  'ignore': [
    '/node_modules/',
    '/dist/',
  ],
  'sourceMaps': 'inline',
  'loose': 'all',
  'optional': ['runtime'],
};

// import babelRegister from 'babel/register';
// babelRegister(babelOptions);
// import sourceMapSupport from 'source-map-support';
// sourceMapSupport.install();

import browserSyncCreator from 'browser-sync';
const browserSync = browserSyncCreator.create();

gulp.task('clean', (done) => {
  del(['./dist']).then(() => {
    done();
  });
});

gulp.task('lint', () => {
  return gulp
    .src(['./*.js', './src/**/*.js'])
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format());
});

gulp.task('test', ['lint']);

gulp.task('build:root', ['clean'], () => {
  return gulp
    .src('./src/*.*')
    .pipe(gulp.dest('./dist'));
});

gulp.task('build:js', ['clean'], () => {
  return browserify({
    entries: './src/js/index.js',
    debug: true,
  })
  .transform(babelify.configure(babelOptions))
  .bundle()
  .pipe(source('bundle.js'))
  .pipe(buffer())
  .pipe(plugins.sourcemaps.init({
    loadMaps: true,
  }))
  .pipe(plugins.sourcemaps.write('.'))
  .pipe(gulp.dest('./dist'));
});

gulp.task('build:css', ['clean'], () => {
  return gulp
    .src('./src/css/**/*.css')
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.autoprefixer({
      browsers: ['last 2 versions'],
    }))
    .pipe(plugins.concat('bundle.css'))
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build', ['build:root', 'build:js', 'build:css']);

gulp.task('watch', ['build'], () => {
  browserSync.init({
    server: {
      baseDir: './dist',
    },
  });
  gulp.watch(['./src/**'], ['build'], browserSync.reload);
});

gulp.task('default', ['build']);
