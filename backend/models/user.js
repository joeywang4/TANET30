const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { userGroupEnum } = require('../const');

const UserSchema = new Schema({
	name: {
		type: String,
		required: [true, 'Name field is required.']
  },
  group: {
    type: String,
    enum: userGroupEnum,
    required: [true, 'User group is required']
  },
	pwdHash: {
		type: String,
		required: [true, 'Password hash field is required.']
  },
  email: {
	  type: String,
	  required: [true, 'Email field is required.']
  }
});

// Creating a table within database with the defined schema
const User = mongoose.model('User', UserSchema);

// Exporting table for querying and mutating
module.exports = User;