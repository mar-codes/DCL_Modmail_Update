module.exports = {
	customID: 'resources-main',
	execute: async function(interaction, client) {
		await interaction.deferUpdate().catch(() => {});
		const command = client.commands.get('resources');
		command.execute(interaction);
	}
}