require('dotenv').config();

const path = require('path'),
    gulp = require('gulp'),
    concat = require('gulp-concat'),
    concatCss = require('gulp-concat-css'),
    cleanCSS = require('gulp-clean-css'),
    uglify = require('gulp-uglify'),
    minify = require('gulp-json-minify'),
    install = require('gulp-install'),
    rename = require('gulp-rename'),
    cleaner = require('gulp-clean'),
    nodemon = require('gulp-nodemon'),
    vinyl = require('vinyl'),
    gulpShowdown = require('gulp-showdown');

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
                './public/**/*.{svg,png,jpg,gif,ttf,woff,eof}',
            ],
        })
        .pipe(gulp.dest('./dist/public/'));
});

gulp.task('copy:files', function () {
    return gulp
        .src('./public/**/*.{svg,png,jpg,gif,ttf,woff,woff2,eot}', {
            encoding: false,
        })
        .pipe(gulp.dest('./dist/public/'));
});

gulp.task('copy:npm-package', () => {
    return gulp
        .src('./package*.json')
        .pipe(minify())
        .pipe(gulp.dest('./dist/'));
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

gulp.task('copy:env', () => {
    return gulp.src('./.env').pipe(gulp.dest('./dist/'));
});

gulp.task('watch', async function () {
    process.chdir('./dist');

    gulp.watch('../public/**/*', gulp.parallel('reload'));
    gulp.watch(
        '../src/**/*.js',
        gulp
            .src('../src/**/*.js')
            .pipe(
                rename(function (path) {
                    path.extname = '.js';
                })
            )
            .pipe(gulp.dest('./server/'))
    );
    gulp.parallel(
        nodemon({
            script: './server/server.js',
        })
    );

    cb();
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
        'init:logs-folder',
        'copy:assets',
        'copy:files',
        'copy:env',
        'optimize:js',
        'optimize:css',
        'copy:server',
        'copy:views',
        'render:md-articles',
        'copy:npm-package',
        'npm-install'
    )
);
