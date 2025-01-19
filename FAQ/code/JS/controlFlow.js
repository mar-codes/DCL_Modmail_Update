module.exports = {
	name: 'Conditionals ? true : false',
	description: 'If-else statments and ternary operators',
	media: 'GuardClause.png',
	content: `
Control flow is probably the very first thing beginners learn, it is impossible to write code without it in some capacity. Control flow is the order in which the computer executes statements in a script. This is done through conditional statements, loops, switches, functions, and more. We're going to keep it simple though. You can find some more control flow topics in the loops section.

**Guard Clauses**
One issue of many beginners is incorrectly using if-else. Take this code for example: \`\`\`js
function Login() {
	if (hasInternet) {
		if (userExists) {
			if (passwordCorrect) {
				if (isAdmin) {
					// do admin stuff
				} else {
					// do user stuff
				}
			} else {
				// incorrect password
			}
		} else {
			// unknown user
		}
	} else {
		// show error
	}
}
\`\`\` As you add more if-else statements, the code becomes harder to read and maintain. If you had say 100 different conditions, you would have to read through all of them and remember the order to understand what is happening. This is where guard clauses come in. You don't have to rewrite your code or change the logic, just invert your checks and \`return\` early. \`\`\`js
function Login() {
	if (!hasInternet) {
		// show error
		return;
	}
	if (!userExists) {
		// unknown user
		return;
	}
	if (!passwordCorrect) {
		// incorrect password
		return;
	}
	if (isAdmin) {
		// do admin stuff
	} else {
		// do user stuff
	}
}
\`\`\` You will notice as a side affect that all the errors move to the top of the code while the happy path always stays at the bottom, the actual login logic. Using this in try-catch blocks is also a good idea as you can catch error first before you respond and tell the user everything is fine!

**Ternary Operator**
The ternary operator is a shorthand way of writing an if-else statement. It is a single line of code that takes a condition and returns one of two values, but it cannot be used to run code. \`\`\`js
const username = 'admin';
const isAdmin = username === 'admin' ? true : false;
console.log(isAdmin); // true
\`\`\` This is the same as writing a regular if statement but it is much shorter and can sometimes be easier to read. \`\`\`js
const username = 'admin';
let isAdmin = false;
if (username === 'admin') {
	isAdmin = true;
}
console.log(isAdmin); // true
\`\`\`

Another good user of ternaries is for return values in function, it turns a 3 line if-else statement into a single line of code. \`\`\`js
function isAdmin(username) {
	// if (username === 'admin') {
	//   return true;
	// } else {
	//   return false;
	// }
	return username === 'admin' ? true : false;
}
console.log(isAdmin('admin')); // true
console.log(isAdmin('bob')); // false
\`\`\`
`
}