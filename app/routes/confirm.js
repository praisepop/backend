var User = require('../modules/user');
var Token = require('../modules/token');

module.exports = function(req, res) {
  if (req.method) {
    if (req.params.id) {
      switch (req.method) {
        case 'GET':
          Token.invalidate(req, res);
          User.confirm(req, res);
          break;
        default:
          res.status(404).json({
            result: false,
            message: 'Nothing to be found here.'
          });
          break;
      }
    }
    else {
      res.status(404).json({
        result: false,
        message: 'Nothing to be found here.'
      });
    }
  }
}
