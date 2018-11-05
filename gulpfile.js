const gulp = require("gulp");
const gulpAutoPrefixer = require('gulp-autoprefixer');
const gulpCleanCSS = require("gulp-clean-css");
const gulpConcat = require("gulp-concat");
const gulpSass = require("gulp-sass");
const gulpSrcMaps = require('gulp-sourcemaps');

const tasks = ["sass", "optomize-css", "minify-css"];

gulp.task("sass", function() {
  return gulp.src("./scss/*.scss")
    .pipe(gulpSass().on("error", gulpSass.logError))
    .pipe(gulp.dest("./css"));
});

gulp.task("optomize-css", ["sass"], function() {
  return gulp.src("./css/*.css")
    .pipe(gulpSrcMaps.init())
    .pipe(gulpAutoPrefixer())
    .pipe(gulpConcat("bundle.css"))
    .pipe(gulpSrcMaps.write("."))
    .pipe(gulp.dest("./dist/css"));
})

gulp.task("minify-css", ["optomize-css"], function() {
  const cleanCssConfig = {
    compatibility: "ie8",
  };
  return gulp.src("./dist/css/*.css")
    .pipe(gulpCleanCSS(cleanCssConfig))
    .pipe(gulp.dest("./dist/css/"));
});

gulp.task("sass:watch", function() {
  gulp.watch("./scss/*.scss", tasks);
});

gulp.task('default', function () {
  const defaultTasks = tasks;
  defaultTasks.push("sass:watch");
  gulp.start(defaultTasks);
});
