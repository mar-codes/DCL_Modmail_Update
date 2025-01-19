const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('solve')
		.setDescription('Mark a post as solved'),
	execute: async function(interaction, client) {

		await interaction.deferReply().catch( () => {} )

		if (
			!Object.keys(client.config.HELP_ROLES).includes(interaction.channel.parentId) &&
			interaction.channel.parentId !== '1090696098064113764'
		) return await interaction.editReply({
			content: `This command may only be used within help forums - Create a post to get started!`,
		});

		if (
			interaction.user.id !== interaction.channel.ownerId && // Check post owner
			!client.config.STAFF_ROLES.some(role => interaction.member._roles.includes(role)) // Check staff
		) return await interaction.editReply({
			content: '⚠️ You are not the owner of this thread!',
		});

		try {
			const embed = {
				description: `
**This thread has been marked as solved.**

Be sure to thank our helpers! </thank:1186005147017556048>

This post will be closed shortly...
Still need help? Open a new post!`,
				color: 0x2196f3,
				timestamp: new Date()
			}

			await interaction.editReply({ embeds: [embed] });

			setTimeout(async () => {
				await interaction.channel.setLocked(true);
				await interaction.channel.setArchived(true);
				client.cache.purgeChannels.set(interaction.channel.id, Date.now());
				client.cache.lastMessage.delete(interaction.channel.id);
			}, 1000 * 15);

			// setTimeout(async () => {
			// 	await interaction.channel.delete();
			// }, 1000 * 60 * 5);

		} catch (error) {
			console.log(error);
			await interaction.editReply({
				content: `Something went wrong, contact Music Maker about this!`,
				ephemeral: true
			});
		}

	}
}
