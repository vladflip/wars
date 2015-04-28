var gulp = require('gulp'),
	nodemon = require('gulp-nodemon'),
	stylus = require('gulp-stylus'),
	notify = require('gulp-notify'),
	rename = require('gulp-rename'),
	coffeeify = require('gulp-coffeeify'),
	coffee = require('gulp-coffee');


var sDest = 'resources/stylus/';

var cDest = 'resources/coffee/';


gulp.task('default', [

	'stylus', 
	'coffee', 
	'controllers',
	'nodemon'

	], function(){

	gulp.watch(sDest + '**/*', ['stylus']);

	gulp.watch(cDest + '**/*', ['coffee']);

	gulp.watch('app/coffee/controllers/**/*', ['controllers']);

});

function showError(e) {
	console.log(e.toString());

	this.emit('end');
}

gulp.task('stylus', function(){
	return gulp.src(sDest + 'index.styl')
		.pipe(stylus())
		.on('error', showError)
		.pipe(notify('Compiled : Stylus'))
		.pipe(rename('style.css'))
		.pipe(gulp.dest('public/css'));
});

gulp.task('coffee', function(){
	return gulp.src(cDest + 'index.coffee')
		.pipe(coffeeify())
		.on('error', showError)
		.pipe(notify('Compiled : Coffee'))
		.pipe(rename('script.js'))
		.pipe(gulp.dest('public/js'));
});

gulp.task('controllers', function(){
	return gulp.src('app/coffee/controllers/*')
		.pipe(coffee())
		.on('error', showError)
		.pipe(notify('Compiled : Coffee'))
		.pipe(gulp.dest('app/controllers'));
});

gulp.task('nodemon', function(){
	nodemon({
		script: './bin/www',
		ext: 'js html'
	});
});