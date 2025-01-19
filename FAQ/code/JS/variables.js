module.exports = {
	name: 'Variables and Constants',
	description: 'Introduction to different variables in JavaScript',
	content: `
Variables are the core of every single language in existence. They are used to store data that can be accessed and manipulated throughout the runtime. In JavaScript, there are three ways to declare a variable: \`var\`, \`let\`, and \`const\`. Each of these has its own use cases and rules but they all share the same goal to store data.

**Const**
This is probably the easiest to unerstand of the three. Const is short for constant and it does exactly what you think it does: You set a constant variable and you cannot change it. This is generally the goto for most people as it is good for documentation that "this value will never change". \`\`\`js
const x = 5;
x = 6; // Error: Assignment to constant variable.
\`\`\`

**Let**
Let is the first way many people learn of variables in JS. Values can be manipulated and modified over and over again. However it only exists within that scope (we will get to that later). \`\`\`js
let x = 5;
x = 6;

function test() {
	let x = 7;
	console.log(x); // 7
	// block scopes take priority so this x is different from the one above
}

// The previous x exists only within the function so now we are back to the original value
console.log(x); // 6
\`\`\`

**Var**
Var is the original way to declare variables in JS. It is very similar to let but it has a few key differences. The main one is that it is not block scoped. This means that the variable exists throughout the entire function. The other big thing is you can redefine it many times withoug fail. \`\`\`js
const x = 5;
x = 6; // Error: Assignment to constant variable.

let y = 5;
let y = 6; // Error: Identifier 'y' has already been declared.

var z = 5;
var z = 6; // Z is now 6

try {
	// Even being defined in here it now exists globally, unlike let and const
	var value = 100;
} catch (e) {
	console.log('Error:', e);
}

console.log(value); // 100 
\`\`\`
`
}