const fs = require('fs');
const path = require('path');

const ensureDirExists = (dirName) => {
    if (fs.existsSync(dirName)) {
        return true
    }
    ensureDirExists(path.dirname(dirName));
    fs.mkdirSync(dirName);
    return true;
};

const ensureFileExists = (fileName) => {
    if (fs.existsSync(fileName)) {
        return true;
    }
    ensureDirExists(path.dirname(fileName));
    fs.writeFileSync(fileName, '');
};

module.exports = {
    ensureDirExists: ensureDirExists,
    ensureFileExists: ensureFileExists,
}
