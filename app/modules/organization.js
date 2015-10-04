var organization = require('../models/organization.js');
var user = require('../models/user.js');

module.exports = {
  process: function(meta, person) {
    var parent = meta.parent;
    var domain = meta.parent_domain;
    var subdomain = meta.subdomain;

    organization.findOne({ domain : domain }, function(err, resultOrg) {
      if (err) throw err;

      if (!resultOrg) {
        var newOrg = {
          domain: domain,
          created_by: user.id,
          parent: true
        }

        organization.create(newOrg, function(newOrg, orgResult) {
          if (err) throw err;

          if (orgResult) {
            user.findOneAndUpdate({email : person.email}, {$push: {orgs: orgResult.id}}, function(err, result) {
              if (err) throw err;

              if (result) {
                return true;
              }
              else {
                res.status(500).json({
                  success: false,
                  message: 'There was an internal error.'
                });
              }
            });

            if (!parent) {
              var subOrg = {
                domain: subdomain,
                created_by: user.id,
                parent: false,
                parent_org: orgResult.id
              };

              organization.create(subOrg, function(err, result) {
                if (err) throw err;

                if (result) {
                  user.findOneAndUpdate({email : person.email}, {$push: {orgs: result.id}}, function(err, result) {
                    if (err) throw err;

                    if (result) {
                      return true;
                    }
                    else {
                      res.status(500).json({
                        success: false,
                        message: 'There was an internal error.'
                      });
                    }
                  });
                }
              });
            }
            else {
              if (orgResult) return true;
            }
          }
        });
      }
      else {
        organization.findOne({ domain : subdomain }, function(err, result) {
          if (err) throw err;

          if (!result) {
            var subOrg = {
              domain: subdomain,
              created_by: user.id,
              parent: false,
              parent_org: resultorganization.id
            };

            organization.create(subOrg, function(err, result) {
              if (err) throw err;

              if (result) {
                user.findOneAndUpdate({email : person.email}, {$push: {orgs: result.id}}, function(err, result) {
                  if (err) throw err;

                  if (result) {
                    return true;
                  }
                  else {
                    res.status(500).json({
                      success: false,
                      message: 'There was an internal error.'
                    });
                  }
                });
              }

              res.status(500).json({
                success: false,
                message: 'There was an internal error.'
              });
            });
          }
        });
      }
    });
  }
}
