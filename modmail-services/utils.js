const config = require('./config.js');

function formatTimestamp (timestamp) {
    const unix = Math.floor(timestamp / 1000);
    return {
        relative: `<t:${unix}:R>`,
        full: `<t:${unix}:F>`
    };
};

function formatUserStatus (member) {
    return !member ? config.statusEmojis.leftServer : config.statusEmojis[member?.presence?.status] || config.statusEmojis.offline;
};

module.exports = {
    formatTimestamp,
    formatUserStatus
}