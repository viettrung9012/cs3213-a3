var userbase = require("./userbase");
var bonusbase = require("./bonusbase");
var questionbase = require("./questionbase");
var challengebase = require("./challengebase");
var interestbase = require("./interestbase");

var dummyDB = {};

dummyDB.init = function(req,res,next){
	userbase.init(req,res,next);
	bonusbase.init(req,res,next);
	questionbase.init(req, res, next);
	challengebase.init(req,res, next);
	interestbase.initAll(req, res, next);
	res.send("Check console for init info");
};

module.exports = dummyDB;