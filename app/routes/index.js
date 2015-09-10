var mongoose = require('mongoose')
    util = require('util');
var user = require('./user');

module.exports = function(router) {
  router.use(function(req, res, next) {
      util.log(req.method + ' request for ' + req.path + ' from ' + req.headers.host);
      next();
  });

  router.use('/users/:id?', user);

  return router;
}
