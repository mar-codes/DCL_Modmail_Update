const fs = require('node:fs');

const schemas = fs.readdirSync(`${__dirname}/../Schemas.js`).filter(file => file.endsWith('.js'));

const schemaExports = {};

for (const file of schemas) {
	const fileName = file.split('.')[0];
	schemaExports[fileName] = require(`${__dirname}/../Schemas.js/${file}`);
}

module.exports = schemaExports;