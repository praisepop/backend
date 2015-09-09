var express = require('express'),
    parser = require('body-parser'),
    mongoose = require('mongoose'),
    util = require('util');

var app = express();

mongoose.connect('mongodb://localhost/praisepop');

app.set('port', 8080);
app.use(parser.urlencoded({extended: true}));
app.use(parser.json());

if (app.get('env') == 'development') {
  // app.use(express.errorHandler());
}

app.all('/*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); // restrict it to the required domain
  res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Authorization,Content-type,Accept,X-Access-Token,X-Key');
  if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});

app.use('/', require('./app/routes/'));

// If no route is matched by now, it must be a 404
app.use(function(req, res, next) {
  // var err = new Error('Not Found');
  res.status(404).send('404');
  next();
});

app.listen(app.get('port'), function(){
  util.log('PraisePop API is up and running on port ' + app.get('port'));
});

function logRequest(request) {
	util.log(request.method + ' request for ' + request.path + ' from ' + request.hostname);
}
