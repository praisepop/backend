var User = require('../modules/user');

module.exports = function(req, res) {
  if (req.method == 'POST') {
    User.authenticate(req, res);
  }
}
