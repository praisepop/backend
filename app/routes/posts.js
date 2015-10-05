var Post = require('../modules/post');
var Upvote = require('../modules/upvote');

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
  flag: function(req, res) {

  }
}
