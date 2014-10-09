var User  = require('../models/user');
var Bacon = require('baconjs');

module.exports = function(passport, login, eventStreams) {
	eventStreams.login = new Bacon.Bus();
	eventStreams.all.plug(eventStreams.login);

	// used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
		//Please update realtime/handlers.js -> deserialize if you update this.
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
	
	//Logout capability
	login.handlers.logout = function(req, res, next)
	{
		req.logout();
		res.clearCookie('user');
		res.send("logged out",200);
	}
};

/*Login overall documentation
LinkedIn is the primary account, all users need to log in with this, or the others will refuse to process.
-I.e. we authorize with linkedin.
-This is the primary key.

For the following, we "authenticate" with them, get details.
-Then we bind the account.
-If two secondary accounts bind to the same primary account, we ignore it.

Facebook is for profile pic
Github is for code analysis.

//Reference: http://scotch.io/tutorials/javascript/easy-node-authentication-linking-all-accounts-together

*/