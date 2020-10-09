const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EventSchema = new Schema({
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  date: {
    type: String, 
    required: true
  },
  begin: {
    type: Number,
    required: true
  },
  end: {
    type: Number,
    required: true
  },
  participant: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Record' }],
    required: true
  },
  papers: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Paper' }],
    required: true
  },
  reward: {
    type: Number,
    required: true
  },
  password: {
    type: String,
    required: false
  },
  period: {
    type: Number,
    required: true
  }
});

// Creating a table within database with the defined schema
const Event = mongoose.model('Event', EventSchema);

// Exporting table for querying and mutating
module.exports = Event;