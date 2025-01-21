const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("remove-blacklist")
    .setDescription("Remove a user from the blacklist")
    .addUserOption(option => 
        option.setName("user")
        .setDescription("The target user")
        .setRequired(true)
    ),
    async execute(interaction, client) {
        try {
            const user = interaction.options.getUser("user");

            const blacklistData = await client.schemas.blacklist.findOne({
                userID: user.id
            });

            if (!blacklistData) {
                return interaction.reply({
                    content: "This user is not blacklisted",
                    ephemeral: true
                });
            }

            await client.schemas.blacklist.deleteOne({
                userID: user.id
            });

            interaction.reply({
                content: `Successfully removed ${user.tag} from the blacklist`,
                ephemeral: true
            });
        } catch (e) {
            console.error(e);
            interaction.reply({
                content: "An error occurred while processing this command",
                ephemeral: true
            });
        }
    }
}