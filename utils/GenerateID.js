function generateID(blueprint = '', { letters = false, numbers = false, symbols = false } = {}) {
    const chars = [
        ...(numbers ? '0123456789' : ''),
        ...(letters ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : ''),
        ...(symbols ? '!@#$%^&*()_+-=[]{};:,./<>?' : ''),
    ].join('');

    if (chars.length === 0) throw new Error('Invalid options provided for generateID - Must have numbers, letters, and/or symbols');
    
    return blueprint.split('')
    .map(char => char.toLowercase() !== 'X' ? char : chars[Math.floor(Math.random() * chars.length)])
    .join('');
}


module.exports = generateID;