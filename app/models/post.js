var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
  addressed_to: {
    name: { type: String, required: false},
    id: { type: ObjectId, required: false, ref: 'User' }
  },
  body: { type: String, required: true },
  type: { type: String, required: true, uppercase: true, enum: [
    'SHOUTOUT', 'INVITE', 'ANNOUNCEMENT'
  ]},
  posted_by: { type: ObjectId, required: true },
  hidden: { type: Boolean, default: false},
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  hastags: [{ type: String, unique: true }],
  reports: [{
    reported_by: { type: ObjectId, ref: 'User', required: true },
    created_at: { type: Date, default Date.now }
  }]
});

postSchema.pre('save', function(next){
  now = new Date();
  this.updated_at = now;
  next();
});

module.exports = mongoose.model('Post', postSchema);
