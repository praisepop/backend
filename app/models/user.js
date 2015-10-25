var mongoose = require('mongoose')
    bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10;

var random = require('mongoose-simple-random');

var Schema = mongoose.Schema;

var userSchema = new Schema({
  token: { type: String, required: false },
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

userSchema.pre('save', function(next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
      if (err) return next(err);

      // hash the password along with our new salt
      bcrypt.hash(user.password, salt, function(err, hash) {
          if (err) return next(err);

          // override the cleartext password with the hashed one
          user.password = hash;
          next();
      });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
      if (err) return cb(err);
      cb(null, isMatch);
  });
};

module.exports = mongoose.model('User', userSchema);
