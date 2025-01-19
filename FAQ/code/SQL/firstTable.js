module.exports = {
	name: 'Introduction to SQL - First Tables',
	description: 'This is a guide to creating your first table in SQL.',
	media: 'firstTable.png',
	content: `
**Please make sure you have the basic setup from the previous guide before continuing. Install the appropriate package by running \`npm install better-sqlite3\` and the VSCode extension.**

Tables are the core fundamental to SQL and really any database for that matter. There are many tools you can use to make the process easier but we will stick with raw SQL statements for this tutorial. For this example lets say we are making a commerce website and we need to store the users information. We will need to store their name, email, and password. **This should never be done in production** but for this example we will keep it simple.

Your first table will consist of the \`CREATE TABLE\` statement followed by the name of the table and then the columns. Here is an example of what that would look like: \`\`\`sql
CREATE TABLE users (
	name TEXT,
	email TEXT,
	password TEXT
);
\`\`\` This will create a basic table with columns named \`name\`, \`email\`, and \`password\`. The \`TEXT\` type denotes the column can hold any type of text. There are many other types you can use but we will cover those in a later tutorial.

The next step is now you can add or insert data into your table, for this there is a \`INSERT INTO\` query we can use. Lets create our very first user, we will name him Bob! \`\`\`sql
INSERT INTO users (name, email, password)
VALUES ('Bob', 'bob@example.com', 'password123')
\`\`\` We can then use the \`SELECT\` query to view the data we just inserted. \`\`\`sql
SELECT * FROM users
\`\`\` This will return all the data in the table, you should see the user Bob in the results. If you haven't already, this would be a great time to install the VSCode extension to view the database and see the data below!
`
}