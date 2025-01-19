const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bug-report')
		.setDescription('Report a bug to the developers.'),
	execute: async function(interaction, client) {

		client.cache.bugReport.set(interaction.user.id, {
			title: null,
			priority: 1,
			bug: null,
		});

		await interaction.deferReply({ ephemeral: true });

		const button = client.buttons.get('bug-report');
		return await button.execute(interaction, client, [ 'view' ]);
	}
}