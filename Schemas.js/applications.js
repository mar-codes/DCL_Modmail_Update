const { Schema, model } = require('mongoose');

const applicationSchema = new Schema({
    id: { type: String, required: true, unique: true },
    guildID: { type: String, required: true },
    userID: { type: String, required: true },
    submittedAt: { type: Date, required: true },
    questions: [{
        _id: false,
        question: { type: String, required: true },
        answer: { 
            type: String,
            default: null,  // Changed from empty string to null
            required: false
        },
        optional: { type: Boolean, default: false }
    }],
    accepted: { type: Boolean, required: true },
    language: { 
        type: String, 
        required: true, 
        enum: ['Javascript', 'Python', 'SQL', 'Mongo', 'Not specified'],
        default: 'Not specified'
    }
});

module.exports = model('applications', applicationSchema);