// File: Gulpfile.js
'use strict';

var gulp                = require('gulp'),
    connect             = require('gulp-connect'),
    historyApiFallback  = require('connect-history-api-fallback'),

    // preocesa y comprime archivos de stylus a css
    stylus              = require('gulp-stylus'),
    nib                 = require('nib'),

    // inyectarán las librerías
    inject              = require('gulp-inject'),
    wiredep             = require('wiredep').stream,

    // Busca errores en el JS
    jshint              = require('gulp-jshint'),
    stylish             = require('jshint-stylish'),

    // Concatenación de ficheros JS y CSS
    gulpif              = require('gulp-if'),
    minifyCss           = require('gulp-minify-css'),
    useref              = require('gulp-useref'),
    uglify              = require('gulp-uglify'),

    // css que no utilizaremos
    uncss               = require('gulp-uncss');



// Servidor web de desarrollo
gulp.task('server', function() {
  connect.server({
  root: './app',
  hostname: 'localhost',
  port: 5000,
  livereload: true,
  middleware: function(connect, opt) {
      return [ historyApiFallback() ];
    }
 });
});

// Preprocesa archivos Stylus a CSS y recarga los cambios
gulp.task('css', function() {
  gulp.src('./app/stylesheets/main.styl')
  .pipe(stylus({
    use: nib(),
    compress: true }))
  .pipe(gulp.dest('./app/stylesheets'))
  .pipe(connect.reload());
});


// Busca errores en el JS y nos los muestra por pantalla
gulp.task('jshint', function() {
  return gulp.src('./app/scripts/**/*.js')
  .pipe(jshint('.jshintrc'))
  .pipe(jshint.reporter('jshint-stylish'))
  .pipe(jshint.reporter('fail'));
});

// Busca en las carpetas de estilos y javascript los archivos que hayamos creado
// para inyectarlos en el index.html
gulp.task('inject', function() {
  var sources = gulp.src(['./app/scripts/**/*.js','./app/stylesheets/**/*.css']);
  return gulp.src('index.html', {cwd: './app'})
  .pipe(inject(sources, {
    read: false,
    ignorePath: '/app'
  }))
  .pipe(gulp.dest('./app'));
});

// Inyecta las librerias que instalemos vía Bower
gulp.task('wiredep', function () {
  gulp.src('./app/index.html')
  .pipe(wiredep({
    directory: './app/lib'
  }))
  .pipe(gulp.dest('./app'));
});


// Recarga el navegador cuando hay cambios en el HTML
gulp.task('html', function() {
  gulp.src('./app/**/*.html')
  .pipe(connect.reload());
});


// Concatenación de ficheros JS y CSS
gulp.task('compress', function() {
  gulp.src('./app/index.html')
  .pipe(useref.assets())
  .pipe(gulpif('*.js', uglify({mangle: false })))
  .pipe(gulpif('*.css', minifyCss()))
  .pipe(gulp.dest('./dist'));
});


// Servidor web en produccion
gulp.task('produccion-server', function() {
  connect.server({
  root: './dist',
  hostname: 'localhost',
  port: 5000,
  livereload: true,
  middleware: function(connect, opt) {
      return [ historyApiFallback() ];
    }
 });
});


// remover el CSS no utilizado
gulp.task('uncss', function() {
  gulp.src('./dist/css/style.min.css')
  .pipe(uncss({
    html: ['./app/index.html']
  }))
  .pipe(gulpif('*.css', minifyCss({
    keepSpecialComments:0,
    keepBreaks:false
  })))
  .pipe(gulp.dest('./dist/css'));
});

// Copia el contenido de los estáticos e index.html al directorio
// de producción sin tags de comentarios
gulp.task('copy', function() {
  gulp.src('./app/index.html')
  .pipe(useref())
  .pipe(gulp.dest('./dist'));
  gulp.src('./app/lib/fontawesome/fonts/**')
  .pipe(gulp.dest('./dist/fonts'));
});

// Vigila cambios que se produzcan en el código
// y lanza las tareas relacionadas
gulp.task('watch', function() {
  gulp.watch(['./app/**/*.html'], ['html']);
  gulp.watch(['./app/stylesheets/**/*.styl'], ['css', 'inject']);
  gulp.watch(['./app/scripts/**/*.js'], ['jshint', 'inject']);
  gulp.watch(['./bower.json'], ['wiredep']);
});

// Remplazar la url correcto de las fuentes en el css
// var replace = require('gulp-replace');
// gulp.task('replaceurlfont', function(){
//   gulp.src(['./dist/css/style.min.css'])
//     .pipe(replace('url(css/', 'url(../'))
//     .pipe(gulp.dest('./dist/css'));
// });

// por defecto en desarrollo
gulp.task('default', ['server', 'inject', 'wiredep', 'watch']);

// para produccion
gulp.task('produccion', ['compress', 'copy']);

// css compress
gulp.task('csscompress', ['uncss']);
