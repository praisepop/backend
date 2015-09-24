var org = require('../models/organization.js');

module.exports = {
  create: function(organization, domain) {
    org.create(organization, function(err, result) {
      if (err) throw err;

      if (result) {
        if (domain) {
          org.findOneAndUpdate({domain : domain}, {$push: {sub_orgs: result.id}}, function(err, result) {
            if (err) throw err;

            if (result) {
                return true;
            }
          });
        }
        return true;
      }

      return false;
    });
  },
  process: function(meta, user) {
    var parent = meta.parent;
    var domain = meta.parent_domain;
    var subdomain = meta.subdomain;

    org.findOne({ domain : domain }, function(err, result) {
      if (err) throw err;

      if (!result) {
        var newOrg = {
          domain: domain,
          created_by: user.id,
          parent_org: true
        }

        var result = module.exports.create(newOrg, null);

        if (!parent) {
          org.findOne({ domain : domain }, function(err, result) {
            if (err) throw err;
            if (!result) {
              var subOrg = {
                domain: subdomain,
                created_by: user.id,
                parent_org: false
              };

              module.exports.create(subOrg, domain);
            }
          });
        }
        else {
          if (result) return true;
        }
      }
      else {
        org.findOne({ domain : domain }, function(err, result) {
          if (err) throw err;
          if (!result) {
            var subOrg = {
              domain: subdomain,
              created_by: user.id,
              parent_org: false
            };

            var result = module.exports.create(subOrg, domain);
            if (result) return true;
          }
        });
      }
    });
  }
}
