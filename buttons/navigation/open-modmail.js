module.exports = {
	customID: 'open-modmail',
	execute: async function(interaction, client, [ confirm ] = []) {
		
		if (!confirm) {
			await interaction.deferReply({ ephemeral: true });

			const embed = {
				description: '**You are about to open a modmail with staff!**\nOpening false reports may result in punishments.\nAre you sure you want to proceed?',
				color: 0x2196f3
			}

			const buttons = {
				type: 1,
				components: [
					{
						type: 2,
						custom_id: 'open-modmail_1',
						emoji: '🚀',
						label: 'Please help me',
						style: 3
					},
					{
						type: 2,
						custom_id: 'close',
						emoji: '🕳️',
						label: 'Staff are scary!',
						style: 4
					}
				]
			}

			await interaction.editReply({
				embeds: [embed],
				components: [buttons]
			});
			return;
		}

		await interaction.deferUpdate();
		const embed = {
			description: '',
			color: 0x2196f3,
		};

		const modamailData = await client.schemas.modmail.findOne({
			guildID: interaction.guild.id,
			userID: interaction.user.id,
			closed: false
		});
		if (modamailData) {
			embed.description = `You already have an open modmail with staff!`;
			embed.color = 0xff0000;
			return await interaction.editReply({ embeds: [embed], components: [] });
		}

		const DMEmbed = {
			title: 'Modmail Opened',
			description: `
A new modmail has been opened, please be patient while we get to you!
While you wait, please detail your problem, screenshots are always appreciated.

**Note** : We *do not* provide help with code within modmail, please refer to the forums`,
			color: 0x2196f3,
			timestamp: new Date()
		}

		const buttons = {
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Close Modmail',
                    style: 4,
                    custom_id: `modmail_close_${interaction.guild.id}_${interaction.user.id}`,
                    emoji: '🔒'
                },
                {
                    type: 2,
                    label: 'Export Transcript',
                    style: 2,
                    custom_id: `modmail_transcript_${interaction.guild.id}_${interaction.user.id}`,
                    emoji: '📜'
                }
            ]
        }

		try {
			var dmMsg = await interaction.user.send({ embeds: [DMEmbed], components: [buttons] });
		} catch (error) {
			console.log(error);
			embed.description = `I could not send you a DM, please check your privacy settings!`;
			embed.color = 0xff0000;
			return await interaction.editReply({ embeds: [embed], components: [] });
		}

		try {
			const category = await interaction.guild.channels.fetch('1025792195564945418').catch( () => {} );
			if (!category) throw new Error('Category data not found, aborting...');

			const channel = await interaction.guild.channels.create({
				name: interaction.user.username,
				parent: category.id,
				type: 0
			});
			if (!channel) throw new Error('Channel could not be created, aborting...');

			await client.schemas.modmail.create({
				guildID: interaction.guild.id,
				userID: interaction.user.id,
				channelID: channel.id,
				createdTimestamp: Date.now()
			});

			
			const staffEmbed = {
				description: `
				This modmail has been opened by \`${interaction.member.globalName ?? interaction.user.username}\`
				Please allow a moment for them to explain the issue`,
				color: 0x2196f3,
				timestamp: new Date()
			}
			
			await channel.send({ embeds: [staffEmbed], components: [buttons] });

			embed.description = `Your modmail has been opened, please check your DMs!`;
			await interaction.editReply({ embeds: [embed], components: [] });
		} catch (error) {
			console.log(error);
			await dmMsg.delete();
			embed.description = `Something went wrong while opening your modmail, please contact a staff member directly!`;
			embed.color = 0xff0000;
			await interaction.editReply({ embeds: [embed], components: [] });
		}
	}
}