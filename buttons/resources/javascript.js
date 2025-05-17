module.exports = {
	customID: 'resources-js',
	execute: async function(interaction, client, [ fromChannel ]) {

		if (fromChannel) {
			await interaction.deferReply({ ephemeral: true }).catch(() => {});
		} else {
			await interaction.deferUpdate().catch(() => {});
		}

		const embed = {
			title: 'JavaScript Resources',
			description: `
📗 - Beginner
📘 - Intermediate
📕 - Advanced
📚 - Mastery

Ready to learn JavaScript? Here are some resources to help you get started!
Please refer to the above emojis to determine the difficulty of the resource, we recommend starting with the 📗 resources if you are new to programming!

📗 - [Javascript.Info](https://javascript.info/)
📗 - [Learn JavaScript](https://learnjavascript.online/)
📗 - [Discord.js Guide](https://discordjs.guide/#before-you-begin)
📘 - [Discord.js Documentation](https://discord.js.org/#/docs/discord.js/main/general/welcome)
📘 - [The MrJAwesome YouTube](https://youtube.com/c/@MrJAwesomeYT)
📘 - [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
📕 - [Official Discord API](https://discord.com/developers/docs/intro)
📕 - [Node.js Docs](https://nodejs.org/en/docs/)
📚 - [MDN - Event Loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop)
📚 - [MDN - Memory](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_management)`,
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
			messagePayload.components = [backButton]
		}

		await interaction.editReply(messagePayload);

	}
}
