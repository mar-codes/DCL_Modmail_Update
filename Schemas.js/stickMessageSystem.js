const { Schema, model } = require('mongoose');
const crypto = require('crypto');

let sticky = new Schema({
    Guild: String,
    Message: String,
    Channel: String,
    Count: Number,
    Cap: Number,
    LastMessageId: String,
    uniqueId: {
        type: String,
        default: () => crypto.randomBytes(3).toString('hex').toUpperCase(),
        unique: true
    }
});

module.exports = model('stickyschema', sticky);