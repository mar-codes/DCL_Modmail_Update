const { model, Schema } = require("mongoose");
const { created } = require("../utils/Logs");

const modmailSchema = new Schema({
    guildID: { type: String, required: true },
    userID: { type: String, required: true },
    channelID: { type: String, required: true },
    closed: { type: Boolean, default: false },
    createdTimestamp: { type: Number, default: Date.now },
    closedTimestamp: { type: Number, default: null },
    messageCount: { type: Number, default: 0 },
    lastMessageTimestamp: { type: Number, default: Date.now }
});

module.exports = model("modmail", modmailSchema);