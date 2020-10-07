const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PaperSchema = new Schema({
  ID: {
    type: String,
    required: false
  },
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