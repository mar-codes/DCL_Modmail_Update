const config = require('./config.js');

const formatTimestamp = (timestamp) => {
    const unix = Math.floor(timestamp / 1000);
    return {
        relative: `<t:${unix}:R>`,
        full: `<t:${unix}:F>`
    };
};

const formatUserStatus = (member) => {
    const status = member?.presence?.status || 'offline';
    return config.statusEmojis[status] || config.statusEmojis.offline;
};

module.exports = {
    formatTimestamp,
    formatUserStatus
}