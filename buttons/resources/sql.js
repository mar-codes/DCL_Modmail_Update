module.exports = {
	customID: 'resources-sql',
	execute: async function(interaction, client, [ fromChannel ]) {

		await interaction.deferUpdate().catch(() => {});

		const embed = {
			description: `
📗 - Beginner
📘 - Intermediate
📕 - Advanced
📚 - Mastery

Databases truly are where the heart of the application lives, data is always becoming an increasing concern for developers and users alike.
SQL is a fantastic choice both for speed and minimalism, here are some great ways to get you started down the right path!

📗 - [SQLBolt](https://sqlbolt.com/)
📗 - [SQLZoo](https://sqlzoo.net/)
📗 - [W3Schools](https://www.w3schools.com/sql/)
📘 - [Decomplexify](https://www.youtube.com/@decomplexify/videos)
📘 - [Mode Analytics SQL](https://mode.com/sql-tutorial/introduction-to-sql)
📕 - [Use The Index](https://use-the-index-luke.com/)
📕 - [Vertabelo Academy](https://academy.vertabelo.com/)
📕 - [LeetCode](https://leetcode.com/problemset/database/)
📚 - [SQL Performance Explained](https://pdfcoffee.com/sql-performance-explainedpdf-pdf-free.html)
📚 - [SQL Window Functions](https://www.geeksforgeeks.org/window-functions-in-sql/)
`,
			color: 0x2196f3
		}

		const backButton = {
			type: 1,
			components: [{
				type: 2,
				label: 'Back',
				style: 2,
				custom_id: 'resources-main'
			}]
		}

		const messagePayload = {
			embeds: [embed],
			components: []
		}

		if (!fromChannel) {
			messagePayload.components.push(backButton);
		}

		await interaction.editReply(messagePayload);
	}
}