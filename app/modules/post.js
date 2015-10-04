var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    jwt = require('jsonwebtoken');

var post = require('../models/post');

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
      org: mongoose.Types.ObjectId(req.params.org_id),
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
    post.paginate({}, { page: req.query.page, limit: req.query.limit }, function(err, result) {
      if (err) throw err;

      if (result) {
        res.status(201).json(result);
      }
    });
  }
};
