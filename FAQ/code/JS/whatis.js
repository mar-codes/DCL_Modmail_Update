module.exports = {
	name: 'What is JavaScript?',
	description: 'A brief introduction to JavaScript',
	content: `
JavaScript at it's core is an object-oriented programming language that is used to make web pages interactive. It is among the easiest for beginner developers (second to python) but it extremely extensive and powerful for experienced developers, wielding things like protype chaining, closures, control overy garbage collection, and more.

JavaScript syntax is very easy to understand and can be compared to python in some aspects. You define a variable as \`let x = 5\` and the JS engine will automatically determine the type of the variable. You can also define a variable as \`const x = 5\` to make it immutable or permanent in value. Semicolons are optional in JavaScript but it is recommended to use them to avoid any issues. \`\`\`js
let x = 5;
const y = 10; // const = cannot be changed
console.log(x + y); // 15

x = 10;
console.log(x + y); // 20

y = 5; // Error: Assignment to constant variable
\`\`\`

Naturally your next step would be functions but those are pretty simple. You can define a function as \`\`\`js
function add(x, y) {
	return x + y;
}
add(5, 10); // 15
\`\`\` The \`return\` statement is used to return a value from a function. If you don't use it, the function will return \`undefined\` which is frankly quite useless. The \`return\` statement will also stop the function from executing any further code and is very useful for error handling or early exits. \`\`\`js
function Login(username, password) {
	if (!ConnectToInternet) return;
	// do stuff
}
\`\`\`

JavaScript is a very powerful language and is used in nearly every single website on the internet. It is also used in many server-side applications with Node.js and even in mobile applications with React Native. JavaScript is a must-learn language for any developer and is a great starting point for beginners.
`
}