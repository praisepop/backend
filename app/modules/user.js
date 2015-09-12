var mongoose = require('mongoose')
    jwt = require('jsonwebtoken');

var user = require('../models/user');
var token = require('./token');
var email_parser = require('../tools/email-parser');

var config = require('../../config');

module.exports = {
  create: function(req, res) {
    var request = req.body;

    var newUser = {
      salt: request.salt,
      password: request.password,
      email: request.email,
      name: request.name
    };

    user.findOne({email : request.email}, function(err, user) {
      if (err) throw err;

      if (!user) {
        user.create(newUser, function(err, user) {
          if (err) {
            res.status(507).json({
              result: false,
              message: 'Unable to save user.'
            });
          }
          else {
            token.create(user.id, function(err) {
              if (!err) {
                res.json({result: true});
              }
            })
          }
        });
      }
      else {
        res.status(409).json({
          result: false,
          message: 'User already exists with that email.'
        });
      }
    });
  },
  update: function(req, res) {
    var query = { '_id': req.params.id };
    var update = req.body;

    user.update(query, update, function(err, user) {
      if (err) {
        res.send(err);
      }
      else {
        res.status(200).json({
          result: true,
          message: 'The user was successfully updated.'
        });
      }
    });
  },
  register: function(req, res) {

  },
  authenticate: function(req, res) {
    var request = req.body;

    user.findOne({
      email: request.email,
      password: request.password
    }, function(err, user) {
      if (err) {
        res.status()
      }

      if (!user) {
        res.status(404).json({
          result: false,
          message: 'Authentication failed. User not found.'
        });
      } else if (user) {
        var token = jwt.sign(user, config.secret, {
          expiresInMinutes: 43200 // expires in 24 hours
        });

        res.json({
          result: true,
          token: token
        });
      }
    });
  },
  remove: function(req, res) {
    var query = { '_id': req.params.id };

    user.remove(query, function(err, user) {
      if (err) {
        res.status(409).json({
          result: false,
          error: err
        });
      }
      else {
        res.send('User with _id ' + query._id + ' resultfully removed from users collection');
      }
    });
  }
};
