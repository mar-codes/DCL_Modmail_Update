module.exports = {
	name: 'Introduction to SQL - Data types',
	description: 'A deeper look on SQL data types and their uses',
	content: `
There are only a few basic data types in SQL but it is important to use them correctly to maintain data integrity and efficiency. Some are best for numbers, some for text, and some for raw files. The most common data types, and really all you will ever need, is \`INT\`, \`TEXT\`, \`BOOLEAN\`, and \`BLOB\`. There are others, but these are the most common and the most useful, any other data type can be derived from these.

**INTEGER**
These are all your basic numbers. They can be positive or negative, but they cannot have a decimal point. They are used for things like IDs, quantities, and other whole numbers. The most common example is using it as an auto-incrementing primary key.

**TEXT**
Text is used for strings of characters. They are used for things like names, addresses, and other strings of characters.

**BOOLEAN**
Boolean is used for true/false values. They are used for things like yes/no, on/off, and other binary values. In SQL this is often represented as 1/0. Most often you will see these used as feature flags, for example DarkMode=true.

**BLOB**
Blob is used for raw binary data when you don't know what the data is. They are great for things like images, videos, and other raw files. They are horrible for querying so avoid at all costs, it is perfect for a CDN server though to store the files in the DB rather than the file system if a concern of yours.
`
}