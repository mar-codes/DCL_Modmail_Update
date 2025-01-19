module.exports = {
	customID: 'rules',
	execute: async function(interaction, client, args) {
		// const tos = new ActionRowBuilder()
        //     .addComponents(
        //         new ButtonBuilder()
        //             .setLabel('Discord Terms of Service')
        //             .setURL('https://discord.com/terms')
        //             .setStyle(ButtonStyle.Link),

        //         new ButtonBuilder()
        //             .setLabel('Discord Community Guidelines')
        //             .setURL('https://discord.com/guidelines')
        //             .setStyle(ButtonStyle.Link),
        //     )

        // const embed = new EmbedBuilder()
        //     .setTitle(`<:Rules:1109920922288267384> Server Rules`)
        //     .setDescription('We expect that everyone in this server follows these rules to keep our community running, and make sure everyone feels safe here.')
        //     .addFields({ name: 'Content & Material', value: 'The content of your messages matters.  This includes no conversation of sensitive topics, no advertisement, no trolling, and treating others with respect. Be sure the messages you are sending are quality, and not meant to harm anyone including the server.' })
        //     .addFields({ name: 'Punishment Evasion', value: 'Evading punishment is not allowed. This means that if you have been given any sort of punishment by a Moderator, you cannot try to get rid of it.  This includes bypassing bans on an alt account, or leaving and rejoining to remove a timeout.' })
        //     .addFields({ name: 'Remaining Topical', value: 'Remaining on-topic is important within this server.  We have many designated channels for specific topics, so please use them as they are intended.' })
        //     .addFields({ name: 'Language Barriers', value: 'The primary language of this server is English. You must speak English everywhere in this server to avoid confusion.  The only exception to this is in private coding help forum posts when both people agree to speak a different language'})
        //     .addFields({ name: 'Common Sense', value: 'Common sense is crutial in any community.  As a member, you should enter every channel and chat with common sense in mind.  If everyone thinks before they speak, a lot of problems can be avoided.' })

		const buttons = {
			type: 1,
			components: [
				{
					type: 2,
					label: 'Discord Terms of Service',
					style: 5,
					url: 'https://discord.com/terms',
					emoji: {
						id: '1155663469555757067',
						name: 'Rules'
					}
				},
				{
					type: 2,
					label: 'Discord Community Guidelines',
					style: 5,
					url: 'https://discord.com/guidelines',
					emoji: {
						id: '1155663469555757067',
						name: 'Rules'
					} 
				},
				{
					type: 2,
					label: 'Discord Developer TOS',
					style: 5,
					url: 'https://discord.com/developers/docs/policies-and-agreements/developer-terms-of-service',
					emoji: {
						id: '1155663469555757067',
						name: 'Rules'
					}
				},
				{
					type: 2,
					label: 'Discord Developer Policy',
					style: 5,
					url: 'https://discord.com/developers/docs/policies-and-agreements/developer-policy',
					emoji: {
						id: '1155663469555757067',
						name: 'Rules'
					}
				}
			]
		};

		const embed = {
			title: 'Server Rules <:Rules:1109920922288267384>',
			description: 'We expect that everyone in this server follows these rules to keep our community running, and make sure everyone feels safe here.',
			color: 0x4caf50,
			fields: [
				{
					name: 'Content & Material',
					value: 'The content of your messages matters.  This includes no conversation of sensitive topics, no advertisement, no trolling, and treating others with respect. Be sure the messages you are sending are quality, and not meant to harm anyone including the server.'
				},
				{
					name: 'Punishment Evasion',
					value: 'Evading punishment is not allowed. This means that if you have been given any sort of punishment by a Moderator, you cannot try to get rid of it.  This includes bypassing bans on an alt account, or leaving and rejoining to remove a timeout.'
				},
				{
					name: 'Remaining Topical',
					value: 'Remaining on-topic is important within this server.  We have many designated channels for specific topics, so please use them as they are intended.'
				},
				{
					name: 'Language Barriers',
					value: 'The primary language of this server is English. You must speak English everywhere in this server to avoid confusion.  The only exception to this is in private coding help forum posts when both people agree to speak a different language'
				},
				{
					name: 'Common Sense',
					value: 'Common sense is crutial in any community.  As a member, you should enter every channel and chat with common sense in mind.  If everyone thinks before they speak, a lot of problems can be avoided.'
				}
			]
		};

        return await interaction.reply({ embeds: [embed], components: [buttons], ephemeral: true })
	}
}