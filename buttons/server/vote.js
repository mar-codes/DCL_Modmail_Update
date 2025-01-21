const { ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
    customID: 'vote',
    execute: async function(interaction, client, [action, userId]) {
        if (!client.cache.votes) client.cache.votes = new Map();

        const voteData = client.cache.votes.get(userId);
        if (!voteData) {
            return await interaction.reply({
                content: '❌ This vote has expired or is invalid.',
                ephemeral: true
            });
        }

        if (voteData.voters.has(interaction.user.id)) {
            return await interaction.reply({
                content: '❌ You have already voted on this application.',
                ephemeral: true
            });
        }

        if (action === 'yes') voteData.yes++;
        if (action === 'no') voteData.no++;
        voteData.voters.add(interaction.user.id);

        const message = await interaction.channel.messages.fetch(voteData.messageId);
        
        const newButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`vote_yes_${userId}`)
                    .setLabel(`Accept (${voteData.yes})`)
                    .setStyle(3)
                    .setEmoji('✅'),
                new ButtonBuilder()
                    .setCustomId(`vote_no_${userId}`)
                    .setLabel(`Deny (${voteData.no})`)
                    .setStyle(4)
                    .setEmoji('❌')
            );

        try {
            await message.edit({ components: [newButtons] });
            await interaction.reply({
                content: `Vote recorded! Current votes: ✅ ${voteData.yes} vs ❌ ${voteData.no}`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Vote update error:', error);
            await interaction.reply({
                content: '❌ Error updating vote count. Please try again.',
                ephemeral: true
            });
        }
    }
};
