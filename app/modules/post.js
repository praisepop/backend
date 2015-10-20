var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    jwt = require('jsonwebtoken'),
    async = require('async');

var post = require('../models/post'),
    org = require('../models/organization'),
    upvote = require('../models/upvote');;

var config = require('../../config');

module.exports = {
  create: function(req, res) {
    var request = req.body;

    if (!request.from || !request.to || !request.body || !request.type) {
      res.status(422).json({
        result: false,
        message: 'Insufficient parameters for creating a post.'
      });
    }

    // This doesn't work... whyyyy

    // if (request.type != 'invite' || request.type != 'announcement' || request.type != 'shoutout') {
    //   res.status(422).json({
    //     result: false,
    //     message: 'Unknown post type.'
    //   });
    //   return; // I don't know why this is a fix... res.status(422).json should end output, but it doesn't... ?
    // }

    request.to.id = mongoose.Types.ObjectId(request.to.id);

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
        res.status(200).json({
          result: true,
          message: 'Post successfully created.'
        });
      }
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

        post.paginate({ org: req.params.id }, options, function(err, results, pageCount, itemCount) {
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

              res.status(201).json({
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

    post.findById(req.params.post, function(err, result) {
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
              res.status(201).json({
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
  }
};
