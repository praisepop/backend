var User = require('../modules/user');
var Token = require('../modules/token');

module.exports = {
  create: function(req, res) {
    User.create(req, res);
  },
  update: function(req, res) {
    User.update(req, res);
  },
  confirm: function(req, res) {
    if (req.params.id && req.params.token) {
        Token.invalidate(req, res);
        User.confirm(req, res);
      }
    else {
      res.status(404).json({
        result: false,
        message: 'Nothing to see here... yet.'
      });
    }
  },
  authenticate: function(req, res) {
    User.authenticate(req, res);
  }
}
