module.exports = {
	name: 'Introduction to SQL - Getting Started',
	description: 'This is a guide to getting started with SQL.',
	content: `
To get started with SQL we will be using a package called \`better-sqlite3\`, you can install it via \`npm install better-sqlite3\`. SQLite is a very lightweight version of SQL that runs locally on your computer, allowing you to easily backup and view the data live. This is a great way to get started with SQL as it removes a lot of confusing features and still gives the tools to create a very powerful database.

To get started with SQLite, you will need to add this into your code: \`\`\`js
const db = require('better-sqlite3')('myDatabase.sqlite');
\`\`\` This will create a new database file called \`myDatabase.sqlite\`. You can name this whatever you want, but make sure it is something that makes sense to you, like the name of the application. From there it is recommended to add this extension from VSCode: https://marketplace.visualstudio.com/items?itemName=qwtel.sqlite-viewer. This will allow you to easily view the database and see what is being stored.

There are only 2 main functions you need to concern yourself in SQLite, \`db.prepare()\` and \`db.exec()\`. The difference between the two is really negligable and you can use either one, but avoid \`exec()\` when you can as it can lead to security vulnerabilities if not careful.`
}