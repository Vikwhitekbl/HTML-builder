const fs = require('fs');
const path = require('path');
const { mergeStyles } = require('../05-merge-styles/index.js');
const { copyDir } = require('../04-copy-directory/index.js');

const templateFilePath = path.join(__dirname, 'template.html');
const tags = [];
const componentsDirPath = './components';
let newTemplate = '';
const projectDistDirPath = './project-dist';
const htmlDirPath = path.join(projectDistDirPath, 'index.html');

fs.promises.readFile(templateFilePath, 'utf-8')
    .then((file) => {
        const tagExp = /{{(.*?)}}/g;
        let match;
        while ((match = tagExp.exec(file)) !== null) {
            tags.push(match[1]);
        }
        return tags;
    })
    .then((tags) => {
        return tags.reduce((promise, tag) => {
            return promise.then(() => {
                const componentsFilePath = path.join(__dirname, `${componentsDirPath}\\${tag}.html`);
                return fs.promises.readFile(componentsFilePath, 'utf-8')
                    .then((componentContent) => {   
                        newTemplate += componentContent.replace(`{{${tag}}}`, '');
                    });
            });
        }, Promise.resolve())
    })
    .then(() => {
        return fs.promises.access(projectDistDirPath)
            .catch((err) => {
                if (err.code === 'ENOENT') {
                    return fs.promises.mkdir(projectDistDirPath, { recursive: true });
                }   else {
                    throw err;
                }
            });
    })
    .then(() => {
        return fs.promises.writeFile(htmlDirPath, newTemplate, 'utf-8');
    })
    .then(() => {
        const stylesDirPath = path.join(__dirname, 'styles');
        const newStylesPath = path.join(projectDistDirPath, 'style.css');
        return mergeStyles(stylesDirPath, newStylesPath);
    })
    .then(() => {
        const assetsDirPath = path.join(__dirname, 'assets');
        const assetsNewDirPath = path.join(__dirname, projectDistDirPath, 'assets');
        return copyDir(assetsDirPath, assetsNewDirPath);
    })
    .catch((err) => {
        console.error(err);
    });