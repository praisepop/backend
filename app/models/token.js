var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tokenSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  valid: { type: Boolean, default: true }
});

tokenSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('Token', tokenSchema);
