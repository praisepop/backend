var mongoose = require('mongoose');
var user = require('../models/user');
var token = require('./token');
var email_parser = require('../tools/email-parser');

module.exports = {
  create: function(req, res) {
    var request = req.body;

    var newUser = {
      salt: request.salt,
      password: request.password,
      email: request.email,
      name: request.name
    };

    user.create(newUser, function(err, user) {
      if (err) {
        res.send("New user '" + newUser.email + "' inserted successfully.");
      }
      else {
        token.create(user.id, function(err) {
          if (!err) {
            console.log('Token was created for user, send mail!!')
            // send mail
          }
        })
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
        res.send("User with _id " + query._id + " updated successfully with query " + JSON.stringify(update) + ".");
      }
    });
  },
  register: function(req, res) {

  },
  authenticate: function(req, res) {

  },
  remove: function(req, res) {
    var query = { '_id': req.params.id };

    user.remove(query, function(err, user) {
      if (err) {
        res.send(err);
      }
      else {
        res.send("User with _id " + query._id + " successfully removed from 'users' collection");
      }
    });
  }
};
