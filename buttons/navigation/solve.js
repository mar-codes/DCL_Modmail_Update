module.exports = {
	customID: 'solve',
	execute: async function(interaction, client, [ confirm ] = []) {
		await interaction.deferReply({ ephemeral: true });

		if (confirm) {
			const goto = client.buttons.get('goto');
			return await goto.execute(interaction, client, ['commands', 'solve']);
		}

		const embed = {
			description: '**Are you sure you want to solve this issue?**\nThis will lock the post, it cannot be undone.',
			color: 0x2196f3
		}

		const buttons = {
			type: 1,
			components: [
				{
					type: 2,
					custom_id: 'solve_1',
					emoji: '🚀',
					label: 'Solve',
					style: 3
				},
				{
					type: 2,
					custom_id: 'close',
					emoji: '🕳️',
					label: 'Nevermind',
					style: 4
				}
			]
		}

		await interaction.editReply({
			embeds: [embed],
			components: [buttons]
		});
	}
}
