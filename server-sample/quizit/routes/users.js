var express = require('express');
var router = express.Router();
var userbase = require('../server/userbase');


/* GET users listing. */
router.get('/',userbase.getProfile);
router.post('/userInit', userbase.postProfile)

module.exports = router;