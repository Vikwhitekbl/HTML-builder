const fs = require('fs');

const dir = './03-files-in-folder/secret-folder';
fs.readdir(dir, (err, files) => {
    if (err) {
        return console.error(err);
    }
    files.forEach((file) => {
        const filePath = `${dir}/${file}`;
        fs.stat(filePath, (err, inf) => {
            if (err) {
                return console.error(err);
            }
            if (inf.isFile()) {
                const fileSize = (inf.size / 1024).toFixed(3);
                console.log(`${file} - ${extention(file)} - ${fileSize}kB`);
            }
        });
    });
});
function extention(file) {
    return file.split('.').pop();
}