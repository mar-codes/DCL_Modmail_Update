module.exports = {
	name: 'Switch Statements',
	description: 'Comparing many values at once',
	content: `
The switch statement is a way to write multiple if-else statements in a more readable way. However it can only be used for strict equalities, not ranges. This does have it's benifits but many people use them incorrectly. In reality they are slower than an if-else chain. Take this code as an example. \`\`\`js
const day = 1; // day of the week
switch (day) {
	case 0:
		console.log('Sunday');
		break;
	case 1:
		console.log('Monday');
		break;
	case 2:
		console.log('Tuesday');
		break;
	// more options lol
	default:
		console.log('Unknown day');
}
\`\`\` A switch statement is generally faster than writing multiple if-else statements but it is not always the best choice. If you have a lot of conditions, it is better to use a map or object to store the values and then check if the key exists. You can rewrite this entire switch as just an array for the same results and much faster lookup! \`\`\`js
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const day = 1;
const name = days[day] // lookup by index
if (name) {
	console.log(name);
} else { // Index doesn't exist, either negative or bigger than the array
 	console.log('Unknown day');
}
\`\`\`	
Another thing that can happen is a fall-through. This is when you forget to add a \`break\` statement and it will continue to the next case. This is generally not a good idea as it can lead to unexpected results, but it does have its uses if multiple cases should run the same code. \`\`\`js
const day = 1;
switch (day) {
	case 0: // 0 and 6 will print 'Weekend'
	case 6:
		console.log('Weekend');
		break; // forgetting this break will print "Weekend" and "Weekday"
	case 1:
	case 2: // Anything between 1 and 5 will print 'Weekday'
	case 3:
	case 4:
	case 5:
		console.log('Weekday');
		break;
	default:
		console.log('Unknown day');
}
\`\`\`
`
}