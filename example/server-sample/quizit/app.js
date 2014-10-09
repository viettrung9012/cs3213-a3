var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var mongoskin = require('mongoskin');
var db = mongoskin.db('mongodb://localhost:27017/quizit?auto_reconnect', {safe:true});

var routes = require('./routes/index');
var users = require('./routes/users');
var quiz = require('./routes/quiz');
var challenges = require('./routes/challenges');
var bonusquery = require('./routes/bonusquery');

var userbase = require('./server/userbase');
var dbinit = require('./server/databaseInit');
var bonusbase = require('./server/bonusbase');
var questionbase = require('./server/questionbase');
var interestbase = require('./server/interestbase');
var challengebase = require('./server/challengebase');

var app = express();

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(function(req, res, next) {
  req.db = {};
  req.db.userbase = db.collection('userbase');
  req.db.questionbase = db.collection('questionbase');
  req.db.challengebase = db.collection('challengebase');
  req.db.bonusbase = db.collection('bonusbase');
  req.db.moviebase = db.collection('moviebase');
  req.db.musicbase = db.collection('musicbase');
  req.db.bookbase = db.collection('bookbase');
  next();
})

// view engine setup
app.set('port', process.env.PORT || 8000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/quiz',quiz);
app.use('/challenges', challenges);
app.use('/bonus', bonusquery);

//user login
app.use('/userLoginRedirect',userbase.userLoginRedirect);
app.post('/userlogin',userbase.login);

//database initialization: just call databaseinit router will init the whole db
app.use('/databaseinit',dbinit.init);
app.use('/userbaseinit',userbase.init);
app.use('/bonusbaseinit',bonusbase.init);
app.use('/questionbaseinit', questionbase.init);
app.use('/interestbaseinit', interestbase.initAll);
app.use('/challengebaseinit', challengebase.init);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    console.log("catch error");
    next(err);
});
// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });

});

http.createServer(app).listen(app.get('port'), function(){
    process.setMaxListeners(0);
  console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;
