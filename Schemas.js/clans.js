const { Schema, model } = require('mongoose');

const clanSchema = new Schema({
	roleID: {
		type: String,
		required: true,
		unqiue: true
	},
	points: {
		type: Number,
		default: 0,
		min: 0,
		required: true,
	},
	cooldown: {
		type: Number,
		default: 0,
		min: 0,
		required: true
	}
});

clanSchema.index({ roleID: 1 }, { unique: true });

module.exports = model('Clan', clanSchema);