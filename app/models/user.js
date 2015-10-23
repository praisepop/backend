var mongoose = require('mongoose');
var random = require('mongoose-simple-random');

var Schema = mongoose.Schema;

var userSchema = new Schema({
  token: { type: String, required: false },
  salt: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, lowercase: true, trim: true, required: true, unique: true, dropDups: true },
  admin: { type: Boolean, default: false, required: true },
  name: {
    first: { type: String, required: true },
    last: { type: String, required: true }
  },
  orgs: [{ type : Schema.Types.ObjectId, ref: 'Organization' }],
  verified: { type: Boolean, default: false, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

userSchema.plugin(random);

userSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('User', userSchema);
