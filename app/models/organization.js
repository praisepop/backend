var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var organizationSchema = new Schema({
  name: { type: String, required: false },
  domain: { type: String, required: true },
  parent_org: [{ type: Boolean, required: true, default: true }],
  sub_orgs: [{ type: Schema.Types.ObjectId, ref:'Organization' }],
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
	created_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default: Date.now }
});

organizationSchema.pre('save', function(next){
  now = new Date();
  this.updated_at = now;
  next();
});

module.exports = mongoose.model('Organization', organizationSchema);
