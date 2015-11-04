var mongoose = require('mongoose'),
    jwt = require('jsonwebtoken'),
    nodemailer = require('nodemailer');

var User = require('../models/user');
var org = require('../models/organization');
var token = require('./token');
var email_parser = require('../tools/email-parser');

var config = require('../../config');

require('../tools/util');

var Org = require('../modules/organization');

module.exports = {
  create: function(req, res) {
    var request = req.body;

    var fs = require('fs');
    var blacklist;

    fs.readFile(__dirname + '/../../email-blacklist.json', 'utf8', function (err, data) {
      if (err) throw err;
      blacklist = JSON.parse(data);

      var domain = email_parser.parse(request.email);
      doamain = domain['parent_domain'];

      blacklist.contains(domain, function(found) {
        if (found) {
          res.status(503).json({
            result: false,
            message: 'You are trying to use a blacklisted domain name.'
          });

          return;
        }
      });
    });

    var newUser = {
      password: request.password,
      email: request.email,
      name: request.name
    };

    User.findOne({email : request.email}, function(err, result) {
      if (err) throw err;

      if (!result) {
        User.create(newUser, function(err, user) {
          if (err) {
            res.status(507).json({
              result: false,
              message: 'Unable to save user.'
            });
          }
          else {
            token.create(user.id, function(err, createdToken) {
              if (!err) {
                // var transporter = nodemailer.createTransport();
                var transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: config.email,
                        pass: process.env['GMAIL_PASSWORD']
                    }
                });

                // Make this localhost if testing locally.
                var link = 'https://api.trypraisepop.com/v1/users/confirm/' + user.id + '/' + createdToken.id;

                var fromUser = process.env['FROM_NAME'] + " <" + process.env['GMAIL_EMAIL'] + ">";

                var mailOptions = {
                    from: fromUser, // sender address
                    to: request.email, // list of receivers
                    subject: 'Please confirm your account!', // Subject line
                    text: 'Hello!  Thanks for signing up for PraisePop!  Please click this link to confirm your account: ' + link + '.', // plaintext body
                    html: 'Hello!  Thanks for signing up for PraisePop!  <a href=' + link +'>Please click this link to confirm your account</a>.' // html body
                };

                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        console.log(error);
                    }

                    console.log(info);
                    res.json({
                      result: true,
                      message: 'The user was successfully created.'
                    });
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
  random: function(req, res) {
    var query = {
      verified: true,
      orgs: mongoose.Types.ObjectId(req.params.id)
    }

    User.find(query, function(err, result) {
      if (err) {
        res.status(507).json({
          result: false,
          message: err.message
        });
      }

      if (result.length >= 10) {
        User.findRandom(query, {}, { limit: 6 }, function(err, result) {
          if (err) {
            res.status(507).json({
              result: false,
              message: err.message
            });
          }

          if (result) {
            res.status(200).json(result);
          }
          else {
            res.status(404).json({
              result: false,
              message: 'No users found.'
            });
          }
        });
      }
      else {
        res.status(404).json({
          result: false,
          message: 'Less than ten users, so can\'t find any random ones.'
        })
      }
    });
  },
  update: function(req, res) {
    var query = { _id: req.decoded._id };
    var update = {
      password : req.password,
      name : req.name
    };

    User.update(query, update, function(err, user) {
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
    User.findOne({_id : req.params.id, verified: false}, function(err, result) {
      if (err) throw err;

      if (!result) {
        res.send('<b>User not found or has been previously verified.</b>');
        // res.status(205).json({
        //   result: false,
        //   message: 'User not found or has been previously verified.'
        // });
      }
      else {
        User.findByIdAndUpdate(req.params.id, {
          verified: true
        }, function(err, user) {
          var meta = email_parser.parse(user.email);

          org.findOne({ domain: meta.parent_domain}, function(err, orgResult) {
            if (orgResult) {
              if (!meta.subdomain) {
                User.findOneAndUpdate({email : user.email}, {$push: {orgs: orgResult.id}}, function(err, result) {
                  if (err) {
                    res.send('<b>Sorry, we weren\'t able to verify your email!</b>');
                    // res.status(507).json({
                    //   result: false,
                    //   message: err.message
                    // });
                  }

                  if (result) {
                    res.send('<b>Your email has been successfully verified!</b>');
                    // res.status(201).json({
                    //   result: true,
                    //   messsage: 'The user was successfully verified, and organizations were created!'
                    // });
                  }
                  else {
                    res.send('<b>We were unable to verify your account... Are you sure you signed up?</b>');
                    // res.status(404).json({
                    //   result: false,
                    //   message: 'User not found.'
                    // });
                  }
                });
              }
              else {
                org.findOne({ domain: meta.subdomain}, function(err, subOrg) {
                  if (subOrg) {
                    User.findOneAndUpdate({email : user.email}, {$pushAll: {orgs: [orgResult.id, subOrg.id]}}, function(err, result) {
                      if (err) {
                        res.send('<b>Sorry, we weren\'t able to verify your email!</b>');
                        // res.status(507).json({
                        //   result: false,
                        //   message: err.message
                        // });
                      }

                      if (result) {
                        res.send('<b>Your email has been successfully verified!</b>');
                        // res.status(201).json({
                        //   result: true,
                        //   messsage: 'The user was successfully verified, and organizations were created!'
                        // });
                      }
                      else {
                        res.send('<b>We were unable to verify your account... Are you sure you signed up?</b>');
                        // res.status(404).json({
                        //   result: false,
                        //   message: 'User not found.'
                        // });
                      }
                    });
                  }
                  else {
                    Org.process(meta, user);
                    res.send('<b>Your email has been successfully verified!</b>');
                    // res.status(201).json({
                    //   result: true,
                    //   messsage: 'The user was successfully verified, and organizations were created!'
                    // });
                  }
                });
              }
            }
            else {
              Org.process(meta, user);
              res.send('<b>Your email has been successfully verified!</b>');
              // res.status(201).json({
              //   result: true,
              //   messsage: 'The user was successfully verified, and organizations were created!'
              // });
            }
          });
        });
      }
    })
  },
  authenticate: function(req, res) {
    var request = req.body;

    User.findOne({
      email: request.email,
      verified: true
    }).populate('orgs').exec(function(err, user) {
      if (err) throw err;

      if (!user) {
        res.status(404).json({
          result: false,
          message: 'Authentication failed. User not found.'
        });
      } else if (user) {
        user.comparePassword(request.password, function(err, isMatch) {
          if (err) throw err;

          if (isMatch) {
            var token = jwt.sign(user, config.secret, {
              expiresIn: 2592000 // expires in 30 days (30*24*60*60)
            });

            var userDict = user.toObject();
            delete userDict.password;
            delete userDict.__v;

            res.status(200).json({
              token: token,
              user: userDict
            });
          }
          else {
            res.status(403).json({
              result: false,
              message: 'Your username or password was incorrect.'
            });
          }
        });
      }
    });
  },
  remove: function(req, res) {
    var query = { '_id': req.params.id };

    User.remove(query, function(err, user) {
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
