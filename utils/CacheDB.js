const db = require('better-sqlite3')(`:memory:`);

db.exec(`
	CREATE TABLE topics (
		topicID INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL UNIQUE,
		description TEXT NOT NULL,
		content TEXT NOT NULL,
		media TEXT,
		type TEXT NOT NULL,
		category TEXT NOT NULL
	);
	CREATE INDEX idx_topics_type ON topics (type);
	CREATE INDEX idx_topics_category ON topics (category);
`);

module.exports = db;