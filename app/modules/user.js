var mongoose = require('mongoose')
    jwt = require('jsonwebtoken');

var user = require('../models/user');
var org = require('../models/organization');
var token = require('./token');
var email_parser = require('../tools/email-parser');

var config = require('../../config');

var Org = require('../modules/organization');

module.exports = {
  create: function(req, res) {
    var request = req.body;

    var newUser = {
      salt: request.salt,
      password: request.password,
      email: request.email,
      name: request.name
    };

    user.findOne({email : request.email}, function(err, result) {
      if (err) throw err;

      if (!result) {
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
                res.json({
                  result: true,
                  message: 'The user was successfully created.'
                });
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
    var query = { _id: req.decoded._id };
    var update = {
      password : req.password,
      name : req.name
    };

    // ADD LOGIC HERE FOR CHANGING PASSWORD, AKA IF PASSWORD IS SAME, ERROR, ETC.

    user.update(query, update, function(err, user) {
      if (err) throw err;

      if (user) {
        res.status(200).json({
          result: true,
          message: 'The user was successfully updated.'
        });
      }
      else {
        res.status(205).json({
          result: false,
          message: 'User not found, or was unable to be updated'
        });
      }
    });
  },
  confirm: function(req, res) {
    user.findOne({_id : req.params.id, verified: false}, function(err, result) {
      if (err) throw err;

      if (!result) {
        res.status(205).json({
          result: false,
          message: 'User not found or has been previously verified.'
        });
      }
      else {
        user.findByIdAndUpdate(req.params.id, {
          verified: true
        }, function(err, user) {
          if (err) throw err;

          var meta = email_parser.parse(user.email);
          Org.process(meta, user);

          if (!err) {
            res.status(201).json({
              result: true,
              messsage: 'The user was successfully verified, and organizations were created!'
            });
          }
        });
      }
    })
  },
  authenticate: function(req, res) {
    var request = req.body;

    user.findOne({
      email: request.email,
      password: request.password
    }, function(err, user) {
      if (err) throw err;

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
        res.send('User with id ' + query._id + ' resultfully removed from users collection');
      }
    });
  }
};
