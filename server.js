var express = require('express'),
    parser = require('body-parser'),
    mongoose = require('mongoose'),
    util = require('util')
    jwt = require('jsonwebtoken');;

var config = require('./config');

var app = express();

mongoose.connect(process.env.MONGO_DB_URL, function (err, res) {
  if (err) {
    console.log ('ERROR: PraisePop was able to connect to database.');
  } else {
    console.log ('SUCCESS: PraisePop was able to connect to database.');
  }
});

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open to ' + process.env.MONGO_DB_URL);
});

// If the connection throws an error
mongoose.connection.on('error',function (err) {
  console.log('DATABASE URL',process.env.MONGO_DB_URL);
  console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

var port = process.env.PORT || 8080;
app.set('port', port);
app.set('jwt-secret', config.secret);

app.use(parser.urlencoded({extended: true}));
app.use(parser.json());

if (app.get('env') == 'development') {
  // app.use(express.errorHandler());
}

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    next();
});

var router = express.Router();
router = require('./app/routes/')(router); // configure our routes

app.use('/api/v1', router);

app.use('*', function request(req, res) {
  res.json({error: 'Nothing to see here, move along!'});
});

app.listen(app.get('port'), function(){
  console.log('PraisePop API is up and running on port ' + app.get('port'));
});
