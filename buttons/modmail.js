const  {
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder
} = require('discord.js');

const { generateFromMessages } = require('discord-html-transcripts');
const config = require('../modmail-services/config');

const staffRoles = [
	'970775928701603841', // Moderator
	'1080152193082073160', // Head Mod
	'970775928701603846', // Admin
	'970775928722567171' // Owner
];


module.exports = {
	customID: 'modmail',
	execute: async function(interaction, client, args) {

		const action = args[0];

		const guildID = args[1];
		const userID = args[2];

		const modmail = await client.schemas.modmail.findOne({
			guildID,
			userID
		});

		if (!modmail) return await interaction.reply({
			content: `I could not find a modmail entry for this user!`
		});

		const guild = client.guilds.cache.get(guildID);
		if (!guild) return await interaction.reply({
			content: `I could not find a guild for this user!`
		});

		const channel = guild.channels.cache.get(modmail.channelID);
		if (!channel) return await interaction.reply({
			content: `I could not find a channel for this user!`
		});

		const user = await client.users.fetch(userID);

		interaction.member ??= await guild.members.fetch(interaction.user.id).catch( () => null );

		if (action === 'close') {

			const isStaff = interaction.member && staffRoles.some(role => interaction.member._roles.includes(role));

			if (modmail.staff && !isStaff) return await interaction.reply({
				content: `This modmail is owned by staff - You cannot close this!`
			});

			const modal = new ModalBuilder()
			.setTitle('Close Modmail')
			.setCustomId(`modmailClose_${guildID}_${userID}`)

			const reason = new TextInputBuilder()
			.setCustomId('data')
			.setLabel('Reason for closing (optional)')
			.setStyle(TextInputStyle.Paragraph)
			.setRequired(false);

			modal.addComponents(
				new ActionRowBuilder().addComponents(reason)
			);

			return await interaction.showModal(modal);

		} else if (action === 'transcript') {

			const channel = guild.channels.cache.get(modmail.channelID);
			if (!channel) return await interaction.reply({
				content: `I could not find a channel for this user!`
			});

			await interaction.deferReply();

			const embed = {
				description: 'Generating transcript - Please wait...',
				color: 0x2196f3,
				timestamp: new Date()
			}

			await interaction.editReply({
				embeds: [embed]
			});

			const channelMessages = await FetchBulkMessages(channel, 1000);

			let cleanMessages = [];
			for (let i = 0; i < channelMessages.length; i++) {
				const message = channelMessages[i];

				if (message.content && message.content[0] !== config.guild.sendPrefix) {
					continue;
				}

				if (message.content) message.content = message.content.replace(new RegExp(`^\\${config.guild.sendPrefix}\s*`), '');

				message.createdAt = new Date(message.createdTimestamp);

				cleanMessages[i] = message;
			}

			cleanMessages = cleanMessages.filter(Boolean).sort((a, b) => a.createdTimestamp - b.createdTimestamp);

			const transcript = await generateFromMessages(cleanMessages, channel, {
				limit: -1,
				returnType: 'attachment',
				filename: `transcript-${user.globalName || user.username}.html`,
				saveImages: true,
				poweredBy: false
			});

			await new Promise(resolve => setTimeout(resolve, 1000));

			await interaction.editReply({
				embeds: [],
				files: [transcript]
			});
		} else if (action === "blacklist") {
			const blacklistSchema = require('../Schemas.js/blacklist');
			blacklistSchema.create({
				guildID: guild.id,
				userID: user.id,
				reason: 'Blacklisted from modmail',
				blacklistedBy: interaction.user.id
			})

			await interaction.reply({
				content: `User has been blacklisted from modmail!`
			});
		}
	}
};


async function FetchBulkMessages(channel, messageCount) {
	const messages = [];

	let lastMessageID = null;

	while (messages.length < messageCount) {
		const options = {
			limit: Math.min(messageCount - messages.length, 100)
		};

		if (lastMessageID) {
			options.before = lastMessageID;
		}

		const fetchedMessages = await channel.messages.fetch(options);
		if (fetchedMessages.size === 0) break;

		messages.push(...fetchedMessages.values());
		lastMessageID = fetchedMessages.last().id;
	}

	return messages;

}