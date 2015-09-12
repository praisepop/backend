var mongoose = require('mongoose')
    util = require('util')
    config = require('../../config');

var user = require('./user'),
    authenticate = require('./authenticate');

module.exports = function(router) {
  router.use(function(req, res, next) {
      util.log(req.method + ' request for ' + req.path + ' from ' + req.headers.host);
      next();
  });

  router.use('/authenticate', authenticate);

  router.use(function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {
      jwt.verify(token, config.secret, function(err, decoded) {
        if (err) {
          return res.json({ success: false, message: 'Failed to authenticate token.' });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      return res.status(403).json({
          success: false,
          message: 'No token provided.'
      });
    }
  });

  router.use('/users/:id?', user);

  return router;
}
