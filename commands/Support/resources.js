const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('resources')
    .setDescription('View server resources for programming and useful packages!'),
    execute: async function (interaction) {

		await interaction.deferReply({ ephemeral: true }).catch(() => {});

		const tutorials = {
			type: 1,
			components: [
				{
					type: 2,
					label: 'Packages',
					style: 1,
					custom_id: 'resources-packages',
					emoji: '📦'
				},
				{
					type: 2,
					label: 'JavaScript',
					style: 2,
					custom_id: 'resources-js',
					emoji: {
						id: "1286507408293757002",
						name: "nodejs"
					}
				},
				{
					type: 2,
					label: 'Databases',
					style: 2,
					custom_id: 'resources-database',
					emoji: {
						id: "1184627538144804865",
						name: "database"
					}
				},
				{
					type: 2,
					label: 'Web',
					style: 2,
					custom_id: 'resources-web',
					emoji: '🌐'
				}
			]
		}

		const embed = {
			title: 'Welcome to the server resources!',
			description: `
Here we have compiled a comprehensive list of websites, youtube channels, and documentation to help you get started with programming. We have varied resources depending on your experience level so everyone has something to learn. Feel free to ask for help as per usual if you need clarification <3`,
			color: 0x2196f3
		}

		await interaction.editReply({
			embeds: [embed],
			components: [tutorials]
		});
    }
}
