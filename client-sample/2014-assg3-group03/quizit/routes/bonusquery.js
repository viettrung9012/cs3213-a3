var express = require('express');
var router = express.Router();
var bonusbase = require('../server/bonusbase');

router.post('/question',bonusbase.addbonusQuestion);
router.post('/response',bonusbase.updatebonus);
router.get('/',bonusbase.getbonusForUser);
router.get('/target',bonusbase.getbonusForTarget);
router.get('/player', bonusbase.getbonusForPlayer);

module.exports = router;