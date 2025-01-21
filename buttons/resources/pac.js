module.exports = {
	customID: 'pac',
	execute: async function(interaction, client, args) {

		const embed = {
			title: 'Our Custom Packages! 📁',
			description: `Below are both the **Slash Command Package**, and the **Badge Package**! You can use them along with their respective *video*.\n\n**Slash Command Package:** The Slash Command Package is our baseline package for Discord.js v14 bots. Use this package if you are trying to make a discord bot!\n- Corresponding Tutorial | https://youtu.be/OgIfnYDa5_Q\n\n**Badge Package:** The Badge Package has ALL of the Discord Profile Badges as PNG files! You can add these emojis to a server that your bot is in for the *badge command.*\n- Corresponding Tutorial | https://youtu.be/Ay4ZUFSQIWs`,
			color: 0x4caf50
		};

		const buttons = {
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
					label: 'Badge Package',
					style: 5,
					url: 'https://www.mediafire.com/file/ijj66t743bcv0l8/Badges.zip/file',
					emoji: '🎖️'
				}
			]
		};

		await interaction.reply({
			embeds: [embed],
			components: [buttons],
			ephemeral: true
		});

	}
};