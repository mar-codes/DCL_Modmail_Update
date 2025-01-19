module.exports = {
	customID: 'posts',
	execute: async function(interaction, client, [action, userID, currentPage]) {
		currentPage = parseInt(currentPage);
		if (action === 'prev') currentPage--;
		if (action === 'next') currentPage++;

		await interaction.deferUpdate().catch(() => {});
		const command = client.commands.get('posts');
		interaction.options = {
			// getUser: () => client.users.cache.get(userID)
			getUser: client.users.cache.get.bind(client.users.cache, userID)
		}
		return await command.execute(interaction, client, currentPage);
	}
}