module.exports = {
	name: 'Introduction to SQL - Conditionals',
	description: 'A deeper look on SQL select statements and their uses',
	media: 'ComplexQuery.png',
	content: `
Being able to read data from a table is cool and all but sometimes you don't want *everyting*, perhaps only uses with a name of "Bob" or employees who make more than $100,000. This is where the \`WHERE\` clause comes in. The \`WHERE\` clause is used to filter records meeting a criteria. Consider the following query as an example: \`\`\`sql
SELECT *
FROM users
WHERE name = 'Bob'
\`\`\` This would return all users with the name of "Bob". You can also use the \`AND\` and \`OR\` operators to filter on multiple conditions. Take this query to return all employees who are Software Engineers and make more than $100,000: \`\`\`sql
SELECT *
FROM employees
WHERE salary > 100000
AND title = 'Software Engineer'
\`\`\`

Conditionals are at the heart of SQL, used in nearly every single query! They are used not only in \`SELECT\` statements but also in \`UPDATE\`, \`DELETE\`, \`INSERT\`, generated columns, triggers, and so so SO much more. We will take a deeper dive into more conditionals in a later lesson but for now all you need is the \`WHERE\` and \`AND\` operators to get started. Coming in later topics we have \`OR\`, \`IN\`, \`BETWEEN\`, \`LIKE\`, \`IS NULL\`, and even sort sorting with \`GROUP BY\`, \`HAVING\`, and \`ORDER BY\`.

*Very complex queries can be made with just these few operators, but they can also be very slow*
`
}