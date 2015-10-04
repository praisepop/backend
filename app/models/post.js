var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
  to: {
    name: { type: String, required: false},
    id: { type: Schema.Types.ObjectId, required: false, ref: 'User' }
  },
  org: { type: Schema.Types.ObjectId, required: true },
  body: { type: String, required: true },
  type: { type: String, required: true, uppercase: true, enum: [
    'SHOUTOUT', 'INVITE', 'ANNOUNCEMENT'
  ]},
  from: { type: Schema.Types.ObjectId, required: true },
  hidden: { type: Boolean, default: false},
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  hastags: [{ type: String, unique: true }],
  reports: [{
    reported_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    created_at: { type: Date, default: Date.now }
  }]
});

postSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('Post', postSchema);
