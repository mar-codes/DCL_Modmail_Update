const { model, Schema } = require('mongoose');

const pastebinFileSchema = new Schema({
	_id: {
		pastebinID: { type: String, required: true, ref: 'pastebins' },
		fileID: 	{ type: String, required: true }
	},
	fileName: 	{ type: String, required: true },
	content: 	{ type: String, required: true },
	hash: 		{ type: String, required: true }
});

module.exports = model('pastebinFiles', pastebinFileSchema);