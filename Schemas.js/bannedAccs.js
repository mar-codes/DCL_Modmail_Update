const { Schema, model } = require('mongoose');

const bannedSchema = new Schema({
    userID: { type: String, required: true },
    guildID: { type: String, required: true },
    username: { type: String, required: true },
    reason: { type: String, default: 'No reason provided' },
    bannedTimestamp: { type: Date, required: true }
});

module.exports = model('banned', bannedSchema);