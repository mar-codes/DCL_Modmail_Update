module.exports = {
	customID: 'resources-database',
	execute: async function(interaction, client, [ fromChannel ]) {

		if (fromChannel) {
			await interaction.deferReply({ ephemeral: true }).catch(() => {});
		} else {
			await interaction.deferUpdate().catch(() => {});
		}

		const embed = {
			description: `
Which database are you looking to use?

🍃 - MongoDB : Easy for beginners, very flexible and scalable, can be a bottleneck if not used correctly

🐬 - SQL : The big grand daddy of databases, very powerful and fast but difficult to learn propperly`,
			color: 0x2196f3
		}

		const selection = {
			type: 1,
			components: [
				{
					type: 2,
					custom_id: `resources-mongo${fromChannel ? '_1' : ''}`,
					emoji: '🍃',
					label: 'MongoDB',
					style: 2
				},
				{
					type: 2,
					custom_id: `resources-sql${fromChannel ? '_1' : ''}`,
					emoji: '🐬',
					label: 'SQL',
					style: 2
				}
			]
		}

		await interaction.editReply({
			embeds: [embed],
			components: [selection]
		});

	}
}