module.exports = {
	name: 'Indexing',
	description: 'Speeding up your database 100x',
	content: `
Indexing is a truly powerful tool that I personally think every database developer should know of! It is minimal effort but if done correctly can MASSIVELY speed up your database queries. \`\`\`sql
SELECT guildName, COUNT(*)
FROM messages
LEFT JOIN guilds ON (guilds.guildID = messages.guildID)
GROUP BY guilds.guildName;
\`\`\` Take this query for example to count the number of messages within each guild. On it's own this takes 600ms to process 40k messages, but with an index on \`guilds.guildID\` it takes 53ms! That is a 10x speedup with just one index! That's great but how do you use it?

**Creating an Index**
\`\`\`sql
CREATE INDEX name ON table (column);
\`\`\` There multiple times of indexing but this is the only one we will cover here. This creates an index on the column \`column\` in the table \`table\`. This is the most common type of index and is used for most queries. You can also create an index on multiple columns by separating them with a comma. \`\`\`sql
CREATE INDEX name ON table (column1, column2, ...);
\`\`\` This will create an index on the columns \`column1\`, \`column2\`, etc. in the table \`table\`. This is useful for queries that use multiple columns in the WHERE clause or for JOINs, it is often discouraged however because it adds extra complexity to the database and can slow down inserts and updates. We will cover that in a later secion though, see database optimization for a more in-depth look at indexing.

**How does it work?**
Think of an index like a book's table of contents. To find a chapter, you check the table of contents for the page number instead of flipping through every page. Similarly, an index lists values in a column with their row numbers. When you query the database, it checks the index first to quickly find the row, then retrieves it from the table. This is much faster than scanning the whole table. In database management, the goal is to avoid reading the table if the index has the needed info, especially when dealing with thousands of rows!

**How does this impact performance?**
Indexes are great for speeding up queries but they can slow down insertions and deletions. Like a book, if you were to rip out a page then the table of contents needs to be updated to reflect the change. This is the same with indexes, if you insert or delete a row then the index needs to be updated to reflect the new data. This can be a slow process if you have a lot of indexes or a lot of rows. It is a trade-off between read and write performance, you need to decide what is more important for your database.
`
}