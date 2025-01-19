module.exports = {
	customID: 'resources-packages',
	execute: async function(interaction, client, [ fromChannel ]) {

		// const button = client.buttons.get('pac');
		// button.execute(interaction, client);
		// return;

		if (fromChannel) {
			await interaction.deferReply({ ephemeral: true }).catch(() => {});
		} else {
			await interaction.deferUpdate().catch(() => {});
		}

		const embed = {
			description: `
📦 - Slash Command Package
The legacy package for older videos, perfect for beginners but not built for scale. This is the go-to if you are new to development here on discord!

📦 - Dev Toolkit
All new and improved with some much needed fresh paint, this package is built to last and comes with everything a starting developer could need, how awesome is that?

🏅 - Badge Images
This is just an archive of images for the older [Badge Command](https://www.youtube.com/watch?v=Ay4ZUFSQIWs), this is not a package for running bots!`,
			color: 0x2196f3
		}

		const downloadButtons = {
			type: 1,
			components: [
				{
					type: 2,
					label: 'Slash Command Package',
					style: 5,
					url: 'https://www.mediafire.com/file/9zb43qlrstlfrex/SlashCommand_Package.zip/file',
					emoji: {
						id: '1000093816012943451',
						name: 'Slash_Commands'
					}
				},
				{
					type: 2,
					label: 'Dev Toolkit',
					style: 5,
					url: 'https://www.mediafire.com/file/g24dxp1i6739cxx/DevToolkit_%281%29.zip/file',
					emoji: {
						id: '1050871360093704293',
						name: 'Admin'
					}
				},
				{
					type: 2,
					label: 'Badge Images',
					style: 5,
					url: 'https://www.mediafire.com/file/ijj66t743bcv0l8/Badges.zip/file',
					emoji: '🏅'
				}
			]
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
			components: [downloadButtons]
		}

		if (!fromChannel) {
			messagePayload.components.push(backButton)
		}

		await interaction.editReply(messagePayload);
	}
}
