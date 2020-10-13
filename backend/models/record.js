const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RecordSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  usedTime: {
    type: Number,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  period: {
    type: String,
    required: true
  }
});

// Creating a table within database with the defined schema
const Record = mongoose.model('Record', RecordSchema);

// Exporting table for querying and mutating
module.exports = Record;