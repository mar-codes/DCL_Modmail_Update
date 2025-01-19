const { Schema, model } = require('mongoose');

const schema = new Schema({
	guildID: { type: String, required: true },
	itemID: { type: String, required: true },
    userID: { type: String, default: null },

    name: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true, default: 0 },

    modifiers: {
        roles: {
            addID: { type: String, default: null },
            removeID: { type: String, default: null }
        },
        xp: {
            add: { type: Number, default: 0 },
            remove: { type: Number, default: 0 }
        },
        channelPerms: {
            channelID: { type: String, default: null },
            perms: { type: Number, default: 0 }
            /*
            0 = Basic
                - View Channel
                - Read Message History
            1 = Member (all of the above +)
                - Send Messages
            2 = Community (all of the above +)
                - Embed Links
                - Attach Files
                - Add Reactions
                - Use External Emojis
            3 = Moderator (all of the above +)
                - Manage Messages
            */
        },
        sendMessage: {
            channelID: { type: String, default: null },
            content: { type: String, default: null },
            embed: { type: Object, default: null }
        },
        // Custom ID of a modifier to run, this is a complete overhaul of the typical usage system
        // Using this, you are responsible for removing the item from the user's inventory
        // This is useful for things like custom roles, you don't know what the user wants and need to pop up a menu
        override: { type: String, default: null }
    },
    
    restrictions: {
        roleID: { type: String, default: null },
        level: { type: Number, default: null },
        money: { type: Number, default: null },
        daysInServer: { type: Number, default: null }
    },

    modifierKeys: {
        roles: { type: Boolean, default: false },
        xp: { type: Boolean, default: false },
        channelPerms: { type: Boolean, default: false },
        sendMessage: { type: Boolean, default: false },
        override: { type: Boolean, default: false }
    },
    restrictionKeys: {
        roleID: { type: Boolean, default: false },
        level: { type: Boolean, default: false },
        money: { type: Boolean, default: false },
        daysInServer: { type: Boolean, default: false }
    }
});

schema.index({ guildID: 1, itemID: 1, userID: 1 }, { unique: true });

module.exports = model('items', schema);