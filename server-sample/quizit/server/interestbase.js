var fs = require('fs');

var interestbase = {};
var movieJson = __dirname + "/../json/movies.json";
var musicJson = __dirname + "/../json/music.json";

interestbase.initMovies = function(req, res, next){
	fs.readFile(movieJson, 'utf8', function (err, data) {
		if (err) {
    		console.log('Error: ' + err);
    		return;
  		}
  		req.db.moviebase.drop();
    	JSON.parse(data, function(k,v){
    		if(k=="title"){
    			var movieData = {title: v};
    			req.db.moviebase.insert(movieData,function(error, movie){
    			});
    		};
    	});
	});
}

interestbase.initMusic = function(req, res, next){
	fs.readFile(musicJson, 'utf8', function (err, data) {
		if (err) {
    		console.log('Error: ' + err);
    		return;
  		}
  		req.db.musicbase.drop();

    	JSON.parse(data, function(k,v){
    		if(k=="title"){
    			var musicTitle = {title: v};
    			req.db.musicbase.insert(musicTitle,function(error, movie){
    			});
    		} else if(k=="name"){
    			var musicName = {name: v};
    			req.db.musicbase.insert(musicName,function(error, music){
    			});
    		}
    	});

	});
}

interestbase.initAll = function(req, res, next){
    req.setMaxListeners(0);
	interestbase.initMovies(req, res, next);
	interestbase.initMusic(req, res, next);
}

module.exports = interestbase;