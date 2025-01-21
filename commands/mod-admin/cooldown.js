const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');
const deniedAppSchema = require('../../Schemas.js/deniedApps');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("cooldown")
        .setDescription("Manage application cooldowns")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
        .addStringOption(option => 
            option.setName("type")
                .setDescription("The type of cooldown operation")
                .setRequired(true)
                .addChoices(
                    { name: "Set Cooldown", value: "set" },
                    { name: "Remove Cooldown", value: "remove" },
                    { name: "View Cooldown", value: "view" },
                    { name: "List All Cooldowns", value: "list" },
                    { name: "Force 14-day Cooldown", value: "force" }
                )
        )
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The target user")
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option.setName("days")
                .setDescription("Number of cooldown days")
                .addChoices(
                    { name: "1 day", value: 1 },
                    { name: "2 days", value: 2 },
                    { name: "3 days", value: 3 },
                    { name: "4 days", value: 4 },
                    { name: "5 days", value: 5 },
                    { name: "6 days", value: 6 },
                    { name: "7 days", value: 7 },
                    { name: "8 days", value: 8 },
                    { name: "9 days", value: 9 },
                    { name: "10 days", value: 10 },
                    { name: "11 days", value: 11 },
                    { name: "12 days", value: 12 },
                    { name: "13 days", value: 13 },
                    { name: "14 days", value: 14 }
                )
                .setRequired(false)
        ),

    async execute(interaction, client) {
        try {
            const type = interaction.options.getString("type");
            const user = interaction.options.getUser("user");
            const days = interaction.options.getInteger("days");

            if (type !== "list" && !user) {
                return interaction.reply({
                    content: "User is required for this operation",
                    ephemeral: true
                });
            }

            if (type === "set" && !days) {
                return interaction.reply({
                    content: "Days is required for set operation",
                    ephemeral: true
                });
            }

            switch (type) {
                case "set": {
                    let deniedApp = await deniedAppSchema.findOne({ 
                        userID: user.id,
                        guildID: interaction.guild.id 
                    });
                    
                    if (!deniedApp) {
                        deniedApp = new deniedAppSchema({
                            id: `${interaction.guild.id}-${user.id}`,
                            userID: user.id,
                            guildID: interaction.guild.id,
                            submittedAt: new Date(),
                            deniedTimestamp: Date.now() + (days * 24 * 60 * 60 * 1000)
                        });
                    } else {
                        deniedApp.deniedTimestamp = Date.now() + (days * 24 * 60 * 60 * 1000);
                    }
                    
                    await deniedApp.save();
                    await interaction.reply({
                        content: `Set ${days} day cooldown for ${user.tag}`,
                        ephemeral: true
                    });
                    break;
                }
                case "remove": {
                    await deniedAppSchema.findOneAndDelete({ 
                        userID: user.id,
                        guildID: interaction.guild.id 
                    });
                    
                    await interaction.reply({
                        content: `Removed cooldown for ${user.tag}`,
                        ephemeral: true
                    });
                    break;
                }
                case "view": {
                    const viewApp = await deniedAppSchema.findOne({ 
                        userID: user.id,
                        guildID: interaction.guild.id 
                    });

                    if (!viewApp || viewApp.deniedTimestamp < Date.now()) {
                        return interaction.reply({
                            content: `${user.tag} has no active cooldown`,
                            ephemeral: true
                        });
                    }

                    const timeLeft = Math.ceil((viewApp.deniedTimestamp - Date.now()) / (1000 * 60 * 60 * 24));
                    await interaction.reply({
                        content: `${user.tag} has ${timeLeft} days remaining on cooldown`,
                        ephemeral: true
                    });
                    break;
                }
                case "list": {
                    const activeApps = await deniedAppSchema.find({
                        guildID: interaction.guild.id,
                        deniedTimestamp: { $gt: Date.now() }
                    });

                    if (activeApps.length === 0) {
                        return interaction.reply({
                            content: "No active cooldowns",
                            ephemeral: true
                        });
                    }

                    const cooldownList = await Promise.all(activeApps.map(async app => {
                        const user = await interaction.client.users.fetch(app.userID);
                        const days = Math.ceil((app.deniedTimestamp - Date.now()) / (1000 * 60 * 60 * 24));
                        return `${user.tag}: ${days} days remaining`;
                    }));

                    const embed = new EmbedBuilder()
                        .setTitle("Active Cooldowns")
                        .setColor(0x5865F2)
                        .setDescription(cooldownList.join('\n'));

                    await interaction.reply({
                        embeds: [embed],
                        ephemeral: true
                    });
                    break;
                }
                case "force": {
                    let forceApp = await deniedAppSchema.findOne({ 
                        userID: user.id,
                        guildID: interaction.guild.id 
                    });

                    if (!forceApp) {
                        forceApp = new deniedAppSchema({
                            id: `${interaction.guild.id}-${user.id}`,
                            userID: user.id,
                            guildID: interaction.guild.id,
                            submittedAt: new Date(),
                            deniedTimestamp: Date.now() + (14 * 24 * 60 * 60 * 1000)
                        });
                    } else {
                        forceApp.deniedTimestamp = Date.now() + (14 * 24 * 60 * 60 * 1000);
                    }

                    await forceApp.save();
                    await interaction.reply({
                        content: `Forced 14 day cooldown for ${user.tag}`,
                        ephemeral: true
                    });
                    break;
                }
            }
        } catch (error) {
            console.error('Cooldown command error:', error);
            await interaction.reply({
                content: 'An error occurred while processing the command.',
                ephemeral: true
            });
        }
    }
}