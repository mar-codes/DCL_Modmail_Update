const { createTranscript } = require('discord-html-transcripts');
const CreateTranscript = require('../utils/CreateTranscript');

module.exports = {
	customID: 'modmailClose',
	execute: async function(interaction, client, args) {

		await interaction.deferReply({ ephemeral: true });

		const reason = interaction.fields.getTextInputValue('data') || 'No reason provided';

		const guildID = args[0];
		const userID = args[1];

		const modmailData = await client.schemas.modmail.findOne({
			guildID,
			userID
		});

		if (!modmailData) return await interaction.editReply({
			content: `I could not find a modmail entry for this user!`
		});

		const guild = client.guilds.cache.get(guildID);
		if (!guild) return await interaction.editReply({
			content: `I could not find a guild for this user!`
		});

		const channel = guild.channels.cache.get(modmailData.channelID);
		if (!channel) return await interaction.editReply({
			content: `I could not find a channel for this user!`
		});

		const user = await client.users.fetch(userID);

		let timeSpent = Math.floor( (Date.now() - modmailData.createdTimestamp) / 1000 );
		const days = Math.floor(timeSpent / 60 / 60 / 24);
		timeSpent %= 60 * 60 * 24;
		const hours = Math.floor(timeSpent / 60 / 60);
		timeSpent %= 60 * 60;
		const minutes = Math.floor(timeSpent / 60);
		const seconds = timeSpent % 60;

		let timeString = '';
		if (days > 0) timeString += `${days} days, `;
		if (hours > 0) timeString += `${hours} hours, `;
		if (minutes > 0) timeString += `${minutes} minutes, `;
		if (seconds > 0) timeString += `${seconds} seconds`;

		const embed = {
			title: `Modmail Closed`,
			description: `
This modmail thread has been closed by ${interaction.user.globalName || interaction.user.username} (${interaction.user.id}).
Time: \`${timeString}\`
Reason: \`\`\`${reason}\`\`\``,
			color: 0x2196f3,
			timestamp: new Date()
		};

		await channel.send({
			embeds: [embed]
		});

		await user?.send({
			embeds: [embed]
		}).catch( () => {} );

		await client.schemas.modmail.deleteOne({
			guildID,
			userID
		});

		await interaction.deleteReply();

		setTimeout( async() => {
			await channel.delete().catch( () => {} );
		}, 1000 * 15);

		const userTranscript = await CreateTranscript(channel);
		const staffTranscript = await createTranscript(channel, true);

		await user?.send({
			files: [userTranscript]
		}).catch( () => {} );

		const transcriptChannel = guild.channels.cache.get('1108819757160996966');
		transcriptChannel?.send({
			embeds: [embed],
			files: [staffTranscript]
		});

	}
}