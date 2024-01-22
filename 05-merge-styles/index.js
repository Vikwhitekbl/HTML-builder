const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'styles');
const bundlePath = path.join(__dirname, 'project-dist', 'bundle.css');

const mergeStyles = (dirPath, bundlePath) => {
    return fs.promises.readdir(dirPath)
    .then((files) => {
        const currentFiles = files.filter((file) => {
            const filePath = path.join(dirPath, file);
            return path.extname(file) === '.css' && fs.promises.stat(filePath)
                .then((inf) => inf.isFile())
                .catch(() => false);
        });

        const filePromises = currentFiles.map((file) => {
            const filePath = path.join(dirPath, file);
            return fs.promises.readFile(filePath, 'utf-8')
        });
        return Promise.all(filePromises);
    })
    .then((arr) => {
        return fs.promises.writeFile(bundlePath, arr.join('\n'), 'utf-8');
    })
    .then(() => {
        console.log('All css files copyed to bundle.css successfully!');
    })
    .catch((err) => {
        console.error(err);
    });
};

mergeStyles(dirPath, bundlePath);

module.exports = {
    mergeStyles
};