var express = require('express');
var router = express.Router();

function c(name) {
	return require('../app/controllers/' + name);
}

/* 
 * ------------------------------------
 * Routes
 * ------------------------------------
 */

router.get('/', c('home'));

router.get('/play', c('play'));

/* 
 * ------------------------------------
 */

module.exports = router;
