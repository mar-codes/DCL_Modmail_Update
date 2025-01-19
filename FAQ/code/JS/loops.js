module.exports = {
	name: 'Loops Loops Loops ...',
	description: 'For, while, and do-while loops',
	content: `
Loops are very often confusing for new developers. They are a way to repeat a block of code multiple times with only a couple of lines. There are three types of loops in JavaScript: for, for-of, and while. Each has its own use case and can be used in different situations.

**For Loop**
There are actually two types of for loops, the regular for loop and the for-of loop. The regular for loop is used when you know how many times you want to loop. The for-of loop is used when you want to loop over an array or object. Here is an example of a regular for loop: \`\`\`js
for (let i = 0; i < 10; i++) {
	console.log(i);
}
// output: 0 1 2 3 4 5 6 7 8 9
\`\`\` This loop will run 10 times and log the value of \`i\` to the console. The for-of loop is used to loop over an array or object. Here is an example of a for-of loop: \`\`\`js
const arr = [1, 2, 3, 4, 5];
for (const item of arr) {
	console.log(item);
}
// output: 1 2 3 4 5
\`\`\` This loop will run 5 times and log each value in the array to the console. For-of is often easier to read for syntax and especially when you get to cases you don't know the length of the array, or if you need to loop over something that isn't an array like an object or map.

**While Loop**
While loops are for loops without an end, taking this code as an example it will run forever! \`\`\`js
while (true) {
	console.log('This will run forever!');
}
\`\`\` While loops are perfect if you need easy recursion or if you have a more dynamic loop that doesn't have a set end. Just be careful as you can easily create an infinite loop and crash your application!

What's cool about for loops is they are just while loops with a little extra syntax. You can rewrite the for loop from above as a while loop. This will run the same as the loop above but it's discouraged as it is way harder to read and maintain. \`\`\`js
let i = 0;
while (true) {
	if (i >= 10) {
		break;
	}
	console.log(i);
	i++;
}
\`\`\`
`
}