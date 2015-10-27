var mongoose = require('mongoose');

var upvote = require('../models/upvote');

var Parse = require('parse/node').Parse;
Parse.initialize(process.env['PARSE_APP_ID'], process.env['PARSE_JAVASCRIPT_KEY']);

module.exports = {
  create: function(req, res) {
    var request = req.body;

    var newUpvote = {
      post: mongoose.Types.ObjectId(req.params.id),
      upvoted_by: mongoose.Types.ObjectId(req.decoded._id)
    }

    upvote.findOne({ post: newUpvote.post, upvoted_by: newUpvote.upvoted_by }, function(err, result) {
      if (err) throw err;

      if (!result) {
        upvote.create(newUpvote, function(err, result) {
          if (err) throw err;

          if (result) {
            var query = {
              channels: [result.upvoted_by],
              data: {
                badge: 'Increment',
                alert: 'Someone wrote a pop about you!',
                post: result.post
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
        })
      }
    });
  }
}
