module.exports = {
	customID: 'resources-web',
	execute: async function(interaction, client, [ fromChannel ]) {

		if (fromChannel) {
			await interaction.deferReply({ ephemeral: true }).catch(() => {});
		} else {
			await interaction.deferUpdate().catch(() => {});
		}

		const embed = {
			description: 'Coming soon - Web resources!',
			color: 0x2196f3
		}

		const backButton = {
			type: 1,
			components: [{
				type: 2,
				label: 'Back',
				style: 2,
				custom_id: 'resources-main'
			}]
		}

		const messagePayload = {
			embeds: [embed],
			components: []
		}

		if (!fromChannel) {
			messagePayload.components.push(backButton);
		}

		await interaction.editReply(messagePayload);
	}
}