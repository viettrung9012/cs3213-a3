//This file modifies passport to include facebook strategies.

var FacebookStrategy = require('passport-facebook').Strategy;
var app_details = require("../api/app_details");
var User = require('../models/user');

module.exports = function(passport, login) {
	// =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
	
	//Register handlers
	login.handlers.facebook = passport.authorize('facebook', { scope: ['email'] });
	
	login.callbacks.facebook = passport.authenticate('facebook', {
									successRedirect : '/profile',
									failureRedirect : '/profile'
								});
	
	//Register passport
    passport.use(new FacebookStrategy({

		// pull in our app id and secret from our auth.js file
        clientID        : app_details.facebook.id,
        clientSecret    : app_details.facebook.secret,
        callbackURL     : app_details.facebook.callback_url,
		passReqToCallback : true

    }, function(req, token, refreshToken, profile, done) {
		console.log(token, refreshToken, profile, done);
		// asynchronous
		process.nextTick(function() {
			if (req.user) {
				console.log("--------exists user");
				var user = req.user;
				//Update the facebook details.
					//Going to assume linkage with one account exactly.
				user.external_profiles.facebook = {
					id: profile.id,
					token: token,
					email: profile.emails[0].value,
					name: profile.name.givenName + ' ' + profile.name.familyName
				};
				
				user.save(function(err) {
	                if (err)
	                    throw err;
					console.log("--------updated user");
	                return done(null, user);
	            });
			}
			else
			{
				done(Error("No user to link to"));
			}
			// find the user in the database based on their facebook id
	        /*User.findOne({ 'external_profiles.facebook.id' : profile.id }, function(err, user) {
			
	        	// if there is an error, stop everything and return that
	        	// ie an error connecting to the database
	            if (err)
	                return done(err);

				// if the user is found, then log them in
	            if (user) {
	                return done(null, user); // user found, return that user
	            } else {
	                // if there is no user found with that facebook id, create them
	                var newUser = new User();

					// set all of the facebook information in our user model
	                newUser.external_profiles.facebook.id    = profile.id; // set the users facebook id	                
	                newUser.external_profiles.facebook.token = token; // we will save the token that facebook provides to the user	                
	                newUser.external_profiles.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
	                newUser.external_profiles.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

					// save our user to the database
	                newUser.save(function(err) {
	                    if (err)
	                        throw err;
	                    // if successful, return the new user
	                    return done(null, newUser);
	                });
	            }

	        });*/
        });

    }));


};