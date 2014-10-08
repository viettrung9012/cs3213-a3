//This file modifies passport to include linkedin strategies.

var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
var app_details = require("../api/app_details");
var User = require('../models/user');

module.exports = function(passport, login) {
	// =========================================================================
	// LINKEDIN ================================================================
	// =========================================================================

	//Register handlers
	login.handlers.linkedin = passport.authenticate('linkedin', {state: "THISISSOMEKINDOFSTATETOPREVENTCSRF"});

	login.callbacks.linkedin = 	passport.authenticate('linkedin', {
									successRedirect : '/home',
									failureRedirect : '/'
								})

	//Register passport
	passport.use(new LinkedInStrategy({

		// pull in our app id and secret from our auth.js file
		clientID: app_details.linkedin.id,
		clientSecret    : app_details.linkedin.secret,
		callbackURL     : app_details.linkedin.callback_url,
		// Just because linkedin does not ask the user permission
		// on a granular enough level, we may as well get it all
		scope: ['r_emailaddress', 'r_basicprofile', 'r_fullprofile']

    }, function(token, refreshToken, profile, done) {
		console.log(token, refreshToken, profile, done);
		// asynchronous
		process.nextTick(function() {
			// find the user in the database based on their linkedin id
			User.findOne({ 'external_profiles.linkedin.id' : profile.id }, function(err, user) {

				// if there is an error, stop everything and return that
				// ie an error connecting to the database
				if (err) {
					return done(err);
				}

				// Information that we are interested in
				var userInfo = {
					external_profiles: {
						linkedin: {
							id: profile.id, // Set the users linkedin id
							token: token, // We will save the token that linkedin provides to the user
							name: profile.name.givenName + ' ' + profile.name.familyName, // look at the passport user profile to see how names are returned
							email: profile.emails[0].value, // linkedin can return multiple emails so we'll take the first
							formatted_name: profile._json.formattedName, // We take the formatted name that linkedin provides
							skills: profile._json.skills ? profile._json.skills.values : null, // We just take the whole array of skils
							educations: profile._json.educations ? profile._json.educations.values : null, // We just take the whole array of education information
							interests: profile._json.interests ? profile._json.interests : null, // The interest is in the form of a string
							summary: profile._json.summary ? profile._json.summary : null, // Summary is in the form of a string
							picture_url: profile._json.pictureUrl ? profile._json.pictureUrl : null // Store the picture for face matching purposes
						}
					}
				};
				// if the user is found, then log them in
				if (user) {
					user.update(userInfo, function (err) {
						if (err) {
							throw err;
						}
						return done(null, user); // user found, return that user
					})
				} else {
					// if there is no user found with that linkedin id, create them
					var newUser = new User(userInfo);

					// save our user to the database
					newUser.save(function(err) {
						if (err)
							throw err;
						// if successful, return the new user
						return done(null, newUser);
					});
				}
			});
		});
	}));
};