var userbasequery = {}

var dummyusers = [
{
	"userID":"0293793741",
	"projectID": 1,
	"projectName": "Project 1",
	"projectData": ["a","b","c"]
}];


userbasequery.init = function(req,res,next){
	req.db.userbase.drop();
	req.db.userbase.insert(dummyusers,function(error,users){
		if (error) return next(error);
		if (!users) return next(new Error('Failed to initialize database.'));
		console.log("Database created.");
	});
};

userbasequery.getUserData = function(req, res, next) {
	req.db.userbase.find({"id":req.body[0]}).toArray(function(error,data){
		res.send(data);
	});
}

userbasequery.saveUserData = function(req, res, next){
	var req_userID = req.body[0];
	var req_projectID = req.body[1];
	var req_projectName = req.body[2];
	var req_projectData = req.body[3].data;

	req.db.userbase.update(
		{id: req_userID, projectID: req_projectID}, 
		{
			$set:{
				projectName : req_projectName,
				projectData : req_projectData
			}
		},
		{
			upsert:true
		},
		function(err, data){
			if(err) return next(err);
			res.send("User data saved!")
	})
}

module.exports = userbasequery;
