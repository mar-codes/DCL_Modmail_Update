const FindTopics = require('../utils/FindTopics.js');
const { ResolveEmoji } = require('../buttons/faq/faq-lookup.js');

module.exports = {
	customID: 'faq-search',
	execute: async function(interaction, client, [ type ] = ['']) {
		const input = interaction.fields.getTextInputValue('data');

		const topics = FindTopics(input, type);

		const embed = {
			description: `Search results for : "${input}"\n\n`,
			color: 0x2196f3
		}

		const SelectMenu = {
			type: 1,
			components: [{
				type: 3,
				custom_id: `faq-topic_${type}`,
				options: []
			}]
		}

		const backButton = {
			type: 1,
			components: [{
				type: 2,
				style: 2,
				custom_id: `faq-lookup_${type}_0`,
				label: 'Back'
			}]
		}

		if (topics.length === 0) {
			embed.description += 'No results found.';
			interaction.update({ embeds: [embed], components: [backButton] });
		}

		const bestMatch = topics.shift();
		embed.description += `__Best Match__\n${ResolveEmoji(bestMatch.category)} **${bestMatch.name}**\n\u200b\t\\- ${bestMatch.description}`;
		SelectMenu.components[0].options.push({
			label: bestMatch.name,
			value: bestMatch.topicID.toString(),
			description: bestMatch.description
		});

		embed.description += '\n\n__Related Topics__';

		for (const topic of topics) {
			embed.description += `\n${ResolveEmoji(topic.category)} **${topic.name}**\n\u200b\t\\- ${topic.description}`;
			SelectMenu.components[0].options.push({
				label: topic.name,
				value: topic.topicID.toString(),
				description: topic.description
			});
		}

		interaction.update({
			embeds: [embed],
			components: [SelectMenu, backButton],
			files: []
		});

	}
}