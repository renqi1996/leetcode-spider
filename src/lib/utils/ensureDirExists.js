const fs = require('fs');
const path = require('path');

const ensureDirExists = (dirName) => {
    if (fs.existsSync(dirname)) {
        return true
    }
    ensureDirExists(path.dirname(dirName));
    fs.mkdirSync(dirName);
};

exports.ensureDirExists = ensureDirExists;