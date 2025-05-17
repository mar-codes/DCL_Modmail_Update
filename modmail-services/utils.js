function formatTimestamp(timestamp) {
    return {
        relative: `<t:${Math.floor(timestamp / 1000)}:R>`,
        absolute: `<t:${Math.floor(timestamp / 1000)}:f>`
    };
}

function formatUserStatus(status = 'offline') {
    const statusMap = {
        online: '🟢 Online',
        idle: '🟡 Idle',
        dnd: '🔴 Do Not Disturb',
        offline: '⚫ Offline'
    };

    return statusMap[status] || statusMap.offline;
}

module.exports = {
    formatTimestamp,
    formatUserStatus
};