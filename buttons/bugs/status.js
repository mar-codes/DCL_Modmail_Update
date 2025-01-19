/*
musicmaker (556949122003894296) > [bug-status_resolved_556949122003894296]
musicmaker (556949122003894296) > [bug-status_progress_556949122003894296]
musicmaker (556949122003894296) > [bug-status_duplicate_556949122003894296]
musicmaker (556949122003894296) > [bug-status_invalid_556949122003894296]
*/

const MessageEnums = {
	'resolved': {
		message: 'This bug has been resolved - Thank you for your report!',
		color: 0x00ff00,
		emoji: '✅'
	},
	'progress': {
		message: 'This bug has been noted and a fix is now in progress.',
		color: 0xffff00,
		emoji: '⚠️'
	},
	'duplicate': {
		message: 'This bug has already been reported - Thank you for your report!',
		color: 0xff8800,
		emoji: '🚩'
	},
	'invalid': {
		message: 'This bug has been discarded - This usually means we cannot reproduce the issue.',
		color: 0xff0000,
		emoji: '🗑️'
	}
}

module.exports = {
	customID: 'bug-status',
	execute: async function(interaction, client, [ action, userID ] = []) {

		const user = client.users.cache.get(userID);

		const messageData = MessageEnums[action];
		if (!messageData) throw new Error('Invalid action provided.');

		await interaction.deferUpdate().catch(() => {});

		const embed = {
			title: 'Status Report',
			description: `${messageData.emoji} | ${messageData.message}`,
			color: messageData.color
		}

		const [ messageEmbed ] = interaction.message.embeds;
		messageEmbed.data.color = messageData.color;

		const buttons = interaction.message.components[0].components;

		if (action === 'resolved' || action === 'invalid') {
			for (let i = 0; i < buttons.length; i++) {
				buttons[i].data.disabled = true;
			}
		} else {
			for (let i = 0; i < buttons.length; i++) {
				if (!buttons[i].data.custom_id.includes(action)) continue;
				buttons[i].data.disabled = true;
				break;
			}
		}
		
		await interaction.editReply({
			embeds: [ messageEmbed ],
			components: interaction.message.components
		});

		await user?.send({
			embeds: [ embed ]
		}).catch(() => {});

	}
}