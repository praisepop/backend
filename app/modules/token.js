var mongoose = require('mongoose');
var token = require('../models/token');

module.exports = {
  create: function(userId, callback) {
    var generated = require('../tools/token-generator').generate();

    var newToken = {
      user: userId,
      token: generated
    }

    token.create(newToken, function(err, user) {
      if (err) {
        callback(err);
      }
      else {
        console.log('Token was successfully generated for '+userId+'.');
        callback();
      }
    });
  },
  invalidate: function(req, res) {
    var query = { _id:req.params.token, user:req.params.id, valid: true };

    token.update(query, {
      valid: false
    }, function(err, user) {
      if (err) {
        res.send(err);
      }
    });
  }
};
