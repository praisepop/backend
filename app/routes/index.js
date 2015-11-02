var mongoose = require('mongoose')
    util = require('util')
    config = require('../../config');

var user = require('./user'),
    posts = require('./posts');

module.exports = function(router) {
  router.use(function(req, res, next) {
      util.log(req.method + ' request for ' + req.path + ' from ' + req.headers.host);
      next();
  });

  // Paths you can use WITHOUT a token!

  router.use('/users/authenticate', user.authenticate);

  router.post('/users/new', user.create);
  router.get('/users/confirm/:id/:token', user.confirm);

  router.use(function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {
      jwt.verify(token, config.secret, function(err, decoded) {
        if (err) {
          return res.status(403).json({
            result: false,
            authenticated: false,
            message: 'Failed to authenticate token.'
          });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      return res.status(403).json({
          result: false,
          message: 'No token provided.'
      });
    }
  });

  // Token required for these.

  router.put('/users/update', user.update);

  router.get('/orgs/:id/users/random', user.random);
  router.post('/orgs/:id/posts/new', posts.create);
  router.get('/orgs/:id/posts', posts.list);

  router.post('/posts/:id/upvote', posts.upvote);
  router.delete('/posts/:id', posts.delete);
  router.post('/posts/:id/reaction', posts.react);
  router.get('/posts/:id/reactions', posts.reactions);
  router.delete('/posts/:id/reaction', posts.deleteReaction);
  router.post('/posts/:id/flag', posts.flag);
  router.get('/posts/:id', posts.single);

  router.use('*', function(req, res) {
      res.status(404).json({
        result: false,
        message: 'Nothing to see here... yet.'
      });
  });

  return router;
}
