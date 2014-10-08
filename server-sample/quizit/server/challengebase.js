var challengebase = {};

var challengeDummyData = [
	{ 
		"player_id" : "767253243336231", 
		"target_id" : "745105835527392", 
    "bonus" : [{
      "score" : 80,
      "time" : Date()
    }],
    "score_max":80
	},

	{ 
		"player_id" : "745105835527392", 
		"target_id" : "770989079621315",
    "bonus" : [{
      "score" : 50,
      "time" : Date()
    }],
    "score_max":50
	},

	{
		"player_id" : "767253243336231", 
		"target_id" : "770989079621315", 
    "bonus" : [{
      "score" : 60,
      "time" : Date()
    }],
    "score_max":60
	},
    {
    "target_id" : "770989079621315", 
    "player_id" : "767253243336231", 
    "bonus" : [{
      "score" : 40,
      "time" : Date()
    }],
    "score_max":60
  }
];

challengebase.init = function(req,res,next){
	req.db.challengebase.drop();
	req.db.challengebase.insert(challengeDummyData, function(error,bonus){
		if (error) return next(error);
		if (!bonus) return next(new Error('Failed to save.'));
		console.log("All challenge data Successfully Saved");
	})
}

challengebase.recordChallenge = function(req, res, next){
  if(!req.body || !req.body.player_id || !req.body.target_id || !req.body.score) 
    return next(new Error('No challenges data provided'));
  newScore = parseInt(req.body.score);
  req.db.challengebase.update({
    player_id: req.body.player_id,
    target_id: req.body.target_id
  },{
      $push:{
        bonus:{
          score: newScore,
          time: Date()
        }
      },
  },{
    upsert:true
  },
   function(error, challenge) {
      if (error) return next(error);
      if (!challenge) return next(new Error('Failed to save challenges.'));
        req.db.challengebase.update({
        player_id: req.body.player_id,
        target_id: req.body.target_id,
        $or: [{score_max: {$lt: newScore}},
        {score_max: {$exists: false}}]
      },{
        $set:{
          score_max: newScore
        }
    },function(err, challenge) {
  });
      res.send("added challenges");
      console.info('Added %s with id=%s', challenge.score, challenge._id);
  });


};

challengebase.listLeaderboard = function(req, res, next){
  var allChallenges = [];

  req.db.challengebase.aggregate(
  {
    $group: {
      _id: "$player_id",
      total_maxscore:{$sum: "$score_max"},
      total_quiz: {$sum:1}
    }
  },
  {
    $sort:{total_maxscore:-1},
  },
  {
    $limit: 10
  }, function(error, leaderboard){
    if(error) return next(error);
    res.send(leaderboard);      
  });
}


challengebase.getYouKnowBest = function(req, res, next) {
  var url = require('url');
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  req.db.challengebase.find({player_id: query.player_id}).
    sort({"score": -1}).limit(1).toArray(function(error, challengebase){
    if (error) return next(error);
    res.send(challengebase);
  })
}

challengebase.getKnowYouBest = function(req, res, next) {
  var url = require('url');
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  req.db.challengebase.find({target_id: query.target_id}).
    sort({"score": -1}).limit(1).toArray(function(error, challengebase){
    if (error) return next(error);
    res.send(challengebase);
  })
}

challengebase.listHistory = function(req, res, next) {
  var url = require('url');
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  req.db.challengebase.find({player_id: query.userID}).sort({"score": -1}).toArray(function(error, challengebase){
    if (error) return next(error);
    res.send(challengebase);
  }) 
}

module.exports = challengebase;