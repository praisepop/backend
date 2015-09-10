var parser = require('email-addresses');

module.exports = {
  parse: function(email) {
    var address = parser.parseOneAddress(email);
    var domain = address.parts.domain.semantic;

    var parts = domain.split('.');

    var result = {};
    var subdomain;
    var parent_domain;

    if (parts.length > 2) {
      result['subdomain'] = domain;
    }

    result['parent_domain'] = parts[parts.length - 2]+'.'+parts[parts.length - 1];


    parts.pop(); // We don't care about the .EXT for the parsing...

    var is_parent = false;
    if (parts.length == 1) {
      is_parent = true
    }

    result['parent'] = is_parent;

    return result;
  }
}
