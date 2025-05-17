const { generateFromMessages, createTranscript } = require("discord-html-transcripts");
const config = require("../modmail-services/config");

module.exports = async function (channel, allMessages = false) {

	if (allMessages) {
		const transcript = await createTranscript(channel, {
			limit: -1,
			returnType: 'attachment',
			filename: 'transcript.html',
			saveImages: true,
			poweredBy: false
		});

		return transcript;
	}

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
		filename: 'transcript.html',
		saveImages: true,
		poweredBy: false
	});

	return transcript;
}

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