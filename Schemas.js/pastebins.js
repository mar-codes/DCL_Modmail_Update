const { model, Schema } = require('mongoose');

const pastebinSchema = new Schema({
	id: 			{ type: String, required: true, unique: true },
	title: 			{ type: String, required: true },
	description: 	{ type: String, required: true },
	uploadDate: 	{ type: Number, required: true, default: Date.now() },
	authorID: 		{ type: String, required: true }
});

module.exports = model('pastebins', pastebinSchema);