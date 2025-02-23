const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    PermissionFlagsBits,
} = require('discord.js');
const sticky = require('../../Schemas.js/stickMessageSystem');

function generateUniqueId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sticky-message')
        .setDescription('stick message system')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(command => command
            .setName('setup')
            .setDescription('Set a sticky message')
            .addStringOption(option => option
                .setName('message')
                .setDescription('The Message you want to be stickified')
                .setRequired(true)
            )
                .addChannelOption(option => option
                    .setName('channel')
                    .setDescription('The channel to send the sticky in')
                    .setRequired(true)
                )
                    .addNumberOption(option => option
                        .setName('cap')
                        .setDescription('The amount of messages it needs for the sticky message to resend')
                        .setRequired(true)
                    )
                )
        .addSubcommand(command => command
            .setName('disable')
            .setDescription('Remove a sticky message')
            .addStringOption(option => option
                .setName('id')
                .setDescription('The ID of the sticky message to remove')
                .setRequired(true)
            )
        )
        .addSubcommand(command => command
            .setName('check')
            .setDescription('Check your active sticky messages')
        ),
    async execute(interaction, client) {
        const { options } = interaction;
        const sub = options.getSubcommand();

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) 
            return await interaction.reply({ content: `${client.config.noPerms}`, ephemeral: true});

        var data;
        const embed = new EmbedBuilder()
            .setColor(0x2196f3)
            .setTitle('Sticky Message Tool')
            .setTimestamp();

        async function sendResponse(message) {
            embed.setDescription(message);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        try {
            switch (sub) {
                case 'setup':
                    const channel = options.getChannel('channel');
                    const message = options.getString('message');
                    const cap = options.getNumber('cap');
                    const uniqueId = generateUniqueId();
                    
                    data = await sticky.findOne({ Guild: interaction.guild.id, Channel: channel.id, Message: message });

                    if (data) {
                        await sendResponse(`You already have this **word** as a sticky message in <#${channel.id}>!`);
                    } else {
                        const initialSticky = await channel.send({
                            embeds: [{
                                color: 0x2196f3,
                                description: message,
                                footer: { text: `Sticky Message • ID: ${uniqueId}` },
                                timestamp: new Date()
                            }]
                        });

                        await sticky.create({
                            Guild: interaction.guild.id,
                            Message: message,
                            Channel: channel.id,
                            Count: 0,
                            Cap: cap,
                            LastMessageId: initialSticky.id,
                            uniqueId: uniqueId
                        });

                        await sendResponse(`I have added the sticky message "\`${message}\`" to <#${channel.id}>\nID: \`${uniqueId}\``);
                    }
                    break;

                case 'disable':
                    const messageId = options.getString('id');
                    data = await sticky.findOne({ Guild: interaction.guild.id, uniqueId: messageId });

                    if (!data) {
                        await sendResponse(`I **cannot** find a sticky message with ID \`${messageId}\` in this server!`);
                    } else {
                        await sticky.deleteOne({ Guild: interaction.guild.id, uniqueId: messageId });
                        await sendResponse(`I have deleted the sticky message with ID \`${messageId}\` from this server!`);
                    }
                    break;

                case 'check':
                    data = await sticky.find({ Guild: interaction.guild.id });
                    let string = '';

                    data.forEach(value => {
                        string += `\n\n> ID: \`${value.uniqueId}\`\n> Message: \`${value.Message}\`\n> Channel: <#${value.Channel}>\n> Cap Messages: \`${value.Cap}\``;
                    });

                    if (string.length === 0) {
                        await sendResponse(`You do not have any sticky messages in this server! Please use \`/sticky-message setup\` to add one!`);
                    } else {
                        await sendResponse(`Here are your *active* sticky messages${string}`);
                    }
                    break;
            }
        } catch (error) {
            console.error('Sticky Message Error:', error);
            await interaction.reply({ 
                content: 'There was an error while executing this command!', 
                ephemeral: true 
            }).catch(() => {});
        }
    }
};