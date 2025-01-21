const { model, Schema } = require('mongoose');

const schema = new Schema({
    guildID: { type: String, required: true },
    userID: { type: String, required: true },
    month: { type: Number, required: true },
    points: { type: Number, default: 0 },
});

module.exports = model('thanks', schema);