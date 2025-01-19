module.exports = {
	customID: 'faq-main',
	execute: async function (interaction, client, [ public ] = [ '' ]) {
		public = Boolean(public);

		const embed = {
			title: 'FAQ',
			description: `
We've compiled a large list of topics about the server and coding in general for your convenience, we have dozens of topics to choose from general questions, to errors, to full on tutorials! Feel free to take a look or ask if you have any questions!`,
			color: 0x2196f3
		}

		const FAQButtons = {
			type: 1,
			components: [
				{
					type: 2,
					style: 2,
					label: 'Server',
					custom_id: 'faq-lookup_server',
					emoji: '🛠️'
				},
				{
					type: 2,
					style: 2,
					label: 'Coding',
					custom_id: 'faq-lookup_code',
					emoji: '💻'
				}
			]
		}

		const payload = {
			files: [],
			embeds: [embed],
			components: [FAQButtons],
			ephemeral: true
		}

		await interaction[public ? 'reply' : 'update'](payload);
	}
}