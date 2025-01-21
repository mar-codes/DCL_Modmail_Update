const { Schema, model } = require('mongoose');

const schema = new Schema({
	guildID: String,
	userID: String,
	type: Number,
	timestamp: Number
});

module.exports = model('heists', schema);