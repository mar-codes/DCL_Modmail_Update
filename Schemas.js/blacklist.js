const { Schema, model } = require('mongoose');

const blacklistSchema = new Schema({
    userID: String,
    reason: String,
    moderatorID: String,
    timestamp: Number
});

module.exports = model('blacklist', blacklistSchema);