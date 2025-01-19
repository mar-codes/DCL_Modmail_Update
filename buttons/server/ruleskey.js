module.exports = {
	customID: 'ruleskey',
	execute: async function(interaction, client, args) {
		return await interaction.reply({
            content: `
### Understanding our rules :brain:

Our rules are broken up into three categories : general rules, community member rules, and specific community guidelines. This key will go over each of these and how to best follow them.

- General rules outlines the general rules you must obey while interacting with the server.
- Community member rules are rules your account must conform to as a community member here.
- Specific community guidelines outlines rules you must obey relating to the specific aspects of this server.

**Word key: :key: **
> **Anyone** :point_right: Any person within or outside of the server
> **Staff** :point_right: Any person with the moderator, admin, coding helper, trainee coding helper, or trainee moderator roles
> **NSFW** :point_right: "Not safe for work," anything that is inappropriate, considered sensitive, or made with intent of being provactive

Finally, please remember Moderators have the right to subjectively moderate based on their interpretation of the rules. If you feel you have been unfairly moderated, please contact <@1022914500397109260>, engaging in moderative discussion in public chats is not permitted.

:mailbox_with_mail: Please contact us using <@1022914500397109260> if you have any questions, concerns, moderative issues, or need any clarification on our server rules.
`,
            ephemeral: true
        });
	}
}