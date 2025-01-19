const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('modname')
		.setDescription('Moderate a users name')
		.addUserOption(x => x
			.setName('user')
			.setDescription('The user to moderate')
			.setRequired(true)
		),
	async execute(interaction, client) {
		await interaction.deferReply();

		const embed = {
			description: '',
			color: 0x2196f3,
		};

		const member = interaction.options.getMember('user');

		const newUsername = await client.modname(member);
		if (!newUsername) {
			embed.description = `🎩 No changes needed for ${member}`;
		} else {
			embed.description = `✨ Successfully reset ${member}'s name to ${newUsername}`;
		}

		interaction.editReply({ embeds: [embed] });
	}
}