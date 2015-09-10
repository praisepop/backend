var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var reactionSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  type: { type: String, required: true, uppercase: true, enum: [
      'EMOJI', 'TEXT'
  ]},
  notified: { type: Boolean, default: true },
  reaction: { type: String, required: true },
  reactor: { type: Schema.Types.ObjectId, ref: 'User' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

reactionSchema.pre('save', function(next){
  now = new Date();
  this.updated_at = now;
  next();
});

module.exports = mongoose.model('Reaction', reactionSchema);
