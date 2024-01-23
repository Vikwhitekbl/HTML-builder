const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'files');
const newDirPath = path.join(__dirname, 'files-copy');

const copyDir = async () => {
    try {
        await fs.promises.mkdir(newDirPath, { recursive: true });

        const files = await fs.promises.readdir(dirPath);
        const copiedList = [];

        for (let file of files) {
            const filePath = path.join(dirPath, file);
            const newFilePath = path.join(newDirPath, file);

            const inf = await fs.promises.lstat(filePath);
            if (inf.isFile()) {
                await fs.promises.copyFile(filePath, newFilePath);
                copiedList.push(file.toLowerCase());
            }
        }
        const newCopiedList = copiedList.map((file) => file.toLowerCase());
        const copiedFiles = await fs.promises.readdir(newDirPath);

        for (let file of copiedFiles) {
            const fileName = file.toLowerCase();
            if (!newCopiedList.includes(fileName)) {
                const newFilePath = path.join(newDirPath, file);
                await fs.promises.unlink(newFilePath);
            }
        }
        console.log('All files successfully copied.');
    }   catch (err) {
        console.error(err);
    }   finally {
        process.exit(0);
    }
};

copyDir();