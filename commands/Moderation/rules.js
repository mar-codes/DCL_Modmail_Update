const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Send the rules message'),
    execute: async function (interaction, client) {
        
        if (interaction.user.id !== '735141652506607716') return await interaction.reply({ content: `Only Jackson can use this!`, ephemeral: true });

        const imageEmbed = {
            color: 0x2196f3,
            image: {
                url: 'https://media.discordapp.net/attachments/1155291788370780171/1155292417885478932/New_Project_-_2023-09-23T195924.266.png?width=1440&height=583'
            }
        }

        const embed = {
            color: 0x2196f3,
            description: `
**YOUR PRESENCE IN THIS SERVER IMPLIES THAT YOU HAVE READ AND AGREE TO THE FOLLOWING RULES**

## General Rules :earth_africa:

:one: No disrespect of anyone
:two: No discrimination against anyone
:three: Political discussions are prohibited
:four: No use of inappropriate words or phrases
:five: Do not engage in, start, or continue arguments
:six: Do not send unsolicited DMs
:seven: Do not ask for coding help in non-help related chats
:eight: Do not advertise
:nine: Do not spam
:keycap_ten: Do not engage in moderative discussion in public channels (no mini mods)

## Community Member Rules :palm_tree:

:one: No NSFW usernames, nicknames, profile pictures, bios, pronouns, or banners
:two: All names and/or nicknames must be pingable
:three: Do not use the pronouns feature to diminish any protected communities
:four: No breaking [discord's terms of service](https://discord.com/terms) or [discord's community guidelines](https://discord.com/guidelines)
:five: Client modifications are allowed under the standard it is not used to cause harm to any entity
:six: Self botting is off the table, this should be a given
:seven: Advertising your bot, server, or any other service is unacceptable, for sponsorships please DM <@${client.user.id}>

## Specific Community Guidelines :scroll:

:one: Do not partake in any activity related to leaking paid codes
:two: Do not share malicious code
:three: Do not DM staff members for moderation ( use <@${client.user.id}> )
:four: Do not DM staff members for coding help
:five: Do not ping users in help channels without explicit consent
:six: Do not share code from a MrJAwesome video
:seven: Do not misuse help channels
:eight: Do not attempt to bypass an automod filter
:nine: Do not abuse bot commands
:keycap_ten: All bots must follow the [discord bot guidelines](https://discord.com/developers/docs/legal) as well as any TOS of the targetted service`,
            footer: {
                text: 'Last updated'
            },
            timestamp: '2024-04-21T22:54:00Z'
        }

        const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId('ruleskey')
            .setLabel('Understand the rules')
            .setEmoji('<:Rules:1109920922288267384>')
            .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setURL('https://discord.com/terms')
            .setLabel('Discord Terms of Service'),

            new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setURL('https://discord.com/guidelines')
            .setLabel('Discord Community Guidelines')
        )

        await interaction.channel.send({
            embeds: [ imageEmbed, embed ],
            components: [ buttons ]
        })
    }
}
