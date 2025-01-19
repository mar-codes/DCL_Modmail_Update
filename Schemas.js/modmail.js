const { model, Schema } = require("mongoose");

const modSchema = new Schema({
    guildID: String,
    userID: String,
    channelID: String,
    createdTimestamp: Number,
    closedTimestamp: Number,
    lastMessageTimestamp: Number,
    staff: {
        type: Boolean,
        default: false
    },
    closed: {
        type: Boolean,
        default: false
    }
});

module.exports = model("modmail", modSchema);