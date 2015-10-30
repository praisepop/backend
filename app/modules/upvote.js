var mongoose = require('mongoose');

var upvote = require('../models/upvote');
var post = require('../models/post');

var Parse = require('parse/node').Parse;
Parse.initialize(process.env['PARSE_APP_ID'], process.env['PARSE_JAVASCRIPT_KEY']);

module.exports = {
  create: function(req, res) {
    var request = req.body;

    var newUpvote = {
      post: mongoose.Types.ObjectId(req.params.id),
      upvoted_by: mongoose.Types.ObjectId(req.decoded._id)
    }


    post.findById(newUpvote.post, function(err, postResult) {
      if (err) throw err;

      if (postResult) {
        upvote.findOne({ post: newUpvote.post, upvoted_by: newUpvote.upvoted_by }, function(err, result) {
          if (err) throw err;

          if (!result) {
            upvote.create(newUpvote, function(err, upvoteResult) {
              if (err) throw err;

              if (upvoteResult) {
                if (postResult.to.id != req.decoded._id) {
                  var query = {
                    channels: ['PPC'+upvoteResult.upvoted_by],
                    data: {
                      badge: 'Increment',
                      alert: 'Someone popped a pop about you!',
                      post: upvoteResult.post
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
                  message: 'Upvoted created successfully.'
                });
              }
              else {
                res.status(507).json({
                  result: false,
                  message: 'Unable to upvote post!'
                })
              }
            });
          }
          else {
            res.status(409).json({
              result: false,
              message: 'Post has already been upvoted!'
            });
          }
        });
      }
      else {
        res.status(404).json({
          result: false,
          message: 'The request post was not found'
        });
      }
    });
  }
}
