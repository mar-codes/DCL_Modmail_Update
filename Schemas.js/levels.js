const { Schema, model } = require('mongoose');

const schema = new Schema({
	guildID: String,
	userID: String,
	type: String,
	level: Number,
	xp: Number
});

module.exports = model('levels', schema);