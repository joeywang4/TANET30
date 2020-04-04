const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ticketTypeEnum } = require('../const');

const TicketSchema = new Schema({
	owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
		required: true
	},
	type: {
		type: String,
    enum: ticketTypeEnum,
		required: true
  },
  date: {
    type: String,
    required: true
  },
  usedTime: {
	  type: Number,
	  required: true
  }
});

// Creating a table within database with the defined schema
const Ticket = mongoose.model('Ticket', TicketSchema);

// Exporting table for querying and mutating
module.exports = Ticket;