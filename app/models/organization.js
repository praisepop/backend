var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var organizationSchema = new Schema({
  name: { type: String, required: false },
  domain: { type: String, required: true },
  created_by: { type: ObjectId, ref: 'User' },
	created_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default: Date.now }
});

organizationSchema.pre('save', function(next){
  now = new Date();
  this.updated_at = now;
  next();
});

module.exports = mongoose.model('Organization', organizationSchema);
