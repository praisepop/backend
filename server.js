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

function logRequest(request) {
}
