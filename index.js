const https = require('node:https');
const crypto = require('node:crypto');
require('./utils/ProcessHandlers.js')();

const {
    Client,
    Partials,
    ChannelType
} = require(`discord.js`);
const mongoose = require('mongoose');

const client = new Client({
    intents: [
        'Guilds',
        'GuildMembers',
        'GuildMessages',
        'DirectMessages',
        'MessageContent',
        'GuildPresences'
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
    ]
});

client.cache = {
    lastMessage: new Map(),
    purgeChannels: new Map(),
    threadClose: new Map(),
    bugReport: new Map(),
    applications: new Map()
}
client.cooldowns = new Map(); // string: number
client.config = require('./config.json');
client.logs = require('./utils/Logs.js');
client.schemas = require('./utils/SchemasLoader.js');

client.topics = require('./utils/LoadTopics.js')();

require('./utils/ComponentLoader.js')(client);
require('./utils/RegisterCommands.js')(client);

if (!client.config.MONGODBURL) {
    client.logs.warn('No MongoDB URL provided, skipping database connection...');
} else {
    ( async () => {
        try {
            await mongoose.connect(client.config.MONGODBURL)
            client.logs.success('Connected to database!');
        } catch (error) {
            client.logs.error(`Failed to connect to database: ${error}`);
        }
    })();
}

client.login(client.config.TOKEN);
client.on('ready', async () => {

    client.user.setPresence({
        status: 'online',
        activities: [{
            type: 4, // custom
            name: 'status',
            state: '📬 DM to contact us!'
        }],
    });

    client.logs.success(`Logged in as ${client.user.tag}!`);
})

async function InteractionHandler(interaction, type) {

	interaction.deferUpdate ??= interaction.deferReply;

    const args = interaction.customId?.split("_") ?? [];
    const name = args.shift();

    const command = client[type].get( name ?? interaction.commandName );
    if (!command) {
        await interaction.reply({
            content: `There was an error while executing this command!\n\`\`\`Command not found\`\`\``,
            ephemeral: true
        }).catch( () => {} );
        client.logs.error(`${type} not found: ${interaction.customId}`);
        return;
    }

    if ('roles' in command && Array.isArray(command.roles)) {
        const hasRole = command.roles.some(roleID => interaction.member._roles.includes(roleID));
        if (!hasRole && !interaction.member.permissions.has('Administrator')) {
            await interaction.reply({
                content: `There was an error while executing this command!\n\`\`\`You do not have permission to use this command\`\`\``,
                ephemeral: true
            }).catch( () => {} );
            client.logs.error(`Blocked user from ${type} : Missing roles`);
            return;
        }
    }

    try {
        if (interaction.isAutocomplete()) {
            await command.autocomplete(interaction, client, args);
        } else {
            await command.execute(interaction, client, interaction.customId ? args : undefined );
        }
    } catch (error) {
        client.logs.error(error.stack);
        await interaction.deferReply({ ephemeral: true }).catch( () => {} );
        await interaction.editReply({
            content: `There was an error while executing this command!\n\`\`\`${error}\`\`\``,
            embeds: [],
            components: [],
            files: [],
            ephemeral: true
        }).catch( () => {} );
    }

}

client.on('interactionCreate', async function(interaction) {
    if (!interaction.isCommand() && !interaction.isAutocomplete()) return;
    
    const subcommand = interaction.options._subcommand ?? "";
    const subcommandGroup = interaction.options._subcommandGroup ?? "";
    const commandArgs = interaction.options._hoistedOptions ?? [];
    const args = `${subcommandGroup} ${subcommand} ${commandArgs.map(arg => arg.value).join(" ")}`.trim();
    client.logs.info(`${interaction.user.tag} (${interaction.user.id}) > /${interaction.commandName} ${args}`);

    await InteractionHandler(interaction, 'commands');
});


client.on('interactionCreate', async function(interaction) {
    if (!interaction.isButton()) return;
    client.logs.info(`${interaction.user.tag} (${interaction.user.id}) > [${interaction.customId}]`);
    await InteractionHandler(interaction, 'buttons');
});


client.on('interactionCreate', async function(interaction) {
    if (!interaction.isStringSelectMenu()) return;
    client.logs.info(`${interaction.user.tag} (${interaction.user.id}) > <${interaction.customId}>`);
    await InteractionHandler(interaction, 'menus');
});


client.on('interactionCreate', async function(interaction) {
    if (!interaction.isModalSubmit()) return;
    client.logs.info(`${interaction.user.tag} (${interaction.user.id}) > {${interaction.customId}}`);
    await InteractionHandler(interaction, 'modals');
});

const JOIN_COOLDOWN = 1000 * 60 * 10;
client.on('guildMemberAdd', async member => {

    const cooldown = client.cooldowns.get(`${member.user.id}-join`);
    client.cooldowns.set(`${member.user.id}-join`, Date.now() + JOIN_COOLDOWN);
    if (cooldown > Date.now()) return;

    const channel = client.channels.cache.get('1001168453002068000');
    if (!channel) return;
    
    const content = [
        `Welcome to the server, ${member}!`,
        `Welcome ${member}, what projects are you working on?`,
        `Hello ${member}, welcome to the server! What do you like to code?`,
        `Hello & Welcome ${member}! Let us know if you need any help!`,
        `Heya ${member}, bring any pizza?`,
        `Welcome ${member}, we hope you enjoy your stay!`,
        `Bring any coffee ${member}?`,
        `Behold! ${member} has arrived!`,
        `Got any cookies ${member}?`,
        `Greetings and Salutations ${member}!`
    ];
    
    const random = Math.floor(Math.random() * content.length);

    try {
        const message = await channel.send(content[random]);
        await message.react(`<:WumpusWave1:1104508378941763624>`);
    } catch (error) {
        console.log(error.stack)
    }
});


client.on('messageCreate', async function (message) {
    if (message.author.bot) return;
    if (message.channel.type !== ChannelType.DM) return;
    if (message.author.id === client.user.id) return;

    /*
    let modSchema = new Schema({
        guildID: String,
        userID: String,
        channelID: String,
        createdTimestamp: Number,
        lastMessageTimestamp: Number,
        closed: Boolean
    })
    */

    const modmailData = await client.schemas.modmail.findOne({
        guildID: '970775928596746290',
        userID: message.author.id,
        closed: false
    });

    const embed = {
        author: {
            name: `${message.author.globalName || message.author.username} (${message.author.id})`,
            iconURL: message.author.displayAvatarURL({ dynamic: true })
        },
        description: `
${message.content ?? ''}
${message.attachments.map(attachment => attachment.url).join('\n') ?? ''}`.trim(),
        color: 0x2196f3,
        timestamp: new Date()
    }

    const sticker = message.stickers.first();
    if (sticker) {
        embed.image = { url: sticker.url }
    }

    const messageData = {
        embeds: [embed]
    }

    if (modmailData) {
        const channel = await client.channels.fetch(modmailData.channelID).catch( () => {} );
        if (!channel) {
            return message.reply({ content: `Something went wrong - Please notify @musicmaker if you see this!` });
        }

        try {
            await channel.send(messageData);
            await message.react('🗳️');
        } catch (error) {
            console.log(error.stack);
            await message.react('❌').catch( () => {} );
        }
        return;
    }
    try {
        const guild = await client.guilds.fetch('970775928596746290').catch( () => {} );
        if (!guild) throw new Error('Guild data not found, aborting...');

        const category = await guild.channels.fetch('1025792195564945418').catch( () => {} );
        if (!category) throw new Error('Category data not found, aborting...');

        const channel = await guild.channels.create({
            name: message.author.username,
            parent: category.id,
            type: 0
        });
        if (!channel) throw new Error('Channel could not be created, aborting...');
        
        await client.schemas.modmail.create({
            guildID: guild.id,
            userID: message.author.id,
            channelID: channel.id,
            createdTimestamp: Date.now(),
        });

        const buttons = {
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Close Modmail',
                    style: 4,
                    custom_id: `modmail_close_${guild.id}_${message.author.id}`,
                    emoji: '🔒'
                },
                {
                    type: 2,
                    label: 'Export Transcript',
                    style: 2,
                    custom_id: `modmail_transcript_${guild.id}_${message.author.id}`,
                    emoji: '📜'
                }
            ]
        }

        await channel.send( Object.assign(messageData, { components: [buttons] }) );

        const replyEmbed = {
            title: 'Modmail Created',
            description: `
A new modmail has been opened, please be patient while we get to you!
While you wait, please detail your problem, screenshots are always appreciated.

**Note** : We *do not* provide help with code within modmail, please refer to the forums`,
            color: 0x2196f3,
            timestamp: new Date()
        }

        await message.author.send({
            embeds: [replyEmbed],
            components: [buttons]
        });

        await message.react('🗳️');
    } catch (error) {
        console.log(error.stack);
        await message.react('❌').catch( () => {} );
        return message.author.send({ content: `Something went wrong - Please notify @musicmaker if you see this!` }).catch( () => {} );
    }

    await client.schemas.modmail.updateOne({
        guildID: '970775928596746290',
        userID: message.author.id,
        closed: false
    }, {
        lastMessageTimestamp: Date.now()
    });

});


client.on('messageCreate', async function(message) {
    if (message.author.bot) return;
    if (message.channel.type !== ChannelType.GuildText) return;
    if (message.channel.parentId !== '1025792195564945418') return;

    const embed = {
        author: {
            name: `${message.author.globalName || message.author.username} (${message.author.id})`,
            iconURL: message.author.displayAvatarURL({ dynamic: true })
        },
        description: message.content || '',
        image: null,
        color: 0x2196f3,
        timestamp: new Date()
    }

    const sticker = message.stickers.first();
    if (sticker) {
        embed.image = { url: sticker.url }
    }

    const messageData = {
        embeds: [embed],
        content: message.attachments.map(attachment => attachment.url).join('\n') || '',
    }

    const modmailData = await client.schemas.modmail.findOne({
        guildID: message.guild.id,
        channelID: message.channel.id,
        closed: false
    });

    if (modmailData) {
        const user = client.users.cache.get(modmailData.userID);
        if (!user) return;

        try {
            await user.send(messageData);
            await message.react('🗳️');
        } catch (error) {
            await message.react('❌').catch( () => {} );
        }
    }

    await client.schemas.modmail.updateOne({
        guildID: message.guild.id,
        userID: message.author.id,
        closed: false
    }, {
        lastMessageTimestamp: Date.now()
    });

});



// Detect when a thread is created
client.on('threadCreate', async thread => {
    if (!Object.keys(client.config.HELP_ROLES).includes(thread.parentId) && thread.parentId !== '1090696098064113764') return;

    const embed = {
        title: 'Welcome to the help channels!',
        description: `
Please make sure you describe your issue **thoroughly** and **clearly**. This will help us help you faster!

Got code? Great!
Help us out and drop it at https://sourceb.in/

No one here to help?
Use /get-help to notify our helpers!`,
        color: 0x2196f3,
        timestamp: new Date()
    }

    await new Promise( resolve => setTimeout(resolve, 1000));

    const messages = await thread.messages.fetch();
    const firstMessage = messages.first();

    await thread.send({ embeds: [embed] });

    await firstMessage.pin();
});



client.on('messageCreate', async (message) => {
    if (!message.guild) return;
    if (message.author.bot) return;
    if (!Object.keys(client.config.HELP_ROLES).includes(message.channel.parentId)) return;

    client.cache.lastMessage.set(message.channel.id, Date.now());
});


 
// If a thread goes 12 hours without any messages, ask if they still need help
setInterval(async () => {
    for (const [channelId, lastMessage] of client.cache.lastMessage) {
        if (Date.now() - lastMessage < 1000 * 60 * 60 * 12) continue;

        const channel = client.channels.cache.get(channelId);
        if (!channel) continue;

        client.cache.lastMessage.delete(channel.id);

        const embed = {
            title: 'Need more help?',
            description: `
This thread has been inactive for 12 hours.
Still need help? Use /get-help to notify our helpers!`,
            color: 0xff9800,
            timestamp: new Date()
        }

        const postButtons = {
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'I need help!',
                    style: 2,
                    custom_id: 'goto-get-help',
                    emoji: '⚠️'
                },
                {
                    type: 2,
                    label: 'Solved',
                    style: 3,
                    custom_id: 'solve',
                    emoji: '✔️'
                }
            ]
        }

        await channel.send({
            content: `<@${channel.ownerId}>`,
            embeds: [embed],
            components: [postButtons]
        });
    }

    // for (const [channelId, markTimestamp] of client.cache.purgeChannels) {
    //     if (Date.now() - markTimestamp < 1000 * 60 * 60 * 48) continue;
    //      
    //     const channel = await client.channels.fetch(channelId).catch( () => {} );
    //     if (!channel) continue;
    //      
    //     try {
    //         await channel.delete();
    //         client.cache.purgeChannels.delete(channel.id);
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }

}, 1000 * 60);


client.on('guildCreate', async guild => {
    await guild.leave();
});


/*
Threat levels for users
Safe, account age > 6 months
Susceptible, account age > 3 months
Suspicious, account age > 1 month
Dangerous, account age > 1 week
Extreme, account age < 1 week
WTF, account age < 1 day
*/

function getThreatColor(timestamp) {
    if (typeof timestamp !== 'number') throw new TypeError('Timestamp must be a number');
    
    const now = Date.now();
    const diff = now - timestamp;

    const oneDay = 1000 * 60 * 60 * 24;
    const oneWeek = oneDay * 7;
    const oneMonth = oneDay * 30;

    // wtf
    if (diff < oneDay) return 0x000000;

    // extreme
    if (diff < oneWeek) return 0xff0000;

    // dangerous
    if (diff < oneMonth) return 0xff6600;

    // suspicious
    if (diff < oneMonth * 3) return 0xffff00;

    // susceptible
    if (diff < oneMonth * 6) return 0x00ff00;

    // safe
    return 0x00ffff;
}

client.on('guildMemberAdd', async member => {
    if (member.guild.id !== '970775928596746290') return;

    const channel = await client.channels.fetch('1053759729526112306').catch( () => {} );
    if (!channel) return console.log('No channel found');

    // member logs
    const embed = {
        author: {
            name: `${member.user.tag} (${member.user.id})`,
            iconURL: member.user.displayAvatarURL({ dynamic: true })
        },
        description: `
- Mention: <@${member.user.id}> \`(${member.user.id})\`
- Bot: ${member.user.bot ? '✅' : '❌'}

- Created: <t:${~~(member.user.createdTimestamp / 1000)}:f> (<t:${~~(member.user.createdTimestamp / 1000)}:R>)
- Joined: <t:${~~(member.joinedTimestamp / 1000)}:f> (<t:${~~(member.joinedTimestamp / 1000)}:R>)
`,
        color: getThreatColor(member.user.createdTimestamp),
        timestamp: new Date(),
        thumbnail: {
            url: member.user.displayAvatarURL({ dynamic: true })
        }
    }

    await channel.send({ embeds: [embed] });

});

let pingRegex = new RegExp();
client.on('ready', () => pingRegex = new RegExp(`^<@!?${client.user.id}>`) );
client.on('messageCreate', async function(message) {
    if (message.author.bot) return;
    if (!pingRegex.test(message.content)) return;

    const cooldown = client.cooldowns.get(`${message.author.id}-ping`);
    if (cooldown > Date.now()) return;
    client.cooldowns.set(`${message.author.id}-ping`, Date.now() + (1000 * 60 * 10));

    const embed = {
        title: 'Need help?',
        description: `
If you're looking for coding help please use /get-help in your post
Otherwise, DM me to get in contact with staff directly!

**Note:** We do not provide help with code within modmail`,
        color: 0x2196f3,
        timestamp: new Date()
    }

    const navButtons = {
        type: 1,
        components: [
            {
                type: 2,
                label: 'Get-Help',
                style: 2,
                custom_id: 'goto-get-help',
                // warn emoji: '⚠️'
                // police siren: '🚨'
                // red flag: '🚩'
                emoji: '🚩'
            },
            {
                type: 2,
                label: 'Contact Staff',
                style: 2,
                custom_id: 'open-modmail',
                emoji: '📬'
            }
        ]
    }

    await message.reply({
        embeds: [embed],
        components: [navButtons],
        allowedMentions: { repliedUser: false }
    });
});

setInterval(() => {
    for (const [key, cooldown] of client.cooldowns) {
        if (Date.now() > cooldown) client.cooldowns.delete(key);
    }
}, 1000 * 5);


client.on('messageCreate', async function({ content, author, channel }) {

    const args = content.split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === '?bon') {
        const userInput = args.shift();
        if (!userInput) return await channel.send(`Please provide a user to bon`);

        const user = client.users.cache.find(user => user.id === userInput.replace(/[<@!>]/g, '') || user.username.toLowerCase() === userInput.toLowerCase());
        if (!user) return await channel.send(`User not found :(`);

        const reason = args.join(' ') || 'No reason provided';

        const embed = {
            title: 'Member bonned!',
            description: `<@${author.id}> bonned <@${user.id}>\nSomeone been a bad boi...\n\n**Reason:** \`\`\`${reason}\`\`\``,
            color: 0x2196f3,
            timestamp: new Date()
        }

        return await channel.send({ embeds: [embed] });
    }
});

client.on('threadCreate', async thread => {
    if (thread.parentId !== '1067887324723171368') return;

    await new Promise( resolve => setTimeout(resolve, 1000));

    const messages = await thread.messages.fetch().catch( () => ({ first: () => null }) );
    const firstMessage = messages.first();
    if (!firstMessage) return;

    await firstMessage.pin();
    await firstMessage.react('🔥');

    await client.schemas.posts.updateOne({
        userID: thread.ownerId,
        channelID: thread.id
    }, {
        postName: thread.name,
        datePosted: thread.createdTimestamp
    }, { upsert: true });
});

client.on('threadDelete', async thread => {
    if (thread.parentId !== '1067887324723171368') return;

    await client.schemas.posts.updateOne({
        channelID: thread.id
    }, {
        deleted: true
    });
});


client.on('messageCreate', async function(message) {
    if (message.content.length > 200) return;

    const cooldown = client.cooldowns.get(`${message.author.id}-package`);
    if (cooldown) return;

    const regex = /slashcommands?package/gi;
    if (!regex.test(message.content.replace(/[\s-]/g, ''))) return;

    const embed = {
        color: 0x2196f3,
        title: 'Need help?',
        description: `
Looking for the slash command package?
Check <#1014991572439420938> for more info!

Feel free to ask for help in <#1168247660944302090>!`
    }

    await message.reply({ embeds: [embed] });

    client.cooldowns.set(`${message.author.id}-package`, Date.now() + (1000 * 60 * 10));
});

const Modname = require('./utils/Modname.js');
client.modname = Modname.bind(null, client);
client.on('guildMemberAdd', client.modname);
client.on('guildMemberUpdate', async function(oldMember, newMember) {
	const oldName = oldMember.nickname ?? oldMember.displayName;
	const newName = newMember.nickname ?? newMember.displayName;
	if (oldName === newName) return;

	await client.modname(newMember);
});