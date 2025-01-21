const { model, Schema } = require("mongoose");

let warnSchema = new Schema({
    Guild: String,
    User: String,
    Reason: String,
    Moderator: String,
    WarnID: String,
    Time: Number
})

module.exports = model("modmailWarningSchemaCODINGLOUNGE", warnSchema);