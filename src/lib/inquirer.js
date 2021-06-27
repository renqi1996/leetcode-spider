const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const ensureFileExists = require('../lib/utils/ensureDirExists').ensureFileExists;

module.exports = {
    initByCLiQA: () => {
        // 判断 jsons/config.json 是否存在; 不存在时，自动创建
        ensureFileExists(path.resolve(__dirname, '../jsons/config.json'));
        const questions =  [
            {
                type: 'confirm',
                name: 'ifFirstTime',
                message: "Is this your first visit today?",
            },
            {
                type: 'confirm',
                name: 'ifUpdate',
                message: "Would you like to update your config?",
                when(answers) {
                    return answers.ifFirstTime;
                },
            },
            {
                type: 'input',
                name: 'e-mail',
                message: "What's your e-mail?",
                when(answers) {
                    return answers.ifUpdate;
                },
                validate(value) {
                    const pass = value.match(
                        /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/i
                    );
                    if (pass) {
                        return true;
                    }
                
                    return 'Please enter a valid e-mail address';
                },
            },
            {
                type: 'password',
                name: 'password',
                message: "What's your password here",
                when(answers) {
                    return answers.ifUpdate;
                },
                validate(value) {
                    if (value) {
                        return true;
                    }
            
                    return 'Please enter a valid password';
                },
            },
        ];
        return questions;
    }
}

