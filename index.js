const https = require('node:https');
const crypto = require('node:crypto');
const BlacklistSchema = require('./Schemas.js/blacklist.js');
const securityConfig = require('./security/config.json')
require('./utils/ProcessHandlers.js')();

const {
    Client,
    Partials,
    ChannelType,
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
    applications: new Map(),
    bannedUsers: new Map()
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

setInterval(async () => {
    try {
        const guild = client.guilds.cache.get(securityConfig.guildID);
        if (!guild) {
            return;
        }

        const currentBans = await guild.bans.fetch();
        const currentBanIds = new Set(currentBans.keys());

        const databaseBans = await client.schemas.bannedAccs.find({ guildID: guild.id });

        for (const dbBan of databaseBans) {
            if (!currentBanIds.has(dbBan.userID)) {
                await client.schemas.bannedAccs.deleteOne({ userID: dbBan.userID });
                console.log(`[Ban Removed] ${dbBan.username} (${dbBan.userID})`);
            }
        }

        for (const [id, ban] of currentBans) {
            const existingBan = await client.schemas.bannedAccs.findOne({ userID: id });
            if (existingBan) continue;

            const bannedUser = new client.schemas.bannedAccs({
                userID: id,
                guildID: guild.id,
                username: ban.user.username,
                reason: ban.reason || 'No reason provided',
                bannedTimestamp: Date.now()
            });

            await bannedUser.save();
        }
    } catch (error) {
        console.error('Error in ban tracking:', error);
    }
}, 60000);

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

const Manager = require('./modmail-services/modmail-manager.js');
const ModmailSchema = require('./Schemas.js/modmail.js');
const modmailManager = new Manager(client);
const config = require('./modmail-services/config.js');

client.on('messageCreate', async (message) => {
    if (message.author.bot || 
        message.channel.type !== ChannelType.DM || 
        message.author.id === client.user.id) return;

    try {
        const isBlacklisted = await modmailManager.isBlacklisted(message.author.id);
        if (isBlacklisted) {
            return message.reply({ 
                content: "You have been blacklisted from using the modmail system." 
            });
        }

        const modmailData = await ModmailSchema.findOne({
            guildID: config.guild.id,
            userID: message.author.id,
            closed: false
        });

        const guild = await client.guilds.fetch(config.guild.id).catch(() => null);
        const member = guild ? await guild.members.fetch(message.author.id).catch(() => null) : null;

        const embed = modmailManager.createUserEmbed(message, member);
        const messageData = { embeds: [embed] };

        if (modmailData) {
            const channel = await client.channels.fetch(modmailData.channelID);
            const sentMessage = await channel.send(messageData);
            await message.react(config.emojis.success);
            modmailManager.CreateStatusUpdate(channel, message.author.id, sentMessage.id);
        } else {
            const category = await guild.channels.fetch(config.guild.modmailCategoryId).catch(() => null);
            if (!category) throw new Error('Category not found');

            const channel = await guild.channels.create({
                name: message.author.username,
                parent: category.id,
                type: 0
            });

            await ModmailSchema.create({
                guildID: guild.id,
                userID: message.author.id,
                channelID: channel.id,
                createdTimestamp: Date.now()
            });

            const sentMessage = await channel.send({
                ...messageData,
                components: [modmailManager.createButtons(guild.id, message.author.id, true)]
            });

            await message.author.send({
                embeds: [modmailManager.createTicketEmbed()],
                components: [modmailManager.createButtons(guild.id, message.author.id)]
            });

            await message.react(config.emojis.success);
            modmailManager.CreateStatusUpdate(channel, message.author.id, sentMessage.id);
        }

        await ModmailSchema.updateOne(
            {
                guildID: config.guild.id,
                userID: message.author.id,
                closed: false
            },
            {
                lastMessageTimestamp: Date.now()
            }
        );
    } catch (error) {
        console.error('ModMail Error:', error);
        await message.react(config.emojis.error).catch(() => {});
        await message.author.send({ 
            content: `Something went wrong - Please notify @musicmaker if you see this! Or @gh0st.dev.` 
        }).catch(() => {});
    }
});


const PERMISSION_COLORS = {
    'Owner': 0xFF0000,        // Red
    'Admin': 0xFF6B00,        // Orange
    'Senior Moderator': 0x2196f3, // Blue
    'Moderator': 0x00FF00,    // Green
    'Unknown': 0x808080       // Gray
};

const REACTIONS = {
    SUCCESS: '✅',
    ERROR: '❌',
    PENDING: '⏳'
};

function getStaffPermissionLevel(member) {
    const staffRoles = [
        { role: config.staffRoles.owner, level: 'Owner' },
        { role: config.staffRoles.admin, level: 'Admin' },
        { role: config.staffRoles.seniormoderator, level: 'Senior Moderator' },
        { role: config.staffRoles.moderator, level: 'Moderator' }
    ];

    for (const { role, level } of staffRoles) {
        if (member.roles.cache.has(role)) return level;
    }
    return 'Unknown';
}

client.on('messageCreate', async function(message) {
    try {
        if (message.author.bot || 
            message.channel.type !== ChannelType.GuildText ||
            message.channel.parentId !== config.guild.modmailCategoryId ||
            !message.content.startsWith(config.guild.sendPrefix)) {
            return;
        }

        const responderPermission = getStaffPermissionLevel(message.member);
        const embed = modmailManager.createModMailEmbed(message, responderPermission);

        const messageData = {
            embeds: [embed],
        };

        const modmailData = await client.schemas.modmail.findOne({
            guildID: message.guild.id,
            channelID: message.channel.id,
            closed: false
        });

        if (!modmailData) {
            await message.react(REACTIONS.ERROR);
            return;
        }

        const user = await client.users.fetch(modmailData.userID).catch(() => null);
        if (!user) {
            await message.react(REACTIONS.ERROR);
            return;
        }

        await user.send(messageData)
            .then(async () => {
                await message.react(REACTIONS.SUCCESS);
                await client.schemas.modmail.updateOne({
                    guildID: message.guild.id,
                    userID: modmailData.userID,
                    closed: false
                }, {
                    lastMessageTimestamp: Date.now(),
                    $inc: { messageCount: 1 }
                });
            })
            .catch(async (error) => {
                console.error('Error sending message to user:', error);
                await message.reactions.removeAll();
                await message.react(REACTIONS.ERROR);
            });

    } catch (error) {
        console.error('Error in messageCreate handler:', error);
        await message.react(REACTIONS.ERROR);
    }
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

const stringSimilarity = require('string-similarity');

// Constants for better maintainability
const THREAT_LEVELS = {
    SAFE: { score: 0, color: 0x00ffff, label: 'Safe' },
    SUSCEPTIBLE: { score: 20, color: 0x00ff00, label: 'Susceptible' },
    SUSPICIOUS: { score: 40, color: 0xffff00, label: 'Suspicious' },
    DANGEROUS: { score: 60, color: 0xff6600, label: 'Dangerous' },
    EXTREME: { score: 80, color: 0xff0000, label: 'Extreme' },
    CRITICAL: { score: 90, color: 0x000000, label: 'Critical' }
};

// Suspicious username patterns
const USERNAME_PATTERNS = {
    ALT_INDICATORS: {
        patterns: [
            /\b(alt|alternative)\b/i,
            /[aA4@][lL1][tT]/,  // Matches variations like "4lt", "a1t", "@lt", etc.
            /\b(sub|backup|spare|dummy|fake|throw)\b/i,
            /\b(new|2nd|secondary|another)\b/i
        ],
        score: 40,
        reason: "⚠️ Username suggests alternative account"
    },
    SUSPICIOUS_CONTENT: {
        patterns: [
            /\b(bot|spam|raid|nuke|hack)\b/i,
            /[0-9]{4,}/,
            /[!@#$%^&*()]{3,}/,
            /discord\.gg/i,
            /\b(free|nitro|giveaway)\b/i
        ],
        score: 15,
        reason: "⚠️ Username contains suspicious patterns"
    },
    IMPERSONATION: {
        patterns: [
            /\b(admin|mod|staff|owner)\b/i,
            /\b(official|real|verified)\b/i,
            /\b(discord|system)\b/i
        ],
        score: 25,
        reason: "🎭 Potential impersonation attempt"
    },
    EVASION: {
        patterns: [
            /(.)\1{4,}/,  // Repeated characters
            /[il|]{4,}/i,  // Common evasion characters
            /[\u200B-\u200D\uFEFF]/,  // Zero-width spaces
            /[^\x00-\x7F]+/  // Non-ASCII characters
        ],
        score: 30,
        reason: "🎯 Possible filter evasion attempt"
    }
};

function getThreatColor(score) {
    if (score >= THREAT_LEVELS.CRITICAL.score) return THREAT_LEVELS.CRITICAL.color;
    if (score >= THREAT_LEVELS.EXTREME.score) return THREAT_LEVELS.EXTREME.color;
    if (score >= THREAT_LEVELS.DANGEROUS.score) return THREAT_LEVELS.DANGEROUS.color;
    if (score >= THREAT_LEVELS.SUSPICIOUS.score) return THREAT_LEVELS.SUSPICIOUS.color;
    if (score >= THREAT_LEVELS.SUSCEPTIBLE.score) return THREAT_LEVELS.SUSCEPTIBLE.color;
    return THREAT_LEVELS.SAFE.color;
}

function analyzeUsername(username) {
    let reasons = [];
    let score = 0;

    for (const [category, data] of Object.entries(USERNAME_PATTERNS)) {
        for (const pattern of data.patterns) {
            if (pattern.test(username)) {
                score += data.score;
                reasons.push(data.reason);
                break;
            }
        }
    }

    if (username.length < 4) {
        score += 10;
        reasons.push("📏 Suspiciously short username");
    }

    const randomLooking = /^[a-zA-Z0-9]{8,}$/.test(username) && 
                         !/^[a-zA-Z]+$/.test(username) && 
                         !/^[0-9]+$/.test(username);
    if (randomLooking) {
        score += 15;
        reasons.push("🎲 Random-looking username pattern");
    }

    return { score, reasons };
}

async function calculateThreatLevel(member, bannedUsers) {
    let threatScore = 0;
    let threatReasons = [];

    const usernameAnalysis = analyzeUsername(member.user.username);
    threatScore += usernameAnalysis.score;
    threatReasons.push(...usernameAnalysis.reasons);

    const accountAge = Date.now() - member.user.createdTimestamp;
    const daysOld = Math.floor(accountAge / (1000 * 60 * 60 * 24));
    const hoursOld = Math.floor(accountAge / (1000 * 60 * 60));
    
    if (hoursOld < 1) {
        threatScore += 70;
        threatReasons.push("⚠️ Account created less than 1 hour ago");
    } else if (hoursOld < 24) {
        threatScore += 50;
        threatReasons.push(`⚠️ Account created ${hoursOld} hours ago`);
    } else if (daysOld < 7) {
        threatScore += 40;
        threatReasons.push("⚠️ Account less than 7 days old");
    } else if (daysOld < 30) {
        threatScore += 20;
        threatReasons.push("⚡ Account less than 30 days old");
    }

    let similarityMatches = [];
    for (const [id, banData] of bannedUsers) {
        const usernames = [member.user.username, ...(member.user.previousUsernames || [])];
        const bannedUsernames = [banData.username, ...(banData.previousUsernames || [])];

        for (const currentUsername of usernames) {
            for (const bannedUsername of bannedUsernames) {
                const similarity = stringSimilarity.compareTwoStrings(
                    currentUsername.toLowerCase(),
                    bannedUsername.toLowerCase()
                );
                
                if (similarity > 0.8) {
                    threatScore += 50;
                    similarityMatches.push({
                        username: bannedUsername,
                        similarity: similarity * 100,
                        banReason: banData.reason || 'No reason provided',
                        banDate: banData.banDate
                    });
                } else if (similarity > 0.6) {
                    threatScore += 30;
                    similarityMatches.push({
                        username: bannedUsername,
                        similarity: similarity * 100,
                        banReason: banData.reason || 'No reason provided',
                        banDate: banData.banDate
                    });
                }
            }
        }
    }

    if (member.user.avatar) {
        for (const [id, banData] of bannedUsers) {
            if (banData.avatar && member.user.avatar === banData.avatar) {
                threatScore += 40;
                threatReasons.push("🖼️ Avatar matches a banned user");
                break;
            }
        }
    }

    const joinedServers = member.client.guilds.cache.filter(g => g.members.cache.has(member.user.id));
    if (joinedServers.size === 1) {
        threatScore += 10;
        threatReasons.push("📱 First time joining any mutual server");
    }

    const recentLeaves = client.cache.recentLeaves?.get(member.user.id) || [];
    if (recentLeaves.length > 0) {
        const lastLeave = recentLeaves[recentLeaves.length - 1];
        const timeSinceLeave = Date.now() - lastLeave;
        if (timeSinceLeave < 24 * 60 * 60 * 1000) {
            threatScore += 35;
            threatReasons.push("🔄 Rejoined server within 24 hours of leaving");
        }
    }

    if (similarityMatches.length > 0) {
        threatReasons.push("🔍 Similar username to banned user(s):");
        similarityMatches.forEach(match => {
            threatReasons.push(`   • ${match.username} (${match.similarity.toFixed(1)}% match)`);
            threatReasons.push(`     Ban reason: ${match.banReason}`);
            if (match.banDate) {
                threatReasons.push(`     Banned: <t:${Math.floor(match.banDate/1000)}:R>`);
            }
        });
    }

    threatScore = Math.min(threatScore, 100);

    return {
        score: threatScore,
        reasons: threatReasons,
        level: getThreatLabel(threatScore),
        similarityMatches
    };
}

function getThreatLabel(score) {
    if (score >= THREAT_LEVELS.CRITICAL.score) return THREAT_LEVELS.CRITICAL.label;
    if (score >= THREAT_LEVELS.EXTREME.score) return THREAT_LEVELS.EXTREME.label;
    if (score >= THREAT_LEVELS.DANGEROUS.score) return THREAT_LEVELS.DANGEROUS.label;
    if (score >= THREAT_LEVELS.SUSPICIOUS.score) return THREAT_LEVELS.SUSPICIOUS.label;
    if (score >= THREAT_LEVELS.SUSCEPTIBLE.score) return THREAT_LEVELS.SUSCEPTIBLE.label;
    return THREAT_LEVELS.SAFE.label;
}

client.on('guildMemberAdd', async member => {
    if (member.guild.id !== '970775928596746290') return;

    const channel = await client.channels.fetch('1053759729526112306').catch(() => {});
    if (!channel) return console.log('No channel found');

    const threatAssessment = await calculateThreatLevel(member, client.cache.bannedUsers);
    
    const embed = {
        author: {
            name: `${member.user.tag} (${member.user.id})`,
            iconURL: member.user.displayAvatarURL({ dynamic: true })
        },
        description: `
👤 **Member Information**
- Mention: <@${member.user.id}> \`(${member.user.id})\`
- Bot: ${member.user.bot ? '✅' : '❌'}
- Account Age: ${Math.floor((Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24))} days

⏰ **Timestamps**
- Created: <t:${~~(member.user.createdTimestamp / 1000)}:f> (<t:${~~(member.user.createdTimestamp / 1000)}:R>)
- Joined: <t:${~~(member.joinedTimestamp / 1000)}:f> (<t:${~~(member.joinedTimestamp / 1000)}:R>)

🚨 **Threat Assessment**
- Level: ${threatAssessment.level}
- Score: ${threatAssessment.score}/100
${threatAssessment.reasons.map(reason => `${reason}`).join('\n')}

${threatAssessment.score >= THREAT_LEVELS.DANGEROUS.score ? '⚠️ **High threat level detected! Manual review recommended.**' : ''}
`,
        color: getThreatColor(threatAssessment.score),
        timestamp: new Date(),
        thumbnail: {
            url: member.user.displayAvatarURL({ dynamic: true })
        }
    };

    let actions = [];
    
    if (threatAssessment.score >= THREAT_LEVELS.CRITICAL.score) {
        try {
            await member.timeout(24 * 60 * 60 * 1000, 'Critical threat level detected');
            actions.push('🔒 User has been automatically timed out for 24 hours');
            
            const securityChannel = await client.channels.fetch(securityConfig.actionsChannel).catch(() => null);
            if (securityChannel) {
                await securityChannel.send({
                    content: `🚨 **CRITICAL THREAT DETECTED**\nUser: ${member.user.tag}\nAction: 24h timeout\nScore: ${threatAssessment.score}`,
                    allowedMentions: { parse: ['roles'] }
                });
            }
        } catch (error) {
            console.error('Failed to handle critical threat:', error);
            actions.push('❌ Failed to apply automatic actions - please check manually');
        }
    } else if (threatAssessment.score >= THREAT_LEVELS.EXTREME.score) {
        try {
            await member.timeout(1 * 60 * 60 * 1000, 'Extreme threat level detected');
            actions.push('⚠️ User has been automatically timed out for 1 hour');
        } catch (error) {
            console.error('Failed to handle extreme threat:', error);
            actions.push('❌ Failed to apply automatic actions - please check manually');
        }
    }

    if (actions.length > 0) {
        embed.description += `\n\n📋 **Automatic Actions Taken**\n${actions.join('\n')}`;
    }

    const needsPing = threatAssessment.score >= THREAT_LEVELS.DANGEROUS.score || 
                     threatAssessment.reasons.some(reason => reason.includes("alternative account"));

    await channel.send({ 
        content: needsPing ? 'Potential Alt Account Detected!' : null,
        embeds: [embed] 
    });
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
const { channel } = require('node:diagnostics_channel');
client.modname = Modname.bind(null, client);
client.on('guildMemberAdd', client.modname);
client.on('guildMemberUpdate', async function(oldMember, newMember) {
	const oldName = oldMember.nickname ?? oldMember.displayName;
	const newName = newMember.nickname ?? newMember.displayName;
	if (oldName === newName) return;

	await client.modname(newMember);
});

const sticky = require('./Schemas.js/stickMessageSystem');

client.on('messageCreate', async (message) => {
    if (!message.guild || !message.channel) return;

    var data = await sticky.find({ Guild: message.guild.id, Channel: message.channel.id});
    if (data.length == 0) return;
    if (message.author.bot) return;

    await data.forEach(async value => {
        if (value.Count == value.Cap-1) {
            const embed = {
                color: 0x2196f3,
                title: `${client.user.username} Sticky Message System`,
                description: `> ${value.Message}`,
                timestamp: new Date()
            }
            await message.channel.send({ embeds: [embed] });
            value.Count = 0;
            await value.save();
        } else {
            value.Count++;
            await value.save();
        }
    });
});