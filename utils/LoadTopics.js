const ReadFolder = require('./ReadFolder.js');
const fs = require('node:fs');

const db = require('./CacheDB.js');

/*
module.exports = {
	name: 'Introduction to mongoDB',
	description: 'A brief introduction to mongoDB',
	content: 'MongoDB is a NoSQL database program that uses JSON-like documents with optional schemas.',
	media?: 'path/to/image.png'
}
*/

const Logs = require('./Logs.js');

const insertQuery = db.prepare(`
	INSERT INTO topics (name, description, content, media, type, category)
	VALUES (?, ?, ?, ?, ?, ?)
`);

module.exports = function () {
	const files = ReadFolder(`FAQ`);

	
	for (const file of files) {
		const data = file.data;

		if (typeof data.name !== 'string') {
			console.error(`Invalid name found in ${file.path} - Expected string, got ${typeof data.name}`);
			continue;
		}

		if (typeof data.description !== 'string') {
			console.error(`Invalid description found in ${file.path} - Expected string, got ${typeof data.description}`);
			continue;
		}

		if (typeof data.content !== 'string') {
			console.error(`Invalid content found in ${file.path} - Expected string, got ${typeof data.content}`);
			continue;
		}

		if (data.media) {
			if (typeof data.media !== 'string') {
				console.error(`Invalid media found in ${file.path} - Expected string, got ${typeof data.media}`);
				continue;
			}

			try {
				fs.accessSync(`${__dirname}/../assets/${data.media}`, fs.constants.F_OK | fs.constants.R_OK);
			} catch (error) {
				console.error(`Invalid media found in ${file.path} - File not found: ${data.media}`);
				continue;
			}
		}

		const folders = file.path.split('/');
		const type = folders[folders.length - 3];
		const category = folders[folders.length - 2];

		data.type = type;
		data.category = category;

		insertQuery.run(data.name.trim(), data.description.trim(), data.content.trim(), data.media?.trim(), type, category);
	}

	const topicCount = db.prepare(`SELECT COUNT(*) FROM topics`).pluck().get();

	Logs.debug(`Loaded ${topicCount} topics`);
}