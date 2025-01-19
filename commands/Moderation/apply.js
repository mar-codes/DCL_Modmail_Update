const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('apply')
		.setDescription('Apply for a staff position.'),
	execute: async function(interaction, client) {

		client.cache.applications.set(interaction.user.id, {
			guildID: interaction.guild.id,
			userID: interaction.user.id,
			questions: [
				{
					question: 'What language do you specialize in?',
					answer: 'Javascript',
					choices: ['Javascript', 'HTML', 'SQL', 'Mongo'],
					shortText: 'Language',
					emoji: '🔌'
				},
				{
					question: 'Briefly describe yourself.',
					answer: '',
					maxLength: 256,
					shortText: 'About Me',
					emoji: '🕹️'
				},
				{
					question: 'What project are you most proud of?',
					answer: '',
					maxLength: 512,
					shortText: 'Projects',
					emoji: '💾'
				}
			]
		});

		await interaction.deferReply({ ephemeral: true });

		const button = client.buttons.get('apply');
		return await button.execute(interaction, client);

	}
}