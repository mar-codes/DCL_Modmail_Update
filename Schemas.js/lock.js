const { Schema, model } = require('mongoose');

const schema = new Schema({
	Guild: String,
	Channel: String,
	Permissions: Array,
	Locked: Boolean
});

module.exports = model('lock', schema);