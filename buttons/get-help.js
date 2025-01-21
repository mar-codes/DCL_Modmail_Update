module.exports = {
	customID: 'get-help',
	execute: async function(interaction, client, roleIDs = []) {

		if (roleIDs.length === 0) {
			throw new Error('No role IDs provided');
		}

		const roles = new Array(roleIDs.length).fill({});
		for (const [ i, roleID ] of roleIDs.entries()) {
			roles[i] = await interaction.guild.roles.fetch(roleID);
		}

		const members = Array.from(new Set( roles.map(r => r.members).map(m => Array.from(m.values())).flat().filter( m =>
			(m.presence?.status ?? 'offline') !== 'offline'
		).map(m => `<@${m.id}>`) ) );

		if (members.length === 0) {
			const errEmbed = {
				title: 'Unavailable Helper Alert',
				description: `
It appears that none of our online helpers are currently unavailable to assist you.
Check back later, apologies for the inconvenience.`,
				color: 0xff0000
			}

			return await interaction.editReply({ embeds: [ errEmbed ] });
		}

		await interaction.channel.send({
			content: `👋 Heya helpers! ${interaction.member.user.globalName ?? interaction.user.username} needs help! Please do your best to assist them!\n>>> ${members.join('\n')}`
		});
		await interaction.deleteReply().catch( () => {} );

		client.cooldowns.set(`${interaction.user.id}-get-help`, (Date.now() + 1000 * 60 * 10));
	}
}
