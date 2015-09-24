var User = require('../modules/user');

module.exports = function(req, res) {
  if (req.method) {
    if (req.params.id) {
      switch (req.method) {
        case 'GET':
          res.json({error: 'Nothing to see here... yet.'});
          break;
        case 'POST':
          res.json({error: 'Invalid route for User POST.'});
          break;
        case 'PUT':
          User.update(req, res);
          break;
        case 'DELETE':
          User.remove(req, res);
          break;
      }
    }
    else {
      if (req.method == 'POST') {
        // if (!req.decoded) {
          User.create(req, res);
        // }

        // res.status(404).json({
        //   result: false,
        //   message: 'Nothing to be found here.'
        // });
      }
    }
  }
}
