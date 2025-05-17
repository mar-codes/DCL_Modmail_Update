const BlacklistSchema = require('../Schemas.js/blacklist');
const { formatTimestamp, formatUserStatus } = require('./utils');
const { EmbedBuilder } = require('discord.js');
const config = require('./config');
const modmail = require('../Schemas.js/modmail');

class ModmailManager {
    constructor(client) {
        this.client = client;
        this.activeIntervals = new Map();
        this.PERMISSION_COLORS = {
            'Owner': 0xFF0000,        // Red
            'Admin': 0xFF6B00,        // Orange
            'Senior Moderator': 0x2196f3, // Blue
            'Moderator': 0x4CAF50,    // Green
            'Unkown': 0x2B82E3
        };
    }

    async isBlacklisted(userID) {
        try {
            const blacklistDoc = await BlacklistSchema.findOne({ 
                userID: userID 
            });
            return blacklistDoc !== null;
        } catch (error) {
            console.error('Error checking blacklist status', error);
            return false;
        }
    }

    async CreateStatusUpdate(channel, userId, messageId) {
        const guild = this.client.guilds.cache.get(config.guild.id);

        const updateStatus = async () => {
            try {
                const member = await guild.members.fetch(userId);
                const presence = member.presence;
                const message = await channel.messages.fetch(messageId);

                if (!message?.embeds?.[0]) {
                    console.error('No message or embeds found:', { messageId, hasMessage: !!message });
                    return this.clearInterval(messageId);
                }

                const updatedEmbed = {
                    ...message.embeds[0].toJSON(),
                    fields: [...(message.embeds[0].fields || [])]
                };

                let statusIndex = updatedEmbed.fields.findIndex(f => f.name === 'User Status');
                const statusField = {
                    name: 'User Status',
                    value: `${formatUserStatus(presence?.status)}\nLast Updated: <t:${Math.floor(Date.now()/1000)}:R>`,
                    inline: true
                };

                if (statusIndex === -1) {
                    updatedEmbed.fields.push(statusField);
                } else {
                    updatedEmbed.fields[statusIndex] = statusField;
                }

                await message.edit({ embeds: [updatedEmbed] });

            } catch (error) {
                console.error('Error updating status:', error);
                this.clearInterval(messageId);
            }
        };

        await updateStatus();
        const intervalId = setInterval(updateStatus, 60_000);
        this.activeIntervals.set(messageId, intervalId);
    }

    clearInterval(messageId) {
        if (this.activeIntervals.has(messageId)) {
            clearInterval(this.activeIntervals.get(messageId));
            this.activeIntervals.delete(messageId);
        }
    }

    createUserInfoEmbed(message, member) {
        const embed = {
            author: {
                name: message.author.globalName || message.author.username,
                iconURL: message.author.displayAvatarURL({ dynamic: true, size: 128 })
            },
            title: '📋 User Information',
            fields: [
                {
                    name: 'User Details',
                    value: [
                        `ID: \`${message.author.id}\``,
                        `Created: ${formatTimestamp(message.author.createdTimestamp).relative}`,
                        member ? `Joined: ${formatTimestamp(member.joinedTimestamp).relative}` : ''
                    ].filter(Boolean).join('\n'),
                    inline: true
                },
                {
                    name: 'User Status',
                    value: `${formatUserStatus(member?.presence?.status)}`,
                    inline: true
                }
            ],
            thumbnail: {
                url: message.author.displayAvatarURL({ dynamic: true, size: 256 })
            },
            color: config.colors.primary,
            timestamp: new Date(),
            footer: {
                text: 'ModMail User Information',
                iconURL: this.client.user.displayAvatarURL()
            }
        };

        return embed;
    }

    createUserMessageEmbed(message) {
        const embed = {
            author: {
                name: message.author.globalName || message.author.username,
                iconURL: message.author.displayAvatarURL({ dynamic: true, size: 128 })
            },
            description: [
                '```',
                message.content || '*No message content*',
                '```'
            ].join('\n'),
            color: config.colors.primary,
            timestamp: new Date(),
            footer: {
                text: 'User Message',
                iconURL: this.client.user.displayAvatarURL()
            }
        };

        if (message.attachments.size > 0) {
            embed.fields = [{
                name: `${config.emojis.attachment} Attachments`,
                value: message.attachments.map(attachment => 
                    `[${attachment.name}](${attachment.url})`
                ).join('\n')
            }];
        }

        const sticker = message.stickers.first();
        if (sticker) {
            embed.image = { url: sticker.url };
        }

        return embed;
    }

    async setupInitialModmail(channel, message, member) {
        try {
            const userInfoEmbed = this.createUserInfoEmbed(message, member);
            const infoMessage = await channel.send({ 
                embeds: [userInfoEmbed],
                components: [this.createButtons(channel.guild.id, message.author.id, true)]
            });
            await infoMessage.pin();

            await this.CreateStatusUpdate(channel, message.author.id, infoMessage.id);

            const messageEmbed = this.createUserMessageEmbed(message);
            await channel.send({ embeds: [messageEmbed] });

            return infoMessage.id;
        } catch (error) {
            console.error('Error setting up initial modmail:', error);
            throw error;
        }
    }

    createTicketEmbed(message = null) {
        return {
            title: config.embeds.ticket.title,
            description: '## Your ticket has been created successfully!\n─────────────────────────',
            fields: [
                {
                    name: '🎫 Ticket Information',
                    value: [
                        `• Created: ${formatTimestamp(Date.now()).relative}`,
                        `• Status: Active`,
                    ].join('\n')
                },
                {
                    name: '📋 Next Steps',
                    value: '• Your message has been sent to our staff team\n• Please wait patiently for a response\n• You can send additional messages here'
                },
                {
                    name: '⚠️ Important Notes',
                    value: '• Keep conversations civil and respectful\n• Include all relevant information\n• We do not provide support for code here create a thread in the help channels'
                }
            ],
            color: config.colors.primary,
            timestamp: new Date(),
            footer: {
                iconURL: this.client.user.displayAvatarURL()
            }
        };
    }

    createButtons(guildId, userId, isStaff = false) {
        const baseButtons = [
            {
                type: 2,
                label: 'Close Ticket',
                style: 4,
                custom_id: `modmail_close_${guildId}_${userId}`,
                emoji: config.emojis.lock
            },
            {
                type: 2,
                label: 'Export Transcript',
                style: 2,
                custom_id: `modmail_transcript_${guildId}_${userId}`,
                emoji: config.emojis.transcript
            }
        ];

        if (isStaff) {
            baseButtons.push({
                type: 2,
                label: 'Blacklist User',
                style: 4,
                custom_id: `modmail_blacklist_${guildId}_${userId}`,
                emoji: config.emojis.blacklist
            });
        }

        return {
            type: 1,
            components: baseButtons
        };
    }

    

    createModMailEmbed(message, responderPermission) {
        const color = this.PERMISSION_COLORS[responderPermission] || this.PERMISSION_COLORS['Unknown'];

        const now = new Date();
        const messageDate = new Date(message.createdTimestamp);
        const isToday = messageDate.toDateString() === now.toDateString();
        
        const timestamp = messageDate.toLocaleString('en-US', {
            timeStyle: 'short',
            dateStyle: isToday ? undefined : 'short'
        });

        let description = message.content?.replace(/^\.+ */, '') || '*No message content*';
        if (description.length > 4000) {
            description = description.slice(0, 3997) + '...';
        }
    
        const embed = new EmbedBuilder()
        .setColor(color || 0x2196f3)
        .setAuthor({
            name: `Response from ${message.author.globalName || message.author.username} • ${responderPermission}`,
            iconURL: message.author.displayAvatarURL({ dynamic: true, size: 128 })
        })
        .setDescription(description)
        .setFooter({ 
            text: `Staff Response • ${timestamp}${message.editedTimestamp ? ' (edited)' : ''}`
        });
    
        if (message.attachments.size > 0) {
            const attachments = message.attachments.map(a => {
                const ext = a.name?.split('.').pop()?.toLowerCase() || 'unknown';
                const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext);
                
                return isImage ? a.url : `[${a.name || 'Attachment'}](${a.url})`;
            }).join('\n');
    
            embed.addFields({
                name: `📎 Attachments (${message.attachments.size})`,
                value: attachments
            });

            const firstAttachment = message.attachments.first();
            const firstExt = firstAttachment?.name?.split('.').pop()?.toLowerCase();
            if (firstExt && ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(firstExt)) {
                embed.setThumbnail(firstAttachment.url);
            }
        }
    
        return embed;
    }
}

module.exports = ModmailManager;
