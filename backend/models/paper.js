const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PaperSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  authors: {
    type: String,
    required: true
    // type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    // required: true
  },
  group: {
    type: String,
    required: true
  },
  timestamp: {
    type: Number,
    required: true
  }
});

// Creating a table within database with the defined schema
const Paper = mongoose.model('Paper', PaperSchema);

// Exporting table for querying and mutating
module.exports = Paper;