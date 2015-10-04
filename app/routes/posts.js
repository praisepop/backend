var Post = require('../modules/post');

module.exports = {
  create: function(req, res) {
    Post.create(req, res);
  },
  list: function(req, res) {
    Post.list(req, res);
  }
}
