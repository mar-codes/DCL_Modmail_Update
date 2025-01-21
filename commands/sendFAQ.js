const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
	.setName('faq')
	.setDescription('Sends a FAQ lookup'),
	execute: async function (interaction, client) {
		const button = client.buttons.get('faq-main');
		await button.execute(interaction, client, ['a']);
	}
}