const { Schema, model } = require('mongoose');

const schema = new Schema({
	guildID: { type: String, required: true },
	userID: { type: String, required: true },
	gameName: { type: String, required: true },
	gameID: { type: String, required: true, unique: true },
	started: { type: Number, required: true },
	status: { type: Boolean, required: true },
});

schema.index({ guildID: 1, userID: 1 }, { unique: true });

module.exports = model('gameLobby', schema);