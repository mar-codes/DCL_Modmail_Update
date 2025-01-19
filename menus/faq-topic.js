const path = require('node:path');
const fs = require('node:fs');

const db = require('../utils/CacheDB.js');

const FindTopicByID = db.prepare(`
	SELECT *
	FROM topics
	WHERE topicID = ?
`);

const IMAGE_CACHE = new Map();

module.exports = {
	customID: 'faq-topic',
	execute: async function (interaction, client, [ type ] = [ 'server' ]) {
		const topicID = Number(interaction.values[0]);

		const topic = FindTopicByID.get(topicID);
		if (!topic) throw new Error(`Topic not found: ${topicID}`);

		const fullPath = path.resolve(`${__dirname}/../assets/${topic.media}`);
		if (topic.media) {
			if (!IMAGE_CACHE.has(fullPath)) {
				const fileData = fs.readFileSync(fullPath);
				IMAGE_CACHE.set(fullPath, fileData);
			}
		}

		const embed = {
			description: `**${topic.name}**\n-# ${topic.description}\n\n${topic.content}`,
			color: 0x2196f3,
			image: {
				url: topic.media ? `attachment://${fullPath.split('/').pop()}` : null
			},
			footer: {
				text: 'Made by @musicmaker 💙'
			}
		}

		const backButton = {
			type: 1,
			components: [{
				type: 2,
				style: 2,
				label: 'Back',
				custom_id: `faq-lookup_${type}`
			}]
		}

		await interaction.update({
			embeds: [embed],
			components: [backButton],
			files: topic.media
				? [{ attachment: IMAGE_CACHE.get(fullPath), name: fullPath.split('/').pop() }]
				: []
		});
		

	}
}