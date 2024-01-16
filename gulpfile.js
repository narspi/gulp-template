import gulp from "gulp";
import panini from "panini";
import browserSync from "browser-sync";
import concat from "gulp-concat";
import sourcemaps from "gulp-sourcemaps";
import * as dartSass from "sass";
import gulpSass from "gulp-sass";
import cleanCSS from "gulp-clean-css";
import gulpif from "gulp-if";

const isDevelopment = process.env.PRODUCTION === "development";
const isTunnel = process.env.TUNNEL === "run";

const scss = gulpSass(dartSass);

const { src, dest, watch, series } = gulp;
const sync = browserSync.create();

const htmlInclude = () => {
  panini.refresh();
  return src("src/html/pages/**/*.html")
    .pipe(
      panini({
        root: "src/html/pages",
        layouts: "src/html/layouts",
        partials: "src/html/partials",
        helpers: "src/html/helpers/",
        data: "src/html/data/",
      })
    )
    .pipe(dest("dist/"))
    .pipe(sync.stream());
};

const createCss = () => {
  return src("src/scss/**/*.scss")
    .pipe(gulpif(isDevelopment, sourcemaps.init()))
    .pipe(
      scss({
        outputStyle: "expanded",
      })
    )
    .pipe(
      cleanCSS({
        format: "beautify",
      })
    )
    .pipe(gulpif(isDevelopment, sourcemaps.write()))
    .pipe(dest("dist/css"))
    .pipe(sync.stream());
};

const transportFonts = () => {
  return src("./src/fonts/**/*.*").pipe(dest("dist/fonts"));
};

const transportImg = () => {
  return src("./src/img/**/*.*").pipe(dest("dist/img"));
};

const server = () => {
  sync.init({
    server: "./dist",
    tunnel: isTunnel ? true : null,
  });
  watch("./src/fonts/**/*.*", transportFonts);
  watch("./src/img/**/*.*", transportImg);
  watch("./src/html/**/*.html", htmlInclude);
  watch("./src/scss/**/*.scss", createCss);
};

const buildServer = () => {
  sync.init({
    server: "./dist",
    tunnel: true,
  });
};

const defaultTask = series(
  htmlInclude,
  createCss,
  transportFonts,
  transportImg,
  server
);


const buildTask = series(htmlInclude, createCss, transportFonts, transportImg);

const startServer = series(
    buildTask,
    buildServer
);

export { defaultTask as default, buildTask as build, startServer as start };
