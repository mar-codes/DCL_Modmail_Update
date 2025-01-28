const config = {
    guild: {
        id: '1186251693122388010',
        modmailCategoryId: '1330773760835584103',
        sendPrefix: '.',
        logChannel: ""
    },
    colors: {
        primary: 0x2B82E3,
        error: 0xFF0000,
        success: 0x00FF00
    },
    channels: {
        applicationchannel: "1283574200090493020"
    },
    emojis: {
        success: '🗳️',
        error: '❌',
        lock: '🔒',
        transcript: '📜',
        blacklist: '⛔',
        status: null,
        attachment: '📎'
    },
    staffRoles: {
        moderator: '970775928701603841', // Moderator
        seniormoderator: '1197981219418296520', // Head Mod
        admin: '970775928701603846', // Admin
        owner: '970775928722567171' // Owner
    },
    statusEmojis: {
        online: '🟢 Online',
        idle: '🟡 Idle',
        dnd: '🔴 Do Not Disturb',
        offline: '⚫ Offline'
    },
    updateInterval: 60000,
    embeds: {
        ticket: {
            color: 0x2B82E3,
            title: '📬 Modmail Ticket Created'
        }
    }
};

module.exports = config;
