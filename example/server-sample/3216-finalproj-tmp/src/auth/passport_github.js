//This file modifies passport to include github strategies.

var githubStrategy = require('passport-github').Strategy;
var app_details = require("../api/app_details");
var events = require("../api/internal_events");
var User = require('../models/user');
var GitHubApi = require("github");
var _ = require('underscore');
var async = require('async');

//Helpers	
function toArray(stuff) {
    return Array.prototype.slice.call(stuff);
}
 
Function.prototype.curry = function() {
    if (arguments.length<1) {
        return this; //nothing to curry with - return function
    }
    var __method = this;
    var args = toArray(arguments);
    return function() {
        return __method.apply(this, args.concat(toArray(arguments)));
    }
}

//For debug purposes.

var winston = require('winston');
winston.add(winston.transports.File, { filename: 'somefile.log' });
var logger = winston;

var github = new GitHubApi({
    // required
    version: "3.0.0",
    // optional
    debug: true,
   // protocol: "https",
   // host: "api.github.com",
   // pathPrefix: "/api/v3", // for some GHEs
    timeout: 5000
});

module.exports = function(passport, login, eventStreams) {
	var loginstream = eventStreams.login;
	// =========================================================================
	// GITHUB   ================================================================
	// =========================================================================
	
	//Register handlers
	login.handlers.github = passport.authorize('github');
	
	login.callbacks.github = 	passport.authenticate('github', {
									successRedirect : '/profile',
									failureRedirect : '/profile'
								})
	
	//Register passport
	passport.use(new githubStrategy({
		// pull in our app id and secret from our auth.js file
		clientID: app_details.github.id,
		clientSecret	: app_details.github.secret,
		callbackURL	 : app_details.github.callback_url,
		scope: ['user']	,
		passReqToCallback : true
	}, function(req, token, refreshToken, profile, done) {
		// asynchronous
		process.nextTick(function() {
			if (req.user) {
				var user = req.user;
				//Update the github details.
					//Going to assume linkage with one account exactly.
				
				//Pull standard data.
				user.external_profiles.github = {
					id: profile.id,
					token: token,
					email: profile.emails[0].value,
					username: profile.username,
					profile_url: profile.profileUrl
				};
				
				//Pull extra data.
					//These are done asynchronously, even by node js standards :P
				async.waterfall([
				function(callback){
					GET_REPOS(token, function(err, result)
					{
						//Put a notify message out for updates.
						user.external_profiles.github.repos = result;
						user.save(function(err) {
							if (err)
								throw err;
							loginstream.push(events.PROFILE_CHANGE_EVENT(["PASSPORT","GITHUB","REPOS"], user));
							callback(null, result);
						});
					});
				},
				function(repos, callback)
				{
					var retrieve_commit_actions = _.map(repos, function(repo)
					{
						var owner = repo.owner.login;
						var reponame = repo.name;
						console.log(token, owner, reponame);
						return GET_STATISTICS.curry(token, reponame, owner);
					});
					async.parallel(retrieve_commit_actions,
					function(err, results)
					{
						if(err)
							callback(err);
						//results is an array containing all the commits.
						logger.log("info",results);
						//TODO: Update the database.
						callback(null, results);
					});
				
				}],
				function()
				{
					//Nothing.
				});
				
				user.save(function(err) {
	                if (err)
	                    throw err;
					loginstream.push(events.PROFILE_CHANGE_EVENT(["PASSPORT","GITHUB","AUTH"], user));
	                return done(null, user);
	            });
			}
			else
			{
				done(Error("No user to link to"));
			}
		});

	}));


};

function GET_REPOS(token, cb) //cb(err, done)
{
	github.authenticate({
		type: "oauth",
		token: token
	});
	github.repos.getAll({},cb); //doesn't seem to need paging?
}

function GET_STATISTICS(token, repo, user, cb)
{
	github.authenticate({
		type: "oauth",
		token: token
	});
	//TODO: complete.
	/*github.repos.getCommits({
		user: user,
		repo: repo
	},cb);*/
}