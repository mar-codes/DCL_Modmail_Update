const PriorityEmojis = ['💤','⚠️','🚨','🔥'];
const PriorityNames = ['Low','Medium','High','Critical'];

module.exports = {
	customID: 'bug-report',
	execute: async function(interaction, client, [ action = 'view' ] = []) {

		const bugData = client.cache.bugReport.get(interaction.user.id);
		if (!bugData) {
			await interaction.deferUpdate().catch(() => {});
			await interaction.editReply({
				embeds: [{
					color: 0x777777,
					description: 'You don\'t have any bug reports in progress...'
				}],
				components: []
			});
			await new Promise(resolve => setTimeout(resolve, 5000));
			await interaction.deleteReply();
			return;
		}

		if (action === 'cancel') {
			await interaction.deferUpdate().catch(() => {});

			const embed = {
				title: 'Bug Report',
				description: `
Are you sure you want to cancel your bug report?
This will delete all of your current progress.
`,
				color: 0xff0000
			}

			const confirmButtons = {
				type: 1,
				components: [
					{
						type: 2,
						label: 'Take me back!',
						style: 3,
						custom_id: 'bug-report_view',
						emoji: '✅'
					},
					{
						type: 2,
						label: 'Delete it!',
						style: 4,
						custom_id: 'bug-report_cancelConfirm',
						emoji: '🗑️'
					}
				]
			}

			return await interaction.editReply({
				embeds: [ embed ],
				components: [ confirmButtons ]
			})
		}

		if (action === 'cancelConfirm') {
			client.cache.bugReport.delete(interaction.user.id);
			await interaction.deferUpdate().catch(() => {});
			await interaction.deleteReply();
			return;
		}

		if (action === 'view') {

			await interaction.deferUpdate().catch(() => {});

			const embed = {
				title: 'Bug Report',
				description: `
**Title**: ${bugData.title ?? '`[ NONE SET ]`'}
**Priority**: ${PriorityNames[bugData.priority]} ${PriorityEmojis[bugData.priority]}
**Description**: ${bugData.bug ? `\`\`\`${bugData.bug}\`\`\`` : '`[ NONE SET ]`'}
`,
				color: 0x2196f3,
				footer: {
					text: 'Made by @musicmaker 💙'
				}
			}

			const editButtons = {
				type: 1,
				components: [
					{
						type: 2,
						label: 'Title',
						style: 2,
						custom_id: 'bug-report_title',
						emoji: '📝'
					},
					{
						type: 2,
						label: 'Priority',
						style: 2,
						custom_id: 'bug-report_priority',
						emoji: '🔥'
					},
					{
						type: 2,
						label: 'Description',
						style: 2,
						custom_id: 'bug-report_bug',
						emoji: '🐛'
					}
				]
			}

			const navButtons = {
				type: 1,
				components: [
					{
						type: 2,
						label: 'Cancel',
						style: 4,
						custom_id: 'bug-report_cancel',
						emoji: '🗑️'
					},
					{
						type: 2,
						label: 'Finish',
						style: 3,
						custom_id: 'bug-report_submit',
						emoji: '✅',
						disabled: Object.values(bugData).some(value => value === null)
					}
				]
			}

			return await interaction.editReply({
				embeds: [ embed ],
				components: [ editButtons, navButtons ]
			})
		}


		if (action === 'submit') {

			await interaction.deferUpdate().catch(() => {});

			const channel = client.channels.cache.get('1184232022458257509');

			const embed = {
				title: `${PriorityEmojis[bugData.priority] ?? '❓'} | ${bugData.title}`,
				description: `\`\`\`${bugData.bug}\`\`\``,
				timestamp: new Date(),
				color: 0x2196f3,
				author: {
					name: `${interaction.member.user.globalName} (${interaction.member.user.id})`,
					icon_url: interaction.user.displayAvatarURL({ dynamic: true })
				},
			}

			const actionButtons = {
				type: 1,
				components: [
					{
						type: 2,
						label: 'Resolved',
						style: 3,
						custom_id: `bug-status_resolved_${interaction.user.id}`,
						emoji: '✅'
					},
					{
						type: 2,
						label: 'In Progress',
						style: 2,
						custom_id: `bug-status_progress_${interaction.user.id}`,
						emoji: '⚠️'
					},
					{
						type: 2,
						label: 'Duplicate',
						style: 2,
						custom_id: `bug-status_duplicate_${interaction.user.id}`,
						emoji: '🚩'
					},
					{
						type: 2,
						label: 'Invalid',
						style: 4,
						custom_id: `bug-status_invalid_${interaction.user.id}`,
						emoji: '🗑️'
					}
				]
			}

			await channel.send({
				embeds: [ embed ],
				components: [ actionButtons ]
			});

			client.cache.bugReport.delete(interaction.user.id);

			return await interaction.editReply({
				embeds: [{
					color: 0x2196f3,
					description: 'Your bug report has been submitted!'
				}],
				components: []
			});
		}

		if (action === 'priority') {
			bugData.priority = (bugData.priority + 1) % 4;
			await interaction.deferUpdate().catch(() => {});
			return await this.execute(interaction, client, [ 'view' ]);
		}


		const questionbugData = questions[action];
		if (!questionbugData) throw new Error(`Invalid action: ${action}`);

		const modal = {
			title: 'Bug Report',
			custom_id: `bug-report_${action}`,
			components: [{
				type: 1,
				components: [{
					type: 4,
					style: questionbugData.style,
					label: questionbugData.question,
					max_length: questionbugData.length,
					custom_id: 'data',
					value: bugData[action] ?? ''
				}]
			}]
		}

		await interaction.showModal(modal);

	}
}


const questions = {
	title: {
		question: 'Write a brief description what broke.',
		length: 100,
		style: 1
	},
	bug: {
		question: 'Can you describe what happens? Be specific!',
		length: 1000,
		style: 2
	},
	priority: {
		question: 'How important is this bug?',
		length: 100,
		style: 1
	},
	when: {
		question: 'When did this happen?',
		length: 100,
		style: 1
	}
}