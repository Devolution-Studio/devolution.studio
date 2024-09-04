require('dotenv').config();

const gulp = require('gulp'),
    concat = require('gulp-concat'),
    concatCss = require('gulp-concat-css'),
    cleanCSS = require('gulp-clean-css'),
    uglify = require('gulp-uglify'),
    install = require('gulp-install'),
    rename = require('gulp-rename'),
    cleaner = require('gulp-clean'),
    nodemon = require('gulp-nodemon'),
    gulpShowdown = require('gulp-showdown');

gulp.task('clean', () => {
    return gulp.src('./dist/', { allowEmpty: true }).pipe(cleaner());
});

gulp.task('copy:assets', function () {
    return gulp
        .src('./public/**/*', {
            ignore: [
                './public/**/main.css',
                './public/**/main.js',
                './public/**/*.{svg,png,jpg,gif,ttf,woff,eof,pdf}',
            ],
        })
        .pipe(gulp.dest('./dist/public/'));
});

gulp.task('copy:files', function () {
    return gulp
        .src('./public/**/*.{svg,png,jpg,gif,ttf,woff,woff2,eot,pdf}', {
            encoding: false,
        })
        .pipe(gulp.dest('./dist/public/'));
});

gulp.task('npm-install', () => {
    return gulp
        .src('./dist/package.json')
        .pipe(install({ npm: '--production --omit=dev' }));
});

gulp.task('optimize:js', () => {
    return gulp
        .src(['./public/js/main.js'])
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/public/js/'));
});

gulp.task('optimize:css', () => {
    return gulp
        .src(['./public/css/vendors.css', './public/css/main.css'])
        .pipe(concatCss('main.css'))
        .pipe(cleanCSS())
        .pipe(gulp.dest('./dist/public/css/'));
});

gulp.task('copy:server', () => {
    return gulp
        .src('./src/**/*.js')
        .pipe(uglify())
        .pipe(
            rename(function (path) {
                path.extname = '.js';
            })
        )
        .pipe(gulp.dest('./dist/server/'));
});

gulp.task('copy:views', () => {
    return gulp.src('./views/**/*.handlebars').pipe(gulp.dest('./dist/views/'));
});

gulp.task('render:md-articles', async () => {
    gulp.src('./public/articles/*.md')
        .pipe(gulpShowdown({ table: true }))
        .pipe(
            rename(function (path) {
                path.extname = '.handlebars';
            })
        )
        .pipe(gulp.dest('./dist/views/partials'));
});

gulp.task('copy:config-files', () => {
    return gulp
        .src(['./.env', './package*.json'], { allowEmpty: true })
        .pipe(gulp.dest('./dist/'));
});

gulp.task('watch', async function () {
    gulp.watch('./public/**/*', gulp.parallel('reload'));
    gulp.watch('./views/**/*', gulp.parallel('copy:views'));
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
            config: './nodemon.json',
        })
            .on('start', () => {
                console.log('Démarrage du serveur...');
            })
            .on('restart', () => {
                console.log('Redémarrage du serveur...');
            })
    );
});

gulp.task('reload', () => {
    gulp.series(
        'copy:assets',
        'optimize:js',
        'optimize:css',
        'render:md-articles'
    );
});

gulp.task(
    'build',
    gulp.series(
        'clean',
        'copy:assets',
        'copy:files',
        'copy:config-files',
        'optimize:js',
        'optimize:css',
        'copy:server',
        'copy:views',
        'render:md-articles',
        'npm-install'
    )
);

gulp.task(
    'build-light',
    gulp.series(
        'copy:assets',
        'copy:files',
        'copy:config-files',
        'optimize:js',
        'optimize:css',
        'copy:server',
        'copy:views',
        'render:md-articles'
    )
);

gulp.task(
    'refresh',
    gulp.series(
        'copy:assets',
        'copy:files',
        'copy:config-files',
        'optimize:js',
        'optimize:css',
        'copy:server',
        'copy:views',
        'render:md-articles'
    )
);
