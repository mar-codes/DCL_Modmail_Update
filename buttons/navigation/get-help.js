module.exports = {
	customID: 'goto-get-help',
	execute: async function(interaction, client, [ confirm ] = []) {
		await interaction.deferReply({ ephemeral: true });
		
		if (confirm) {
			const goto = client.buttons.get('goto');
			return await goto.execute(interaction, client, ['commands', 'get-help']);
		}

		const embed = {
			description: '**You are about to ping the support team!**\nAre you sure you want to continue?',
			color: 0x2196f3
		}

		const buttons = {
			type: 1,
			components: [
				{
					type: 2,
					custom_id: 'close',
					emoji: '🕳️',
					label: 'I change my mind',
					style: 4
				},
				{
					type: 2,
					custom_id: 'goto-get-help_1',
					emoji: '🚀',
					label: 'I need help',
					style: 3
				}
			]
		}

		await interaction.editReply({
			embeds: [embed],
			components: [buttons]
		});
	}
}