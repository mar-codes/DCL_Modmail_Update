const { Schema, model } = require('mongoose');

const schema = new Schema({
	id: { type: String, required: true, unique: true },
	guildID: { type: String, required: true },
	userID: { type: String, required: true },
	submittedAt: { type: Date, required: true },
	questions: [
		{
			question: { type: String, required: true },
			answer: { type: String, required: true }
		}
	],
	accepted: { type: Boolean, required: true },
	language: { type: String, required: true, enum: ['Javascript', 'Python', 'HTML', 'SQL', 'Mongo'] }
});

module.exports = model('staff-applications', schema);