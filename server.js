var express = require('express'),
    parser = require('body-parser'),
    mongoose = require('mongoose'),
    util = require('util')
    jwt = require('jsonwebtoken');;

var config = require('./config');

var app = express();

mongoose.connect(process.env['MONGOLAB_URI'], function (err, res) {
  if (err) {
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + uristring);
  }
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
