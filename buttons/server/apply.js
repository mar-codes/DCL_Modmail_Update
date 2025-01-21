const deniedAppSchema = require('../../Schemas.js/deniedApps');
const config = require('../../modmail-services/config')

module.exports = {
	customID: 'apply',
	execute: async function(interaction, client, [ action = 'view', question = 0 ] = []) {

		const applicationData = client.cache.applications.get(interaction.user.id);
		if (!applicationData) {
			await interaction.update({
				content: `⚠️ You have not started an application yet. Run \`/apply\` to start one.`,
				attachments: [],
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
			const { AttachmentBuilder } = require('discord.js');
			const path = require("node:path")
			const attachment = new AttachmentBuilder(
				path.join(__dirname, '../../assets/badapplication.png'),
				{ name: 'badapplication.png' }
			);

			const questionEmbed = {
				title: 'Helper Application',
				author: {
					name: interaction.user.username,
					icon_url: interaction.user.displayAvatarURL({ dynamic: true })
				},
				description: 'Please fill out each section carefully. Adding your GitHub profile will strengthen your application!\n\n**Bad Application Example →**\nSee the attachment for what NOT to do in your answers.',
				color: 0x2196f3,
				fields: [],
				footer: {
					text: '💡 Pro tip: Link your GitHub to show off your projects!'
				}
			}

			for (const question of applicationData.questions) {
				let answerText;
				if (question.choices) {
					answerText = question.choices.map(choice => 
						choice === question.answer ? `**${choice}**` : choice
					).join(' | ');
				} else if (question.shortText === 'GitHub') {
					answerText = question.answer || '*Optional - Add your GitHub profile URL to showcase your work*';
				} else {
					answerText = question.answer || `*${question.optional ? 'Optional - Not answered' : 'Required - Not answered yet'}*`;
				}

				questionEmbed.fields.push({
					name: `${question.emoji} ${question.question}${question.optional ? ' (Optional)' : ''}`,
					value: answerText,
					inline: ['Age', 'GitHub'].includes(question.shortText)
				});
			}

			questionEmbed.fields.push({
				name: '📝 Application Tips',
				value: '• Be detailed in your answers\n• Share your coding experience\n• Link your GitHub if you have projects\n• Look at the example (attachment above) of what not to do',
				inline: false
			});

			const editButtons = {
				type: 1,
				components: []
			}

			for (const question of applicationData.questions) {
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
						disabled: applicationData.questions.some(question => 
							!question.optional && question.answer.length === 0
						)
					}
				]
			}

			return await interaction.editReply({
				files: [attachment],
				embeds: [questionEmbed],
				components: [editButtons, finishButtons],
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
			const applicationID = generateID(8);

			const languageQuestion = applicationData.questions.find(q => 
				q.question.toLowerCase().includes('what language do you specialize in')
			);
			const selectedLanguage = languageQuestion?.answer || 'Not specified';

			const missingAnswers = applicationData.questions.filter(q => 
				!q.optional && (!q.answer || q.answer.trim().length === 0)
			);

			if (missingAnswers.length > 0) {
				return await interaction.editReply({
					content: `⚠️ Please answer all required questions before submitting!\nMissing: ${missingAnswers.map(q => q.shortText).join(', ')}`,
					ephemeral: true
				});
			}

			const embed = {
				title: 'Staff Application Review',
				author: {
					name: `${interaction.user.username} • ${interaction.user.id}`,
					icon_url: interaction.user.displayAvatarURL({ dynamic: true })
				},
				description: [
					'**New Staff Application Submitted**',
					'Please review the following application and cast your vote.',
					'The voting period will end in 24 hours.',
					'\n**Applicant Information:**'
				].join('\n'),
				fields: [],
				color: 0x2B5EA7,
				thumbnail: {
					url: interaction.user.displayAvatarURL({ dynamic: true })
				},
				footer: {
					text: `Application ID: ${applicationID} • Voting Period: 24 hours`
				},
				timestamp: new Date()
			};
			
			for (const question of applicationData.questions) {
				const answer = question.answer.trim();
				embed.fields.push({
					name: `${question.emoji} ${question.question}`,
					value: answer.length > 0 
						? `\`\`\`yaml\n${answer.replace(/`/g, "'")}\`\`\``
						: "```diff\n- No response provided```",
					inline: ['Age', 'GitHub', 'Language'].includes(question.shortText)
				});
			}
			
			const voteButtons = {
				type: 1,
				components: [
					{
						type: 2,
						label: 'Approve Application (0)',
						style: 3,
						custom_id: `vote_yes_${interaction.user.id}`,
						emoji: '✅'
					},
					{
						type: 2,
						label: 'Decline Application (0)',
						style: 4,
						custom_id: `vote_no_${interaction.user.id}`,
						emoji: '❌'
					}
				]
			};

			try {
				const formattedQuestions = applicationData.questions.map(question => ({
					question: question.question,
					answer: question.answer?.trim() || null,
					optional: Boolean(question.optional)
				}));

				const channel = await client.channels.cache.get(config.channels.applicationchannel);
				const appMessage = await channel.send({
					embeds: [embed],
					components: [voteButtons]
				});

				const application = new client.schemas.applications({
					id: applicationID,
					guildID: applicationData.guildID,
					userID: applicationData.userID,
					submittedAt: Date.now(),
					questions: formattedQuestions,
					accepted: false,
					language: selectedLanguage
				});

				await application.save();

				client.cache.votes = client.cache.votes || new Map();
				client.cache.votes.set(interaction.user.id, {
					yes: 0,
					no: 0,
					voters: new Set(),
					messageId: appMessage.id,
					timer: setTimeout(async () => {
						const votes = client.cache.votes.get(interaction.user.id);
						if (!votes) return;

						const finalEmbed = { ...embed };
						if (votes.yes > votes.no) {
							finalEmbed.color = 0x00ff00;
							finalEmbed.fields.push({
								name: 'Vote Results:',
								value: `✅ Accepted (${votes.yes} vs ${votes.no})\nRole automatically assigned.`
							});

							const user = await client.users.fetch(interaction.user.id);
							const member = await channel.guild.members.fetch(user);
							await member.roles.add('1329227895608185026');
							
							await client.schemas.applications.findOneAndUpdate(
								{ id: applicationID },
								{ accepted: true }
							);
						} else {
							finalEmbed.color = 0xff0000;
							finalEmbed.fields.push({
								name: 'Vote Results',
								value: `❌ Denied (${votes.yes} vs ${votes.no})`
							});

							const COOLDOWN_DAYS = 14;
							const futureDate = new Date();
							futureDate.setDate(futureDate.getDate() + COOLDOWN_DAYS);
							
							await deniedAppSchema.create({
								id: generateID(),
								guildID: interaction.guild.id,
								userID: interaction.user.id,
								submittedAt: new Date(),
								deniedTimestamp: futureDate,
								questions: applicationData.questions
							});

							await client.schemas.applications.findOneAndDelete({ id: applicationID });
						}

						await appMessage.edit({
							embeds: [finalEmbed],
							components: []
						});

						client.cache.votes.delete(interaction.user.id);
					}, 24 * 60 * 60 * 1000)
				});

				client.cache.applications.delete(interaction.user.id);

				return await interaction.editReply({
					content: `✅ Your application has been submitted! Staff will review it within 24 hours.`,
					attachments: [],
					embeds: [],
					components: []
				});

			} catch (error) {
				console.error('Application submission error:', error);
				if (error.name === 'ValidationError') {
					console.log('Validation Error Details:', JSON.stringify(error.errors, null, 2));
					return await interaction.editReply({
						content: `❌ There was a validation error with your application. Please try again or contact an administrator.`,
						ephemeral: true
					});
				}
				return await interaction.editReply({
					content: `❌ There was an error submitting your application. Please try again or contact an administrator.\nError: ${error.message}`,
					ephemeral: true
				});
			}
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