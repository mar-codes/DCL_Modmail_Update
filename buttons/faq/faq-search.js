module.exports = {
	customID: 'faq-search',
	execute: async function(interaction, client, [ type ] = ['']) {
		const modal = {
			title: 'Search FAQ',
			custom_id: `faq-search_${type}`,
			components: [{
				type: 1,
				components: [{
					type: 4,
					label: 'What are you looking for?',
					placeholder: 'Search for a topic...',
					custom_id: 'data',
					required: true,
					max_length: 100,
					style: 1
				}]
			}]
		}

		await interaction.showModal(modal);
	}
}