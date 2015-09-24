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

  },
  list: function(req, res) {

  }
};
