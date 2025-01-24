const { SlashCommandBuilder } = require('@discordjs/builders');
const deniedAppSchema = require('../../Schemas.js/deniedApps');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('apply')
		.setDescription('Apply for a staff position.'),
	execute: async function(interaction, client) {
        try {
            const deniedApp = await deniedAppSchema.findOne({ userID: interaction.user.id });

            if (deniedApp) {
                const now = new Date();
                const deniedDate = new Date(deniedApp.deniedTimestamp);
                
                if (now < deniedDate) {
                    const timeDiff = deniedDate.getTime() - now.getTime();
                    const remainingDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                    return await interaction.reply({
                        content: `❌ You cannot apply yet. Please wait ${remainingDays} more day${remainingDays === 1 ? '' : 's'} before applying again.`,
                        ephemeral: true
                    });
                }
                
                await deniedAppSchema.deleteOne({ userID: interaction.user.id });
            }

		client.cache.applications.set(interaction.user.id, {
			guildID: interaction.guild.id,
			userID: interaction.user.id,
			questions: [
				{
					question: 'How old are you?',
					answer: '',
					maxLength: 2,
					shortText: 'Age',
					emoji: '🎂'
				},
				{
					question: 'What language do you specialize in?',
					answer: 'Javascript',
					choices: ['Javascript', 'SQL', 'Mongo'],
					shortText: 'Language',
					emoji: '💻'
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
				},
				{
					question: 'Your GitHub Profile URL',
					answer: '',
					maxLength: 100,
					shortText: 'GitHub',
					emoji: '🔗',
					placeholder: 'https://github.com/yourusername',
					optional: true
				}
			]
		});

		const button = client.buttons.get('apply');
		return await button.execute(interaction, client);
	} catch (error) { 
		console.error(error);
		return await interaction.reply({
			content: `An error occurred: \`${error.message}\``,
			ephemeral: true
		});
	}
  }
}
