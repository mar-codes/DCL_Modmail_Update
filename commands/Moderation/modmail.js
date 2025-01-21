const {
	SlashCommandBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	PermissionsBitField
} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('modmail')
		.setDescription('Open a modmail thread')
		.addSubcommand(subcommand => subcommand
			.setName('open')
			.setDescription('Open a modmail thread')
			.addUserOption(option => option
				.setName('user')
				.setDescription('The user to open a thread with')
				.setRequired(true)
			)
		)
		.addSubcommand(subcommand => subcommand
			.setName('close')
			.setDescription('Close a modmail thread')
			.addUserOption(option => option
				.setName('user')
				.setDescription('The user to close a thread with')
				.setRequired(true)
			)
			.addStringOption(option => option
				.setName('reason')
				.setDescription('The reason for closing the thread')
				.setRequired(false)
			)
		)
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers),
	execute: async function(interaction, client) {

		const user = interaction.options.getUser('user');
		const subcommand = interaction.options.getSubcommand();

		const modmailData = await client.schemas.modmail.findOne({
			guildID: interaction.guild.id,
			userID: user.id
		});

		if (subcommand === 'open') {
			if (modmailData) return await interaction.reply({
				content: `This user already has a modmail thread open!`
			});

			const category = await interaction.guild.channels.fetch('1025792195564945418').catch( () => {} );
            if (!category) throw new Error('Category data not found, aborting...');

			const channel = await interaction.guild.channels.create({
                name: user.username,
                parent: category.id,
                type: ChannelType.GuildText
            });
            
            await client.schemas.modmail.create({
                guildID: interaction.guild.id,
                userID: user.id,
                channelID: channel.id,
                createdTimestamp: Date.now(),
				staff: true
            });

            const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId(`modmail_close_${interaction.guild.id}_${user.id}`)
                .setLabel('Close Modmail')
                .setEmoji('🔒')
                .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                .setCustomId(`modmail_transcript_${interaction.guild.id}_${user.id}`)
                .setEmoji('📜')
                .setLabel('Export Transcript')
                .setStyle(ButtonStyle.Secondary)
            );

			const embed = {
				title: `Modmail Opened`,
				description: `
This modmail has been opened by a staff member (\`${interaction.user.globalName ?? interaction.user.username}\`)
Please be patient and respectful while we help you`,
				color: 0x2196f3,
				timestamp: new Date()
			}

			await channel.send({
				embeds: [embed],
				components: [buttons]
			});

			await user.send({
				embeds: [embed]
			});

			await interaction.reply({
				content: `Modmail thread opened!`,
				ephemeral: true
			});
		} else if (subcommand === 'close') {

			if (!modmailData) return await interaction.reply({
				content: `This user does not have a modmail thread open!`
			});

			const modal = client.modals.get('modmailClose');
			await modal.execute(
				Object.assign(interaction, {
					fields: {
						getTextInputValue: () => interaction.options.getString('reason')
					}
				}),
				client,
				[interaction.guild.id, user.id]
			);
		}
	}
};