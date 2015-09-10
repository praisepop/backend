var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var upvoteSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  upvoted_by: { type: Schema.Types.ObjectId, ref: 'User' },
  notified: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

upvoteSchema.pre('save', function(next){
  now = new Date();
  this.updated_at = now;
  next();
});

module.exports = mongoose.model('Upvote', upvoteSchema);
