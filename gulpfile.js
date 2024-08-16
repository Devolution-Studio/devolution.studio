require('dotenv').config();

const fs = require('fs'),
    path = require('path'),
    gulp = require('gulp'),
    concat = require('gulp-concat'),
    concatCss = require('gulp-concat-css'),
    cleanCSS = require('gulp-clean-css'),
    uglify = require('gulp-uglify'),
    minify = require('gulp-json-minify'),
    install = require('gulp-install'),
    rename = require('gulp-rename'),
    cleaner = require('gulp-clean'),
    tap = require('gulp-tap'),
    nodemon = require('gulp-nodemon'),
    newfile = require('gulp-file'),
    vinyl = require('vinyl');

const logsFolderPath = path.resolve(
    __dirname,
    './dist/',
    path.dirname(process.env.LOG_FILE)
);

const logsFilePath = path.resolve(__dirname, './dist/', process.env.LOG_FILE);

gulp.task('clean', () => {
    return gulp.src('./dist/', { allowEmpty: true }).pipe(cleaner());
});

gulp.task('copy:assets', function () {
    return gulp
        .src('./public/**/*', {
            ignore: [
                './public/**/main.css',
                './public/**/main.js',
                './public/**/*.{svg,png,jpg,gif}',
            ],
        })
        .pipe(gulp.dest('./dist/public/'));
});

gulp.task('copy:images', function () {
    return gulp
        .src('./public/**/*.{svg,png,jpg,gif}', { encoding: false })
        .pipe(gulp.dest('./dist/public/'));
});

gulp.task('copy:npm-package', () => {
    return (
        gulp
            .src('./package*.json')
            //.pipe(minify())
            .pipe(gulp.dest('./dist/'))
    );
});

gulp.task('npm-install', () => {
    return gulp
        .src('./dist/package.json')
        .pipe(install({ npm: '--production' }));
});

gulp.task('optimize:js', () => {
    return (
        gulp
            .src(['./public/js/*.js'])
            .pipe(concat('main.js'))
            //.pipe(uglify())
            .pipe(gulp.dest('./dist/public/js/'))
    );
});

gulp.task('optimize:css', () => {
    return (
        gulp
            .src('./public/css/*.css')
            //.pipe(concatCss('main.css'))
            //.pipe(cleanCSS())
            .pipe(gulp.dest('./dist/public/css/'))
    );
});

gulp.task('copy:server', () => {
    return (
        gulp
            .src('./src/**/*.js')
            //.pipe(uglify())
            .pipe(
                rename(function (path) {
                    path.extname = '.js';
                })
            )
            .pipe(gulp.dest('./dist/server/'))
    );
});

gulp.task('init:logs-folder', () => {
    var src = require('stream').Readable({ objectMode: true });
    src._read = function () {
        this.push(
            new vinyl({
                cwd: '',
                base: './',
                path: './',
                contents: Buffer.from('', 'utf-8'),
            })
        );
        this.push(null);
    };

    return src.pipe(gulp.dest(logsFilePath));
});

gulp.task('copy:views', () => {
    return gulp.src('./views/**/*.handlebars').pipe(gulp.dest('./dist/views/'));
});

gulp.task('copy:env', () => {
    return gulp.src('./.env').pipe(gulp.dest('./dist/'));
});

gulp.task('watch', function () {
    gulp.watch('./public/**/*', gulp.parallel('reload'));
    gulp.watch(
        './src/**/*.js',
        gulp
            .src('./src/**/*.js')
            .pipe(
                rename(function (path) {
                    path.extname = '.js';
                })
            )
            .pipe(gulp.dest('./dist/server/'))
    );
    gulp.parallel(
        nodemon({
            script: './dist/server/server.js',
        })
    );
});

gulp.task('reload', () => {
    gulp.series('copy:assets', 'optimize:js', 'optimize:css');
});

gulp.task(
    'build',
    gulp.series(
        'clean',
        'init:logs-folder',
        'copy:assets',
        'copy:images',
        'copy:env',
        'optimize:js',
        'optimize:css',
        'copy:server',
        'copy:views',
        'copy:npm-package',
        'npm-install'
    )
);
