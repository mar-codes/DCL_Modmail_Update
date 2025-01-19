module.exports = {
	customID: 'apply',
	execute: async function(interaction, client, [ action = 'view', question = 0 ] = []) {

		const applicationData = client.cache.applications.get(interaction.user.id);
		if (!applicationData) {
			await interaction.update({
				content: `⚠️ You have not started an application yet. Run \`/apply\` to start one.`,
				embeds: [],
				components: [],
				ephemeral: true
			});
			await new Promise(resolve => setTimeout(resolve, 5000));
			await interaction.deleteReply();
			return;
		}

		if (action === 'edit') {
			const questionData = applicationData.questions[question];
			const modal = {
				title: 'Application',
				custom_id: `apply_${question}`,
				components: [{
					type: 1,
					components: [{
						type: 4,
						custom_id: 'data',
						label: questionData.question,
						value: questionData.answer,
						style: 2,
						required: true,
						max_length: questionData.maxLength ?? 256
					}]
				}]
			};
			return await interaction.showModal(modal);
		}

		await interaction.deferUpdate().catch(() => {});

		if (action === 'view') {

			const questionEmbed = {
				title: 'Helper Application',
				description: '',
				color: 0x2196f3,
				footer: {
					text: 'Made by @musicmaker 💙'
				}
			}

			const editButtons = {
				type: 1,
				components: []
			}

			for (const question of applicationData.questions) {
				questionEmbed.description += `${question.emoji} ${question.question}\n`;
				if (question.choices) {
					questionEmbed.description += '\\> ' + question.choices.map(choice => choice === question.answer ? `**${choice}**` : choice).join(' | ');
				} else {
					questionEmbed.description += '\\> ' + question.answer.replace(/\n/g, '\n\\> ').replace(/`/g, '');
				}

				questionEmbed.description += '\n\n';

				editButtons.components.push({
					type: 2,
					label: question.shortText,
					style: 2,
					custom_id: `apply_edit_${applicationData.questions.indexOf(question)}`,
					emoji: question.emoji
				});
			}

			const finishButtons = {
				type: 1,
				components: [
					{
						type: 2,
						label: 'Cancel',
						style: 4,
						custom_id: 'apply_cancel'
					},
					{
						type: 2,
						label: 'Submit',
						style: 3,
						custom_id: 'apply_send',
						disabled: applicationData.questions.some(question => question.answer.length === 0)
					}
				]
			}

			return await interaction.editReply({
				embeds: [questionEmbed],
				components: [editButtons, finishButtons]
			});
		}

		if (action === 'cancel') {
			const embed = {
				description: `Are you sure you want to cancel your application?\nThis cannot be undone.`,
				color: 0xff0000
			}

			const confirmationButtons = {
				type: 1,
				components: [
					{
						type: 2,
						label: 'Take me back!',
						style: 3,
						custom_id: 'apply_view'
					},
					{
						type: 2,
						label: 'Delete',
						style: 4,
						custom_id: 'apply_delete'
					}
				]
			}

			return await interaction.editReply({
				embeds: [embed],
				components: [confirmationButtons]
			});
		}

		if (action === 'delete') {
			client.cache.applications.delete(interaction.user.id);
			return await interaction.deleteReply();
		}

		if (action === 'submit') {
			const embed = {
				description: `Are you sure you want to submit your application?`,
				color: 0x00ff00
			}

			const confirmationButtons = {
				type: 1,
				components: [
					{
						type: 2,
						label: 'Take me back!',
						style: 3,
						custom_id: 'apply_view'
					},
					{
						type: 2,
						label: 'Submit',
						style: 4,
						custom_id: 'apply_send'
					}
				]
			}

			return await interaction.editReply({
				embeds: [embed],
				components: [confirmationButtons]
			});
		}

		if (action === 'send') {

			const applicationData = client.cache.applications.get(interaction.user.id);

			const embed = {
				title: 'Helper Application',
				author: {
					name: `${interaction.user.username} (${interaction.user.id})`,
					icon_url: interaction.user.displayAvatarURL({ dynamic: true })
				},
				description: '',
				color: 0x2196f3,
				footer: {
					text: 'Made by @musicmaker 💙'
				},
				timestamp: new Date()
			}

			for (const question of applicationData.questions) {
				embed.description += `${question.emoji} ${question.question}\n`;
				embed.description += `\`\`\`${question.answer.replace(/`/g, '\\`')}\`\`\`\n\n`;
			}

			const channel = await client.channels.cache.get('1187661431525605466');
			await channel.send({
				embeds: [embed]
			});

			new client.schemas.applications({
				id: generateID(8),
				guildID: applicationData.guildID,
				userID: applicationData.userID,
				submittedAt: Date.now(),
				questions: applicationData.questions.map(question => ({
						question: `${question.emoji} ${question.question}`,
						answer: question.answer
					})
				),
				accepted: false,
				language: applicationData.questions[0].answer
			});

			client.cache.applications.delete(interaction.user.id);

			return await interaction.editReply({
				content: `✅ Your application has been submitted!`,
				embeds: [],
				components: []
			});
		}

	}
}


function generateID(length = 6, options = { numbers: true, letters: true, symbols: false }) {

    if (typeof length === 'object') {
        options = length;
        length = 10;
    }

    const {
        numbers = false,
        letters = false,
        symbols = false
    } = options;

    const chars = [
        ...(numbers ? '0123456789' : ''),
        ...(letters ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : ''),
        ...(symbols ? '!@#$%^&*()_+-=[]{};:,./<>?' : ''),
    ].join('');
    
    if (chars.length === 0) throw new Error('Invalid options provided for generateID - Must have numbers, letters, or symbols');

    return new Array(length)
        .fill('0')
        .map(() => chars[Math.floor(Math.random() * chars.length)])
        .join('');
}