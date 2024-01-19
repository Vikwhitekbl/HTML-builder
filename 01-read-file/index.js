const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'text.txt');
const readStream = fs.createReadStream(dir, { encoding: 'utf-8' });

readStream.pipe(process.stdout);