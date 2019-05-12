/*
 * gulpfile.js
 */

var gulp = require("gulp");
var sass = require("gulp-sass");
var browserSync = require("browser-sync").create();
var nodemon = require("gulp-nodemon");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");

gulp.task("nodemon", function(cb) {
  var started = false;
  return nodemon({
    script: "index.js"
  }).on("start", function() {
    if (!started) {
      cb();
      started = true;
    }
  });
});

gulp.task(
  "browserSync",
  gulp.parallel("nodemon", function() {
    browserSync.init(null, {
      proxy: "http://localhost:3000",
      files: ["public/**/*.*"],
      browser: "google chrome",
      port: 5000
    });
  })
);

gulp.task("sass", function() {
  return gulp
    .src("public/scss/main.scss")
    .pipe(sass())
    .pipe(postcss([autoprefixer({ browsers: ["last 2 version"] })]))
    .pipe(gulp.dest("public/css"))
    .pipe(
      browserSync.reload({
        stream: true
      })
    );
});

gulp.task("watch", function() {
  gulp.watch("public/scss/**/*.scss", gulp.series("sass"));
  gulp.watch("views/**/*.*").on("change", browserSync.reload);
  gulp.watch("routes/*.*").on("change", browserSync.reload);
  gulp.watch("./data.json").on("change", browserSync.reload);
});

gulp.task(
  "default",
  gulp.parallel("watch", "sass", "browserSync", function(done) {
    done();
  })
);
