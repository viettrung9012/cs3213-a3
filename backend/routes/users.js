var express = require('express');
var router = express.Router();
var userbase = require('../server/userbase');

router.get('/',userbase.getUserData);
router.post('/save', userbase.saveUserData);

module.exports = router;
