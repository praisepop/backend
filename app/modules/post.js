var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    jwt = require('jsonwebtoken'),
    async = require('async');

var post = require('../models/post'),
    org = require('../models/organization'),
    upvote = require('../models/upvote'),
    user = require('../models/user');

var config = require('../../config');

var Parse = require('parse/node').Parse;
Parse.initialize(process.env['PARSE_APP_ID'], process.env['PARSE_JAVASCRIPT_KEY']);

module.exports = {
  create: function(req, res) {
    var request = req.body;

    if (!request.to || !request.body || !request.type) {
      res.status(422).json({
        result: false,
        message: 'Insufficient parameters for creating a post.'
      });
    }

    if (!(request.type.toLowerCase() === 'uncategorized' || request.type.toLowerCase() === 'invite' || request.type.toLowerCase() === 'announcement' || request.type.toLowerCase() === 'shoutout')) {
        res.status(422).json({
          result: false,
          message: 'Unknown post type.'
        });
    }

    // request.to.id = mongoose.Types.ObjectId(request.to.id);
    user.findOne({ 'name.first': request.to.name.first, 'name.last': request.to.name.last}, function(err, user) {
      if (err) {
        res.status(507).json({
          result: false,
          message: err.message
        });
      }

      if (user) {
        request.to.id = user.id;
      }

      request.to.name = request.to.name.first + ' ' + request.to.name.last;

      var newPost = {
        from: mongoose.Types.ObjectId(req.decoded._id),
        to: request.to,
        body: request.body,
        org: mongoose.Types.ObjectId(req.params.id),
        type: request.type,
        hashtags: request.hashtags
      };

      post.create(newPost, function(err, result) {
        if (err) {
          res.status(507).json({
            result: false,
            message: err.message
          });
        }

        if (result) {
          if (request.to.id) {
            var query = {
              channels: [user.id],
              data: {
                badge: 'Increment',
                alert: 'Someone wrote a pop about you!',
                post: result.id
              }
            };

            Parse.Push.send(query,  {
              success: function() {
                console.log('Notification sent at',new Date()+'.');
              },
              error: function(error) {
                console.log('Unable to send notification at',new Date()+'.');
              }
            });
          }

          res.status(201).json({
            result: true,
            message: 'Post successfully created.'
          });
        }
      });
    });
  },
  list: function(req, res) {
    org.findById(req.params.id, function(err, result) {
      if (err) {
        res.status(507).json({
          result: false,
          message: err.message
        });
      }

      if (result) {
        var options = {
          lean: true,
          page: req.query.page,
          sort: {
            created_at: -1
          },
          limit: req.query.limit,
          populate: [{
            path: 'org',
            select: '_id name domain parent'
            },
            {
              path: 'to.id',
              select: '_id name'
            }]
        };

        post.paginate({ org: req.params.id, hidden: false }, options, function(err, results, pageCount, itemCount) {
          if (err) {
            res.status(507).json({
              result: false,
              message: err.message
            });
          }

          if (results) {
            var page = parseInt(req.query.page);
            var newResults = [];

            async.each(results, function(eachPost, callback) {
              upvote.findOne({ post: eachPost._id, upvoted_by: req.decoded._id }, function(err, result) {
                if (err) {
                  res.status(507).json({
                    result: false,
                    message: err.message
                  });
                }

                if (result) {
                  eachPost.upvoted = true;
                }
                else {
                  eachPost.upvoted = false;
                }

                newResults.push(eachPost);
                callback();
              });
            }, function() {
              if (page >= 1) {
                var remainder = itemCount % pageCount;
                var previousPage = page - 1;
                var nextPage = page + 1;

                var pagingDictionary = {
                    previous: 'orgs/'+req.params.id+'/posts?page='+previousPage+'&limit='+req.query.limit,
                    next: 'orgs/'+req.params.id+'/posts?page='+nextPage+'&limit='+req.query.limit
                }

                if ((remainder == 0 || remainder < parseInt(req.query.limit)) && page == pageCount) {
                    delete pagingDictionary.next;
                }

                if (page == 1) {
                  delete pagingDictionary.previous;
                }
              }

              newResults.sort(function(a, b){
                  var keyA = new Date(a.created_at),
                  keyB = new Date(b.created_at);

                  return keyB - keyA;
              });

              res.status(200).json({
                result: true,
                data: newResults,
                paging: pagingDictionary
              });
            });
          }
          else {
            res.status(404).json({
              result: false,
              message: 'No posts were found for this organization.'
            });
          }
        });
      }
      else {
        res.status(404).json({
          result: false,
          message: 'Unable to find organization.'
        });
      }
    });
  },
  delete: function(req, res) {
    var request = req.body;

    post.findById(req.params.id, function(err, result) {
      if (err) throw err;

      if (result) {
        if (result.hidden) {
          res.status(500).json({
            result: false,
            message: 'Post was already deleted!'
          });
        }

        if (result.from == req.decoded._id || result.to.id == req.decoded._id || req.decoded.admin) {
          result.hidden = true;

          result.save(function(err) {
            if (err) {
              res.status(500).json({
                result: false,
                message: 'Post could not be deleted'
              });
            }
            else {
              res.status(200).json({
                result: true,
                message: 'Post was deleted.'
              });
            }
          });
        }
      }
      else {
        res.status(404).json({
          result: false,
          message: 'Unable to delete post.'
        })
      }
    });
  },
  flag: function(req, res) {
    var request = req.body;

    post.find({ _id : req.params.id, 'reports.reported_by' : req.decoded._id }, function(err, result) {
      if (err) throw err;

      if (result.length > 0) {
        res.status(503).json({
          result: false,
          message: 'You have already flagged this post!'
        });
      }
      else {
        post.findById(req.params.id, function(err, result) {
          if (err) throw err;

          if (result.hidden) {
            result.reports.push({
              reported_by: mongoose.Types.ObjectId(req.decoded._id)
            });
            res.status(200).json({
              result: true,
              message: 'Post already hidden.'
            });
          }
          else {
            var update = {
              $push: {
                reports: {
                  reported_by: mongoose.Types.ObjectId(req.decoded._id)
                }
              }
            };

            post.findByIdAndUpdate(req.params.id, update, function(err, result) {
              if (err) throw err;
              if (result) {
                if (result.reports.length >= 3) {
                  result.hidden = true;
                  result.save();
                }

                res.status(200).json({
                  result: true,
                  message: 'Post has been flagged.'
                });
              }
              else {
                res.status(500).json({
                  result: false,
                  message: 'Post was unable to be flagged.'
                });
              }
            });
          }
        });
      }
    });
  },
  single: function(req, res) {
    post.findById(req.params.id, function(err, result) {
      if (err) {
        res.status(500).json({
          result: false,
          message: 'Post could not be deleted'
        });
      }

      if (result) {
        res.status(200).json(result);
      }
      else {
        res.status(400).json({
          result: false,
          message: 'Post not found'
        });
      }
    });
  }
};
