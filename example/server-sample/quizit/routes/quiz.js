var express = require('express');
var router = express.Router();
var questionbase = require('../server/questionbase');
var userbase = require('../server/userbase');

router.get('/',userbase.getQuestions);
router.post('/contribute',questionbase.contributeQuestion);
router.get('/bonus',questionbase.getBonus);


module.exports = router;