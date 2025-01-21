const { Schema, model } = require('mongoose');

const deniedAppSchema = new Schema({
    id: { type: String, required: true },
    guildID: { type: String, required: true },
    userID: { type: String, required: true },
    submittedAt: { type: Date, required: true },
    deniedTimestamp: { type: Date, required: true },
    questions: [{
        _id: false,
        question: { type: String, required: true },
        answer: { type: String, default: null },
        optional: { type: Boolean, default: false }
    }]
});

module.exports = model('deniedApps', deniedAppSchema);