module.exports = {
	customID: 'py',
	execute: async function(interaction, client, args) {
		const embed = {
			title: 'Python Resources <:py:1081859335874957335>',
			description: 'Below are the **best** Python resources our team could find for learning PY!',
			color: 0x4caf50,
			fields: [
				{
					name: 'Learn Python.org',
					value: 'Learn Python.org ~ https://www.learnpython.org/ ~ is one of the best ways to develop your python skills with a step by step system.'
				},
				{
					name: 'Discord.py Documentation',
					value: 'Discord.py Documentation ~ https://discordpy.readthedocs.io/en/stable/ ~ has everything you need to know about discord.py in doc format.'
				},
				{
					name: 'The Glowstik YouTube',
					value: 'For discord.py development, we recommend that you watch Glowstick on YouTube! The more commands you develop, the better you will understand py: following along ~ https://www.youtube.com/@glowstik/videos ~ will also help you develop cool commands and systems!'
				}
			]
		}

        return await interaction.reply({ embeds: [embed], ephemeral: true });
	}
}