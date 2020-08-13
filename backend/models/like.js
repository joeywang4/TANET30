const mongoose = require('mongoose')
const Schema = mongoose.Schema

const LikeSchema = new Schema({
	user: {
		type: String,
		required: true
	},
	event: {
		type: String,
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