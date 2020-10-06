const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TXSchema = new Schema({
  from: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Number,
    required: true
  }
});

// Creating a table within database with the defined schema
const TX = mongoose.model('TX', TXSchema);

// Exporting table for querying and mutating
module.exports = TX;