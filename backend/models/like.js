const mongoose = require('mongoose')
const Schema = mongoose.Schema

const LikeSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  state: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Number,
    required: true
  }
});

// Creating a table within database with the defined schema
const Like = mongoose.model('Like', LikeSchema);

// Exporting table for querying and mutating
module.exports = Like;