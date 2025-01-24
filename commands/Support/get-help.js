const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const CONFIG = {
    MAX_HELPERS: 3,
    COOLDOWN_MINUTES: 0,

    ROLES: {
        '1184616712142860339': '1187083774828216382', // MongoDB Helper
        '1184616712142860339': '1187083830474059866', // SQL Helper
        '1330744479757369364': '1330743018688483409', // HTML Helper
        '1168247660944302090': '1082346384876900452'  // JS Helper
    },

    DEFAULT_ROLE: '1198108710912917565',

    COLORS: {
        PRIMARY: 0x5865F2,    // Discord blue
        SUCCESS: 0x57F287,    // Green
        ERROR: 0xED4245,      // Red
        WARNING: 0xFEE75C     // Yellow
    },

    PING_MESSAGES: [
        "**Support Request** • {user} would appreciate assistance with their problem.",
        "**Help Needed** • {user} is seeking technical guidance from our support team.",
        "**New Request** • {user} would value your expertise on this matter.",
        "**Assistance Needed** • {user} has an problem for our technical team.",
        "**Support Alert** • {user} is looking for technical assistance."
    ],

    MESSAGES: {
        ERROR_NO_HELPERS: '```❌ Currently, no helpers are available to assist. Please try again shortly, or consider posting in our general help channels.```',
        ERROR_COOLDOWN: '```⏳ A cooldown is active. You can request help again in {TIME}.```',
        SUCCESS: '```✅ Your help request has been sent successfully. Our helpers have been notified.```',
        ERROR_WRONG_CHANNEL: '```❌ This command is designed for help threads only. Please use this command within an appropriate help thread.```',
        ERROR_GENERIC: '```❌ An error occurred while processing your request. Please try again.```',
        FOOTER: 'Technical Support Team • Empowering Through Knowledge'
    }
};

function getRandomHelpers(members, max) {
    return members
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(max, members.length));
}

function formatTimeRemaining(timestamp) {
    const seconds = Math.floor((timestamp - Date.now()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
}

function getRandomPingMessage(username) {
    const randomMessage = CONFIG.PING_MESSAGES[Math.floor(Math.random() * CONFIG.PING_MESSAGES.length)];
    return randomMessage.replace('{user}', username);
}

function formatHelperPings(helpers) {
    return [
        "**Available Helpers:**",
        ...helpers.map(h => `• <@${h.id}>`)
    ].join('\n');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get-help')
        .setDescription('Request technical assistance from our helper team.'),

   async execute(interaction, client) {
        try {
            await interaction.deferReply({ ephemeral: true });

            if (interaction.channel.type !== 11) {
                return await interaction.editReply({ 
                    content: CONFIG.MESSAGES.ERROR_WRONG_CHANNEL 
                });
            }

            const creationCooldown = interaction.channel.createdTimestamp + (1000 * 60 * CONFIG.COOLDOWN_MINUTES);
            if (creationCooldown > Date.now()) {
                const timeLeft = formatTimeRemaining(creationCooldown);
                return await interaction.editReply({
                    content: `Please wait ${timeLeft} before pinging helpers.`
                });
            }

            const cooldownKey = `${interaction.user.id}-get-help`;
            const cooldownTime = client.cooldowns.get(cooldownKey);
            
            if (cooldownTime && cooldownTime > Date.now()) {
                return await interaction.editReply({
                    content: CONFIG.MESSAGES.ERROR_COOLDOWN.replace('{TIME}', formatTimeRemaining(cooldownTime))
                });
            }

            const roleIDs = interaction.channel.appliedTags
                .map(tag => CONFIG.ROLES[tag])
                .filter(id => id);

            if (roleIDs.length === 0) {
                roleIDs.push(CONFIG.DEFAULT_ROLE);
            }

            const onlineHelpers = new Set();
            for (const roleID of roleIDs) {
                const role = await interaction.guild.roles.fetch(roleID);
                if (!role) continue;

                role.members
                    .filter(m => m.presence?.status === 'online' || m.presence?.status === 'idle' || m.presence?.status === 'dnd')
                    .forEach(m => onlineHelpers.add(m));
            }

            if (onlineHelpers.size === 0) {
                return await interaction.editReply({
                    content: CONFIG.MESSAGES.ERROR_NO_HELPERS
                });
            }

            const selectedHelpers = getRandomHelpers([...onlineHelpers], CONFIG.MAX_HELPERS);
            
            const mainMessage = [
                getRandomPingMessage(interaction.member.displayName),
                '',
                formatHelperPings(selectedHelpers),
                '',
            ].join('\n');

            const helpMessage = await interaction.channel.send({
                content: mainMessage,
                allowedMentions: { 
                    users: selectedHelpers.map(h => h.id),
                }
            });


            client.cooldowns.set(cooldownKey, Date.now() + (1000 * 60 * CONFIG.COOLDOWN_MINUTES));

            await interaction.editReply({
                content: CONFIG.MESSAGES.SUCCESS
            });

        } catch (error) {
            console.error('Error in get-help command:', error);
            await interaction.editReply({
                content: CONFIG.MESSAGES.ERROR_GENERIC
            });
        }
    }
};
