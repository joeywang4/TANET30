const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TXSchema = new Schema({
	from: {
		type: String,
		required: true
	},
	to: {
		type: String,
		required: true
  },
  amount: {
	  type: String,
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