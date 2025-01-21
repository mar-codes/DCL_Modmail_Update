const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tags')
		.setDescription('a'),
	execute: async function(interaction, client) {
		const tags = await interaction.channel.appliedTags;
		console.log(tags);

		interaction.reply({
			content: 'Check console',
			ephemeral: true
		});
	}
};