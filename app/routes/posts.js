var Post = require('../modules/post');
var Upvote = require('../modules/upvote');
var Reaction = require('../modules/reaction');

module.exports = {
  create: function(req, res) {
    Post.create(req, res);
  },
  list: function(req, res) {
    Post.list(req, res);
  },
  upvote: function(req, res) {
    Upvote.create(req, res);
  },
  delete: function(req, res) {
    Post.delete(req, res);
  },
  react: function(req, res) {
    Reaction.create(req, res);
  },
  reactions: function(req, res) {
    Reaction.list(req, res);
  },
  deleteReaction: function(req, res) {
    Reaction.delete(req, res);
  },
  flag: function(req, res) {
    Post.flag(req, res);
  }
}
