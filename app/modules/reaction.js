var mongoose = require('mongoose');
var reaction = require('../models/reaction.js');

module.exports = {
  create: function(req, res) {
    var request = req.body;

    if (!request.type || !request.reaction) {
      res.status(422).json({
        result: false,
        message: 'Insufficient parameters for creating a reaction.'
      });
    }

    if (!(request.type.toLowerCase() === 'emoji' || request.type.toLowerCase() === 'text')) {
        res.status(422).json({
          result: false,
          message: 'Unknown reaction type.'
        });
    }

    var newReaction = {
      post: mongoose.Types.ObjectId(req.params.post),
      type: request.type,
      reactor: mongoose.Types.ObjectId(req.decoded._id),
      reaction: request.reaction,
      notified: true
    }

    reaction.create(newReaction, function(err, result) {
      if (err) {
        res.status(507).json({
          result: false,
          message: err.message
        });
      }

      if (result) {
        // TODO notify user here via Parse.

        res.status(201).json({
          result: true,
          message: 'Post was successfully reacted to.'
        });
      }
      else {
        res.status(500).json({
          result: false,
          message: 'Unable to create reaction.'
        });
      }
    });
  },
  delete: function(req, res) {
    var request = req.body;

    if (!request.reaction) {
      res.status(422).json({
        result: false,
        message: 'Insufficient parameters for deleting a reaction.'
      });
    }

    var query = {
      post: mongoose.Types.ObjectId(req.params.post),
      reactor: mongoose.Types.ObjectId(req.decoded._id),
      reaction: request.reaction
    }

    console.log(query);

    reaction.remove(query, function(err, result) {
      if (err) {
        res.status(507).json({
          result: false,
          message: err.message
        });
      }

      if (result) {
        res.status(200).json({
          result: true,
          message: 'Post reaction was successfully deleted.'
        });
      }
      else {
        res.status(404).json({
          result: false,
          message: 'Post reaction not found.'
        });
      }
    });
  }
}
