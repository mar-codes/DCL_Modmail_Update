module.exports = {
	name: 'JavaScript Functions',
	description: 'Introduction to functions in JavaScript',
	content: `
Functions can come a variety of forms in JavaScript. Javascript however treats functions uniquely to every other language. Functions are first class citizens in JavaScript. This means that they can be treated like any other variable, be passed as arguments, or event returned from other functions. This is a powerful feature that allows for a lot of flexibility in the language but only if used properly. Let me show you.

All of these functions do the exact same purpose. The first is a normal function declaration, the second is a function expression, and the third is an arrow function. They all return the sum of two number but differ in how they are written. Internally they all get converted to the last one in some capacity.\`\`\`js
function add(x, y) {
	return x + y;
}

const add = function(x, y) {
	return x + y;
}

const add = (x, y) => x + y;
\`\`\`

So why should you care? Well you shouldn't really, there are only a couple extremely rare cases that it does. For all intensive purposes you should use \`function MyFunc(...) { ... }\` whenever you can.

**Function Args**
Functions can take any number of arguments, even if they are not defined. This is a powerful feature that allows for a lot of flexibility in your code. You can also define default values for arguments that are not passed in. \`\`\`js
function add(x = 0, y = 0) {
	return x + y;
}

add(5); // 5
add(5, 6); // 11
add(); // 0

// this is using a feature called destructuring
// No matter how many arguments are passed in, they are all stored in the args array
// (1, 2, 3, 4, 5) => [1, 2, 3, 4, 5]
function add(...args) {
	let total = 0;
	// loop through each of the numbers
	for (const arg of args) {
		total += arg;
	}
	return total;
}

add(1, 2, 3, 4, 5); // 15
add(14, 28, 19); // 61
add(5); // 5
add(); // 0
\`\`\`
`
}