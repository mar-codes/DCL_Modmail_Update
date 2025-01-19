const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function convertTimestamp(timestamp) {
    if (typeof timestamp !== 'number') throw new TypeError(`Expected a number, got ${typeof number}`);
    
    // Date.now() -> 'in 5 mintues and 26 seconds'

    const time = Math.floor( (timestamp - Date.now()) / 1000 );
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    let remainingTimeString = '';
    if (minutes > 0) {
        remainingTimeString += `${minutes} minute${minutes > 1 ? 's' : ''} and `;
    }
    remainingTimeString += `${seconds} second${seconds > 1 ? 's' : ''}`;

    return remainingTimeString;
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName('get-help')
        .setDescription('Ping a Coding Helper.'),
    execute: async function(interaction, client) {

        await interaction.deferReply({ ephemeral: true }).catch( () => {} );

        if (interaction.channel.type !== 11) {
            return await interaction.editReply({
                content: '/get-help can only be used in a help channel - Create a post to get started!'
            });
        }

        if (interaction.channel.createdTimestamp + 1000 * 60 * 10 > Date.now()) {
            const time = convertTimestamp(interaction.channel.createdTimestamp + 1000 * 60 * 10);

            return await interaction.editReply({
                content: `You must wait ${time} before using this command - Hang tight while we get to you!`
            });
        }

        const timeoutData = client.cooldowns.get(`${interaction.user.id}-get-help`);
        if (timeoutData) {
            const time = convertTimestamp(timeoutData);

            return await interaction.editReply({
                content: `
⚠️ You are on cooldown for ${time}.
The coding helpers are doing their best to answer your request, so please be patient while they help you!`
            });
        }

        const button = client.buttons.get('get-help');

        // JS, PY, HTML
        const roleID = client.config.HELP_ROLES[interaction.channel.parentId] ?? null;
        if (roleID !== null) {
            return await button.execute(interaction, client, [ roleID ]);
        }

        if (interaction.channel.parentId === '1184616712142860339') {
            // Database Help (mongo + sql)
            const tags = {
                '1184616869961932891': '1187083774828216382', // Mongo
                '1184617008176832512': '1187083830474059866', // SQL
                // '1184626899713007767' // Other: Can be anything, no role ID
            }

            const channelTags = interaction.channel.appliedTags;

            for (const [ tagID, roleID ] of Object.entries(tags)) {
                if (channelTags.includes(tagID)) {
                    return await button.execute(interaction, client, [ roleID ]);
                }
            }

            // Ping both roles
            return await button.execute(interaction, client, Object.values(tags));
        }
                
        if (interaction.channel.parentId === '1090696098064113764') { // General questions, can be anything

            const tags = {
                // '1090696466625998948': [ '1069789755501445150' ], // Python
                // '1187088848438689832': // Other
                '1090696496074195084': [ '1108768042873278686' ], // HTML
                '1090696445109227633': [ '1082346384876900452' ], // Javascript
                '1187088784286814228': [ '1187083774828216382', '1187083830474059866' ] // Mongo + SQL
            }

            const channelTags = interaction.channel.appliedTags;

            for (const [ tagIDs, roleID ] of Object.entries(tags)) {
                if (channelTags.some(tag => tagIDs.includes(tag))) {
                    return await button.execute(interaction, client, roleID);
                }
            }

            return await interaction.editReply({
                content: 'It seems we don\'t have a team for your issue, we apologize for the inconvenience.',
            });

        }

    }
}
