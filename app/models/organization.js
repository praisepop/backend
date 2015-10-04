var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var organizationSchema = new Schema({
  name: { type: String, required: false },
  domain: { type: String, required: true },
  parent: { type: Boolean, required: true, default: true },
  parent_org: { type: Schema.Types.ObjectId, required: false},
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
	created_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default: Date.now }
});

organizationSchema.pre('save', function(next) {
  this.updated_at = new Date();
  done();
});

module.exports = mongoose.model('Organization', organizationSchema);
