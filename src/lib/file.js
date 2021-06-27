const fs = require('fs');
const path = require('path');
const ensureDirExists = require('./utils/ensureDirExists').ensureDirExists;

const write = async (pathToWrite, content) => {
    await fs.writeFileSync(pathToWrite, content);
}

const writeToFile = async (code, solutionsDirPath) => {
    const outputPath = path.resolve(solutionsDirPath, code.question_id + '.' + code.question__title);
    ensureDirExists(outputPath);
};

exports.writeFile = writeToFile;
