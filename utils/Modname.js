const ASCIIRegex = /^[\x20-\x7E]+$/;
module.exports = async function Modname(client, member) {
	const newName = member.nickname ?? member.displayName;
	if (!newName) return;

	const isPingable = ASCIIRegex.test(newName);
	const isHoisted = newName.startsWith('!');
	const isEveryone = newName.includes('@everyone') || newName.includes('@here');
	const isInvite = ['dsc.gg', 'discord.gg/', 'discord.com/invite/', 'discordapp.com/invite/'].some(newName.includes.bind(newName));
	
	if (isPingable && !(isHoisted || isEveryone || isInvite)) return;

	if (isHoisted && isPingable && !isEveryone && !isInvite) {
		const cleanName = newName.replace(/^!+/, '');
		if (cleanName.length > 1) { 
			try {
				await member.setNickname(cleanName);
				return cleanName;
			} catch (error) {
				console.error(error);
			}
		}
	}
0
	// try their username, check if it breaks server automod
	const rules = await GetAutomodRules(member.guild);
	if (!rules.length) return;
	const isBlocked = rules.some(rule => rule.test(member.user.username));
	const username = isBlocked ? `ModName ${Math.floor(Math.random() * 9000) + 1000}` : String(member.user.username);

	try {
		await member.setNickname(username);
		return username;
	} catch (error) {
		console.error(error);
	}
}

let rules = [ new RegExp() ];
let lastFetch = 0;
async function GetAutomodRules(guild) {
	if (Date.now() - lastFetch < 1000 * 60 * 30) return rules;

	const automodRule = await guild.autoModerationRules.fetch('1099571278328905728');
	if (!automodRule) return rules;
	if (!automodRule.triggerMetadata.keywordFilter) return [];

	rules.length = 0; // clear array
	rules = automodRule.triggerMetadata.keywordFilter.map(keyword => new RegExp(keyword.replace('*', '.*'), 'i'));
	lastFetch = Date.now();
	return rules;
}