module.exports = {
	customID: 'resources-mongo',
	execute: async function(interaction, client, [ fromChannel ]) {

		await interaction.deferUpdate().catch(() => {});

		const embed = {
			description: `
📗 - Beginner
📘 - Intermediate
📕 - Advanced
📚 - Mastery

Databases truly are where the heart of the application lives, data is always becoming an increasing concern for developers and users alike.
Mongo is an extremely forgiving choice as it is easy to pick up for beginners and works straight out of the box without configuration.

📗 - [MrJAwesome](https://youtu.be/nv38zCeFBHg)
📗 - [MongoDB University](https://learn.mongodb.com/)
📘 - [MongoDB Docs](https://docs.mongodb.com/)

*( More coming soon - Stay tuned! )*
`,
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