const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("remove-blacklist")
        .setDescription("Remove a user from the blacklist")
        .addUserOption(option => option
            .setName("user")
            .setDescription("The target user")
            .setRequired(true)
        ),
    async execute(interaction, client) {
        try {
            await interaction.deferReply({ ephemeral: true });
            const user = interaction.options.getUser("user");

            if (!user) {
                return interaction.editReply({
                    content: "Invalid user provided",
                    ephemeral: true
                });
            }

            const blacklistData = await client.schemas.blacklist.findOne({
                userID: user.id
            });

            if (!blacklistData) {
                return interaction.editReply({
                    content: "This user is not blacklisted",
                    ephemeral: true
                });
            }

            const result = await client.schemas.blacklist.deleteOne({
                userID: user.id
            });

            if (result.deletedCount === 0) {
                return interaction.editReply({
                    content: "Failed to remove user from blacklist. Please try again.",
                    ephemeral: true
                });
            }
            
            return interaction.editReply({
                content: `Successfully removed ${user.tag} from the blacklist`,
                ephemeral: true
            });
        } catch (e) {
            console.error('Error in remove-blacklist command:', e);
            return interaction.editReply({
                content: "An error occurred while processing this command. Please check the logs.",
                ephemeral: true
            });
        }
    }
}