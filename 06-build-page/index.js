const fs = require('fs');
const path = require('path');

const templateFilePath = path.join(__dirname, 'template.html');
const tags = [];
const componentsDirPath = './components';
let newTemplate = '';
const projectDistDirPath = path.join(__dirname, 'project-dist');
const htmlDirPath = path.join(projectDistDirPath, 'index.html');

const copyDir = async (dirPath, newDirPath) => {
    try {
        await fs.promises.mkdir(newDirPath, { recursive: true });

        const files = await fs.promises.readdir(dirPath);
        const promises = files.map(async (file) => {
            const filePath = path.join(dirPath, file);
            const newFilePath = path.join(newDirPath, file);

            const inf = await fs.promises.lstat(filePath);
            if (inf.isFile()) {
                await fs.promises.copyFile(filePath, newFilePath);
            }   else if (inf.isDirectory()) {
                await copyDir(filePath, newFilePath);
            }
        });
        await Promise.all(promises);

        console.log('All successfully copied.');
    }   catch (err) {
        console.error(err);
    }   finally {
        process.exit(0);
    }
};

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

const replaceTags = (templateContent) => {
    const tagExp = /{{(.*?)}}/g;
    let match;
    newTemplate = templateContent;

    const replaceTag = () => {
        if((match = tagExp.exec(templateContent)) !== null) {
            const tag = match[1];
            const componentsFilePath = path.join(__dirname, componentsDirPath, `${tag}.html`);

            fs.promises.readFile(componentsFilePath, 'utf-8')
                .then((componentContent) => {
                    newTemplate = newTemplate.replace(`{{${tag}}}`, componentContent);
                    replaceTag();
                })
                .catch((err) => {
                    console.error(err);
                });
        }   else {
            fs.promises.writeFile(htmlDirPath, newTemplate, 'utf-8')
                .catch((err) => {
                    console.error(err);
                });
        }
    };
    replaceTag();
};

fs.promises
    .access(projectDistDirPath)
    .catch((err) => {
        if (err.code === 'ENOENT') {
            return fs.promises.mkdir(projectDistDirPath, { recursive: true });
        }   else {
            throw err;
        }
    })
    .then(() => {
        return fs.promises.readFile(templateFilePath, 'utf-8')
    })
    .then(replaceTags)
    .then(() => {
        const stylesDirPath = path.join(__dirname, 'styles');
        const newStylesPath = path.join(projectDistDirPath, 'style.css');
        return mergeStyles(stylesDirPath, newStylesPath);
    })
    .then(() => {
        const assetsDirPath = path.join(__dirname, 'assets');
        const assetsNewDirPath = path.join(projectDistDirPath, 'assets');
        return copyDir(assetsDirPath, assetsNewDirPath);
    })
    .catch((err) => {
        console.error(err);
        throw err;
    });