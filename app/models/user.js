var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  salt: { type: String, required: true },
  token: { type: String required: false }
  password: { type: String, required: true },
  email: { type: String, lowercase: true, trim: true, required: true, unique: true, dropDups: true },
  name: {
    first: { type: String, required: true },
    last: { type: String, required: true }
  },
  organization: { type : ObjectId, ref: 'Organization' }
  verfied: { type: Boolean, default: false, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

userSchema.pre('save', function(next){
  now = new Date();
  this.updated_at = now;
  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
