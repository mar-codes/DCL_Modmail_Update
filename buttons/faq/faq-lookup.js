const db = require('../../utils/CacheDB.js');

const PAGE_SIZE = 10;

const pageLookup = db.prepare(`
	SELECT *
	FROM topics
	WHERE type = ?
	ORDER BY topicID ASC
	LIMIT ${PAGE_SIZE}
	OFFSET ?
`); // Array<{ name: string, description: string, content: string, media: string, type: string, category: string }>

const topicCount = db.prepare(`
	SELECT COUNT(*)
	FROM topics
	WHERE type = ?
`).pluck(); // number

function ResolveEmoji (category = '') {
	switch (category.toUpperCase()) {
		case 'MONGO':
			return '🍃';
		case 'SQL':
			return '🐬';
		case 'JS':
			return '<:node:1286507408293757002>';
		case 'STAFF':
			return '🛠️';
		case 'MASTERCLASS':
			return '🎓';
		case 'SERVER':
			return '💡';
		case 'CODE':
			return '💻';
		default:
			console.error(`Invalid category found - Expected string, got ${typeof category} : ${category}`);
			return '❓';
	}
}

module.exports = {
	ResolveEmoji: ResolveEmoji,
	customID: 'faq-lookup',
	execute: async function (interaction, client, [ type, page ] = [ 'server', 0 ]) {
		type = String(type) === 'server' ? 'server' : 'code';
		page = Number(page ?? 0);

		const FAQTopics = pageLookup.all(type, page * PAGE_SIZE);
		const totalTopics = topicCount.get(type);

		const embed = {
			title: type === 'server' ? 'Server FAQ' : 'Coding FAQ',
			description: `Showing page ${page + 1} of ${Math.ceil(totalTopics / PAGE_SIZE)} - ${totalTopics} topics total\n\n` +
FAQTopics.map( topic => `${ResolveEmoji(topic.category)} **${topic.name}**\n\u200b\t\\- ${topic.description}` ).join('\n\n'),
			color: 0x2196f3
		}

		// next, previous, and search buttons
		const navButtons = {
			type: 1,
			components: [
				{
					type: 2,
					style: 2,
					custom_id: `faq-lookup_${type}_${page - 1}`,
					emoji: '⬅️',
					disabled: page === 0
				},
				{
					type: 2,
					style: 2,
					label: 'Search',
					custom_id: `faq-search_${type}`,
					emoji: '🔍'
				},
				{
					type: 2,
					style: 2,
					custom_id: `faq-lookup_${type}_${page + 1}`,
					emoji: '➡️',
					disabled: FAQTopics.length < PAGE_SIZE
				}
			]
		}

		const backButton = {
			type: 1,
			components: [{
				type: 2,
				style: 2,
				custom_id: `faq-main`,
				label: 'Back'
			}]
		}

		const selectMenu = {
			type: 1,
			components: [{
				type: 3,
				custom_id: `faq-topic_${type}`,
				options: FAQTopics.map( topic => ({
					label: topic.name,
					value: topic.topicID.toString(),
					description: topic.description
				}))
			}]
		}

		await interaction.update({
			files: [],
			embeds: [embed],
			components: [navButtons, selectMenu, backButton],
			ephemeral: true
		});
	}
}