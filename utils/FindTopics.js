const db = require('./CacheDB.js');

const faqLookup = db.prepare(`
	SELECT *
	FROM topics
	WHERE type = ?
	ORDER BY topicID ASC
`); // Array<{ name: string, description: string, content: string, media: string, type: string, category: string }>

const STOP_WORDS = [ 'the', 'is', 'not', 'a', 'to', 'and', 'or', 'if', 'use', 'any', 'get', 'when', 'will', 'ask', 'of', 'in', 'on', 'for', 'with', 'as', 'at', 'by', 'from', 'that', 'this', 'these', 'those', 'an', 'be', 'are', 'it', 'its', 'it\'s', 'i', 'you', 'he', 'she', 'we', 'they', 'them', 'us', 'our', 'ours', 'their', 'theirs', 'my', 'mine', 'your', 'yours', 'his', 'her', 'hers'];

function preprocess(text) {
    return String(text)
		.toLowerCase() // convert to lowercase
		.split(/\W+/) // split into words
		.map(word => word.replace(/((ing)|(ed)|(es)|(s)|(ies)|(ly))+$/, '')) // remove common suffixes
		.map(word => word.replace(/\d+/, '')) // remove numbers
		.filter(word => !STOP_WORDS.includes(word)) // remove stop words
		.filter(Boolean); // remove empty strings
}

const POINT_WEIGHTS = {
	TITLE: 0.3,
	DESCRIPTION: 0.2,
	CONTENT: 0.05,
}

const EMPTY_TOPIC = {
	topicID: 0,
	name: '',
	description: '',
	content: '',
	media: '',
	type: '',
	category: ''
}

function CountMathcingWords(topicWords = [''], queryWords = ['']) {
	let matchCount = 0;

	for (const word of queryWords) {
		if (topicWords.includes(word)) {
			matchCount++;
		}
	}

	return matchCount;
}


function ScoreTopic(topic = EMPTY_TOPIC, query = '') {
	const queryWords = preprocess(query);
	
	const name = preprocess(topic.name);
	const description = preprocess(topic.description);
	const content = preprocess(topic.content);

	const titleScore = CountMathcingWords(name, queryWords) * POINT_WEIGHTS.TITLE;
	const descScore = CountMathcingWords(description, queryWords) * POINT_WEIGHTS.DESCRIPTION;
	const contScore = CountMathcingWords(content, queryWords) * POINT_WEIGHTS.CONTENT;

	// console.log('Name:', name);
	// console.log('Description:', description);
	// console.log('Content:', content);
	// console.log(`  - Title: ${titleScore}`);
	// console.log(`  - Description: ${descScore}`);
	// console.log(`  - Content: ${contScore}`);
	// console.log();

	return titleScore + descScore + contScore;
}

module.exports = function findBestMatch(query = '', type = '') {

	const topics = faqLookup.all(type);

	if (!topics.length) {
		return []
	}

	for (const topic of topics) {
		topic.score = ScoreTopic(topic, query);
	}

	// highest score first
	return topics.sort((a, b) => b.score - a.score).slice(0, 5);
}