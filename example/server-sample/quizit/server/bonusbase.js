var bonusbasequery = {};

var dummybonusdata = [
	{
		"player_id":"745105835527392",
		"target_id":"770989079621315",
		"question":"Do you like Indonesian food?",
		"answer":"Y",
		"tag":"I"
	},
	{
		"player_id":"767253243336231",
		"target_id":"745105835527392",
		"question":"Do you read Manga?",
		"amswer":"N",
	},
	{
		"player_id":"767253243336231",
		"target_id":"745105835527392",
		"question":"Do you play tennis?",
	}
];

bonusbasequery.init = function(req,res,nwext){
	req.db.bonusbase.drop();
	req.db.bonusbase.insert(dummybonusdata,function(error,bonus){
		if (error) return next(error);
		if (!bonus) return next(new Error('Failed to save.'));
		console.log("All bonus challenges Successfully Saved");
	})
};

bonusbasequery.getbonusForUser = function(req,res,next){
	var db = req.db.bonusbase;
	var url = require('url');
  	var url_parts = url.parse(req.url, true);
  	var query = url_parts.query;

	db.find({
		$or: [
			{"player_id":query.user_id},
			{"target_id":query.user_id}
		],
		tag: {$ne:"I"}
	}).toArray(function(error,data){
		if (error) return next(error);
		res.send(data);
	});
};

bonusbasequery.getbonusForPlayer = function(req,res,next){
	var db = req.db.bonusbase;
	var player_id = req.body.player_id;

	db.find({
		"player_id":player_id,
	}).toArray(function(error,data){
		if (error) return next(error);
		res.send(data);
	});
};

bonusbasequery.getbonusForTarget = function(req,res,next){
	var db = req.db.bonusbase;
	var target_id = req.body.target_id;

	db.find({
		"target_id":target_id,
	}).toArray(function(error,data){
		if (error) return next(error);
		res.send(data);
	});
};

bonusbasequery.addbonusQuestion = function(req,res,next){
	console.log("addbonus");
	var db = req.db.bonusbase;

	db.insert({
		"player_id": req.body.player_id,
		"target_id": req.body.target_id,
		"question": req.body.question
	}, function(err, data){
		res.send("bonus question added");
	});
};

bonusbasequery.updatebonus = function(req,res,next){
	console.log("addbonus");
	var db = req.db.bonusbase;
	for(var i = 0; i < req.body.length; i++){
		var reqbody = req.body[i];
		if(!reqbody.tag || reqbody.tag !== "I"){
			db.update({
				"player_id": reqbody.player_id,
				"target_id": reqbody.target_id,
				"question": reqbody.question
			},{
				$set: {"answer": reqbody.answer}
			}, function(err, data){
				res.send("bonus answer updated");
			});
		} else {
			db.update({
				"player_id": reqbody.player_id,
				"target_id": reqbody.target_id,
				"question": reqbody.question
			},{
				$set: {tag:"I"}
			}, function(err, data){
				res.send("bonus ignored");
			});
		}
	}
};


module.exports = bonusbasequery;