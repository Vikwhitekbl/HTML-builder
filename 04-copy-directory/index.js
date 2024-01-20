const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'files');
const newDirPath = path.join(__dirname, 'files-copy');

fs.promises.access(newDirPath)
    .catch((err) => {
        if (err.code === 'ENOENT') {
            return fs.promises.mkdir(newDirPath, { recursive: true });
        }   else {
            throw err;
        }
    })
    .then(() => {
        return fs.promises.readdir(dirPath);
    })
    .then((files) => {
        let filesCount = 0;

        const copyFile = (file) => {
            const filePath = path.join(dirPath, file);
            const newFilePath = path.join(newDirPath, file);
    
            fs.promises.readFile(filePath)
            .then((data) => {
                return fs.promises.writeFile(newFilePath, data);
            })
            .then(() => {
                filesCount++;
                if (filesCount === files.length) {
                    console.log('All files successfully copied.');
                }
            })
            .catch((err) => {
                console.error(err);
            });
        };
        files.forEach(copyFile);
        
        fs.watch(dirPath, (event, filename) => {
            if (event === 'rename') {
                if (filename) {
                    copyFile(filename);
                }
            }   else if (event === 'change') {
                copyFile(filename);
            }
        });
    })
    .catch((err) => {
        console.error(err);
    });