// requis
var gulp = require('gulp');

// plugins
var plugins = require('gulp-load-plugins')();
var gulpsync = require('gulp-sync')(gulp);
var del = require('del');
var critical = require('critical').stream;

// variables de chemins
var source = './src/';
var destination = './dist/';
var sass = 'css/styles.scss';
var css = 'css/*.css';
var js = 'js/*.js';
var html = '/**/*.html';
var php = '/**/*.php';
var font = 'fonts/**';
var img = '/**/*.{png,jpg,jpeg,gif,svg}';
var cssmin = 'css/styles.min.css';
var jsmin = 'js/global.min.js';

/* tâche "build" = "clean" + "css" + "html" + "php" + "js" + "img" + "font"
   ========================================================================== */

// tâche "clean" = del (destination)
gulp.task('clean', function() {
    return del(destination);
});

// tâche "css" = sass + csscomb + autoprefixer + cssbeautify (source -> destination)
gulp.task('css', function() {
    return gulp.src(source + sass)
        .pipe(plugins.sass())
        .pipe(plugins.csscomb())
        .pipe(plugins.autoprefixer())
        .pipe(plugins.cssbeautify())
        .pipe(gulp.dest(destination + 'css/'));
});

// tâche "html" = changed (source -> destination)
gulp.task('html', function() {
    return gulp.src(source + html)
        .pipe(plugins.changed(destination))
        .pipe(gulp.dest(destination))
});

// tâche "php" = changed (source -> destination)
gulp.task('php', function() {
    return gulp.src(source + php)
        .pipe(plugins.changed(destination))
        .pipe(gulp.dest(destination))
});

// tâche "js" = changed (source -> destination)
gulp.task('js', function() {
    return gulp.src(source + js)
        .pipe(plugins.changed(destination + 'js/'))
        .pipe(gulp.dest(destination + 'js/'))
});

// tâche "img" = imagemin (source -> destination)

gulp.task('img', function() {
    return gulp.src(source + img)
        .pipe(plugins.imagemin({
            progressive: true,
            interlaced: true,
            multipass: true
        }))
        .pipe(gulp.dest(destination));
});

// tâche "font" = (source -> destination)
gulp.task('font', function() {
    return gulp.src(source + font)
        .pipe(gulp.dest(destination + 'fonts/'))
});

// tâche "build"
gulp.task('build', gulpsync.sync(['clean', ['css', 'html', 'php', 'js', 'img', 'font']]));

/* tâche "prod" = "build" + "url" + "cssmin" + "jsmin" + "critical" + "htmlmin" + "cleancss" + "cleanjs"
   ========================================================================== */

// tâche "url" = useref (destination -> destination)

gulp.task('url', function() {
    return gulp.src([destination + html, destination + php])
        .pipe(plugins.useref())
		.pipe(gulp.dest(destination));
});

// tâche "cssmin" = uncss + csso (destination -> destination)
gulp.task('cssmin', function() {
    return gulp.src(destination + cssmin)
        .pipe(plugins.uncss({
            html: [destination + html]
		}))
        .pipe(plugins.csso())
        .pipe(gulp.dest(destination + 'css/'));
});

// tâche "jsmin" = uglify (destination -> destination)
gulp.task('jsmin', function() {
    return gulp.src(destination + jsmin)
        .pipe(plugins.uglify({
            output: {max_line_len: 400000}
		}))
        .pipe(gulp.dest(destination + 'js/'));
});

// tâche "critical" = critical (destination -> destination)
gulp.task('critical', function() {
    return gulp.src([destination + html, destination + php])
        .pipe(critical({
            base: destination,
            inline: true,
            height: 640,
            minify: true
        }))
        .pipe(gulp.dest(destination));
});

// tâche "htmlmin" = htmlmin (destination -> destination)
gulp.task('htmlmin', function() {
    return gulp.src([destination + html, destination + php])
        .pipe(plugins.htmlmin({
            removeComments: true,
			removeCommentsFromCDATA: true,
			removeCDATASectionsFromCDATA: true,
			collapseWhitespace: true,
			collapseBooleanAttributes: true,
			removeAttributeQuotes: true,
			removeRedundantAttributes: true,
			preventAttributesEscaping: true,
			useShortDoctype: true,
			removeEmptyAttributes: true,
			removeScriptTypeAttributes: true,
			removeStyleLinkTypeAttributes: true,
			removeOptionalTags: true,
			minifyURLs: true
		}))
        .pipe(gulp.dest(destination));
});

// tâche "cleancss" = del (destination -> destination)
gulp.task('cleancss', function() {
    return del([destination + css, '!' + destination + cssmin]);
});

// tâche "cleanjs" = del (destination -> destination)
gulp.task('cleanjs', function() {
    return del([destination + js, '!' + destination + jsmin]);
});

// tâche "prod"
gulp.task('prod', gulpsync.sync(['build', 'url', 'cssmin', 'jsmin', 'critical', 'htmlmin', 'cleancss', 'cleanjs']));

/* tâche "watch" = "css" + "html, php" + "js"
   ========================================================================== */

gulp.task('watch', function() {
    gulp.watch(source + 'css/*.scss', ['css']);
    gulp.watch([source + html, source + php], ['html', 'php']);
    gulp.watch(source + js, ['js']);
});

/* tâche "default" = "build"
   ========================================================================== */

gulp.task('default', ['build']);
