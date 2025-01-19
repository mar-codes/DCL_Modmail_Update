const ClosestMatch = require('../utils/ClosestMatch.js');

module.exports = {
	customID: 'apply',
	execute: async function(interaction, client, [ question = 0 ] ) {
		
		const applicationData = client.cache.applications.get(interaction.user.id);
		if (!applicationData) {
			await interaction.update({
				content: `⚠️ You have not started an application yet. Run \`/apply\` to start one.`,
				embeds: [],
				components: [],
				ephemeral: true
			});
			await new Promise(resolve => setTimeout(resolve, 5000));
			return await interaction.deleteReply();
		}

		const input = interaction.fields.getTextInputValue('data');

		const questionData = applicationData.questions[question];

		if (questionData.choices) {
			const choice = ClosestMatch(input, questionData.choices);
			questionData.answer = choice;
		} else {
			questionData.answer = input;
		}

		const button = client.buttons.get('apply');
		return await button.execute(interaction, client);
	}
}