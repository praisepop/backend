var mongoose = require('mongoose');

var upvote = require('../models/upvote');

module.exports = {
  create: function(req, res) {
    var request = req.body;

    if (!request.upvoted_by) {
      res.status(422).json({
        result: false,
        message: 'Insufficient parameters for creating an upvote.'
      });
    }

    var newUpvote = {
      post: mongoose.Types.ObjectId(req.params.post),
      upvoted_by: mongoose.Types.ObjectId(req.decoded._id)
    }

    upvote.findOne({ post: newUpvote.post, upvoted_by: newUpvote.upvoted_by }, function(err, result) {
      if (err) throw err;

      if (!result) {
        upvote.create(newUpvote, function(err, result) {
          if (err) throw err;

          if (result) {
            // TODO: SEND USER PUSH NOTIFICATION

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
  },
}
