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
	console.log(JSON.stringify(req.query));
	req.db.userbase.find({"userId":req.query.userId}).toArray(function(error,data){
		res.send(data);
	});
}

userbasequery.saveUserData = function(req, res, next){
	console.log(JSON.stringify(req.body));
	var req_userID = req.body["userId"];
	var req_projectID = req.body["projectId"];
	var req_projectName = req.body["projectName"];
	var req_projectData = req.body["data"];
	var req_lastModified = req.body["lastModified"];

	req.db.userbase.update(
		{userId: req_userID, projectId: req_projectID}, 
		{
			$set:{
				projectName : req_projectName,
				data : req_projectData,
				lastModified : req_lastModified
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
