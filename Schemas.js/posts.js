const { Schema, model } = require('mongoose');

const codingSharePosts = new Schema({
	userID: { type: String, required: true },
	channelID: { type: String, required: true },
	postName: { type: String, required: true },
	datePosted: { type: Number, required: true },
	deleted: { type: Boolean, default: false }
});

codingSharePosts.index({ userID: 1, channelID: 1 }, { unique: true });
codingSharePosts.index({ userID: 1 });

module.exports = model('codingSharePosts', codingSharePosts);