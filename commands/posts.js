const { SlashCommandBuilder } = require('@discordjs/builders');
const { execute } = require('../buttons/get-help');

const PAGE_SIZE = 10;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('posts')
		.setDescription('List posts by a user')
		.addUserOption(x => x
			.setName('user')
			.setDescription('The user')
			.setRequired(true)
		),
	execute: async function(interaction, client, page = 0) {
		const user = interaction.options.getUser('user');

		const offset = page * PAGE_SIZE;

		await interaction.deferReply({ ephemeral: true }).catch(() => {});

		const loadingEmbed = {
			title: 'Loading...',
			color: 0x2196f3
		}

		await interaction.editReply({ embeds: [loadingEmbed] });

		const posts = await client.schemas.posts.find({ userID: user.id }, {}, { sort: { datePosted: -1 }, limit: PAGE_SIZE, skip: offset });
		
		if (!posts.length) {
			const noPostsEmbed = {
				description: `No posts were found for @${user.username}`,
				color: 0xff0000
			}
			await interaction.editReply({ embeds: [noPostsEmbed] });
			return;
		}
		
		const totalPosts = await client.schemas.posts.countDocuments({ userID: user.id });
		
		const embed = {
			title: `Posts by ${user.username} : ${totalPosts} posts`,
			description: posts.map(p => `<t:${Math.floor(p.datePosted / 1000)}:D> - ${p.deleted ? `~~${p.postName}~~` : `[${p.postName}](${GenerateLink(p)})`}`).join('\n'),
			color: 0x2196f3
		}

		const buttons = {
			// first, prev, search, next, last
			type: 1,
			components: [
				{
					type: 2,
					style: 2,
					custom_id: `posts_a_${user.id}_0`,
					disabled: page === 0,
					emoji: '⏮️'
				},
				{
					type: 2,
					style: 2,
					custom_id: `posts_prev_${user.id}_${page}`,
					disabled: page === 0,
					emoji: '⏪'
				},
				{
					type: 2,
					style: 1,
					custom_id: 'null',
					disabled: true,
					label: `${page + 1} / ${Math.ceil(totalPosts / PAGE_SIZE)}`
				},
				{
					type: 2,
					style: 2,
					custom_id: `posts_next_${user.id}_${page}`,
					disabled: posts.length < PAGE_SIZE,
					emoji: '⏩'
				},
				{
					type: 2,
					style: 2,
					custom_id: `posts_b_${user.id}_${Math.floor(totalPosts / PAGE_SIZE)}`,
					disabled: posts.length < PAGE_SIZE,
					emoji: '⏭️'
				}
			]
		}

		await interaction.editReply({ embeds: [embed], components: [buttons] });
	}
}

function GenerateLink(thread) {
	return `https://discord.com/channels/970775928596746290/${thread.channelID}/${thread.datePosted}`;
}