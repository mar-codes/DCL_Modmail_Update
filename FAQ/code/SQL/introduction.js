module.exports = {
	name: 'Introduction to Databases - The fundamentals',
	description: 'All the stepping stones to Mongo or SQL',
	media: 'tables.png',
	content: `
A database, in general, is a structured system designed to store, organize, and manage large amounts of information. Think of it like a virtual filing cabinet where data is kept in organized collections, much like rows and columns in a spreadsheet. Each collection contains individual entries, or records, and each record has specific pieces of information, or fields. This organization makes it easy to retrieve, update, and manage data efficiently.

In SQL-based databases, this structure is rigid and follows a set of rules. You define what kind of data each field can hold, like ensuring phone numbers are numbers and names are text. While some databases, like MongoDB, are more flexible and allow you to change the structure of your records on the fly, it's still important to keep a consistent structure for good data management. Regardless of whether you're using SQL or MongoDB, sticking to clear rules helps keep your data clean and prevents issues down the road.

Both SQL and MongoDB let you run powerful queries to find, update, or analyze your data. In SQL, you use commands to search and manipulate tables of data. MongoDB operates similarly, but with a slightly different syntax and approach, using collections of documents. Despite MongoDB's flexibility, applying SQL-like structure and discipline will make it easier to scale and maintain your database as it grows.`
}