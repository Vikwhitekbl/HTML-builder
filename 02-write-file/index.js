const fs = require('fs');
const readline = require('readline');

const dir = './02-write-file/text.txt';
const writeStream = fs.createWriteStream(dir, { flags: 'a' });

console.log(`Hello! Please enter the text you want to save and press "Enter".\nTo exit press Ctrl + C or type "exit"!`);

const listner = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
listner.on('line', (input) => {
    if (input === 'exit') {
        listner.close();
        writeStream.end();
    } else {
        writeStream.write(`${input}\n`);
    }
});

listner.on('close', () => {
    console.log('Your changes have been saved. Well done!');
});