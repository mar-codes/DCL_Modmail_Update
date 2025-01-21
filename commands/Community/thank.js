const { SlashCommandBuilder } = require('@discordjs/builders');
/*
let schema = new Schema({
    Guild: String,
    User: String,
    Rep: Number
});
*/

module.exports = {
    data: new SlashCommandBuilder()
        .setName('thank')
        .setDescription('Give some thanks to a helper!')
		.addSubcommand(subcommand => subcommand
			.setName('give')
			.setDescription('Give some thanks to someone!')
			.addUserOption( option => option
				.setName('user')
				.setDescription('The user')
				.setRequired(true)
			)
			.addStringOption(option => option
				.setName('message')
				.setDescription('Want to share your appreciation?')
				.setRequired(false)
			),
		)
		.addSubcommand(subcommand => subcommand
			.setName('leaderboard')
			.setDescription('See the top helpers!')
			.addStringOption(option => option
				.setName('month')
				.setDescription('The month')
				.addChoices(
					{ name: 'January', value: '0' },
					{ name: 'February', value: '1' },
					{ name: 'March', value: '2' },
					{ name: 'April', value: '3' },
					{ name: 'May', value: '4' },
					{ name: 'June', value: '5' },
					{ name: 'July', value: '6' },
					{ name: 'August', value: '7' },
					{ name: 'September', value: '8' },
					{ name: 'October', value: '9' },
					{ name: 'November', value: '10' },
					{ name: 'December', value: '11' }
				)
			)
		),
    execute: async function(interaction, client) {
        const member = interaction.options.getMember('user') ?? interaction.member;
		const { user } = member;

		const month = parseInt(interaction.options.getString('month') ?? new Date().getMonth());

		const subCommand = interaction.options.getSubcommand();

		if (subCommand === 'give') {

			if (user.id === "899385550585364481") return await interaction.reply({
				content: "This user has been blocked from receiving thanks.",
				ephemeral: true
			});

			if (user.bot) return await interaction.reply({
				content: 'How would that even work...?',
				ephemeral: true
			});

			const cooldown = client.cooldowns.get(`${interaction.user.id}-${user.id}-thank`) ?? 0;
			if (cooldown > Date.now()) return await interaction.reply({
				content: `You are on cooldown - Try again <t:${~~(cooldown / 1000)}:R>`,
				ephemeral: true
			});
			if (interaction.user.id === user.id) return await interaction.reply({
				content: `Nice try buddy!`,
			});

			await interaction.deferReply();

			const reason = interaction.options.getString('message') ?? 'No reason given.';

			await client.schemas.thanks.updateOne({
				guildID: interaction.guild.id,
				userID: user.id,
				month: new Date().getMonth()
			}, {
				$inc: { points: 1 }
			}, {
				upsert: true
			});

			await interaction.editReply({
				embeds: [{
					description: `Thank you for showing your appreciation!`,
					color: 0x4caf50
				}]
			});

			try {
				await user.send({
					embeds: [{
						title: `Thanks Given!`,
						description: `You have received a thank from ${interaction.user.username}!\n\n**Reason:** ${reason}`,
						color: 0x4caf50
					}]
				});
			} catch (error) {
				console.error(error);
				await interaction.followUp({
					content: `I couldn't send a DM to ${user.username} to notify them`,
					ephemeral: true
				});
			}

			client.cooldowns.set(`${interaction.user.id}-${user.id}-thank`, Date.now() + (1000 * 60 * 10));

			// clear next month
			await client.schemas.thanks.deleteMany({
				guildID: interaction.guild.id,
				month: new Date().getMonth() + 1
			});
		}

		if (subCommand === 'leaderboard') {

			await interaction.deferReply();

			const leaderboard = await client.schemas.thanks.find({
				guildID: interaction.guild.id,
				month	
			}).sort({ points: -1 }).limit(10);

			const placementEmojis = ['🥇', '🥈', '🥉'];

			const places = leaderboard.map((data, i) => `${placementEmojis[i] ?? '- '} ${data.points} points - <@${data.userID}>` ).join('\n');

			const currentDate = new Date();
			const currentMonth = currentDate.getMonth();
			const currentYear = currentDate.getFullYear();
			const daysLeft = new Date(currentYear, currentMonth + 1, 0).getDate() - currentDate.getDate();

			const monthName = new Date(currentYear, month, 1).toLocaleString('default', { month: 'long' });

			const embed = {
				title: `${monthName} Leaderboard`,
				description: places.length > 0 ? places : 'Hmm, it doesn\'t seem like anyone has any points yet...',
				footer: null,
				color: 0x4caf50
			};

			if (currentMonth === month) {
				embed.footer = {
					text: `Points reset in ${daysLeft} days`
				}
			}

			await interaction.editReply({
				embeds: [embed]
			});
		}

    }
};