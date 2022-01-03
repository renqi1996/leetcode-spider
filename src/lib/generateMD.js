const fs = require('fs');
const path = require('path');
const https = require('https');
const Mustache = require('mustache');

// for 循环生成题解md文件耗时过久
const generateMarkdown = async (outputDir, templatePath) => {
    // 读取 TPL 模板
    const localTplPath = path.resolve(__dirname, './README.tpl');
    let tpl = fs.readFileSync(localTplPath, 'utf-8');
    
    // 读取问题集合
    const problemsData = await fs.readFileSync(path.resolve(__dirname, '../jsons/problems.json'), 'utf-8');
    const list = JSON.parse(problemsData).data.problemsetQuestionList.questions;

    let reg = /^\.?\/?/;
    outputDir = outputDir.replace(reg, '');

    let problemAcNums = {
        easyNum: 0,
        mediumNum: 0,
        hardNum: 0,
    };

    let problemConfigs = [];

    // // 遍历，生成 md 文件
    list.forEach((item, index) => {
        // 统计不同难度题目速度
        switch (item.difficulty) {
            case 'Easy':
                problemAcNums.easyNum++
                break
            case 'Medium':
                problemAcNums.mediumNum++
                break
            case 'Hard':
                problemAcNums.hardNum++
                break;
            default:
                break;
        };

        let solutionLinks = ''; // 本地题解路径
        if (item.status === 'ac') {
            solutionLinks += ` [JavaScript](./${outputDir}/${item.frontendQuestionId}.${item.title}.md)`;
            
        } else {
            solutionLinks += '-'
        }

        problemConfigs.push({
            id: item.frontendQuestionId,
            title: item.title,
            slug: item.titleSlug,
            solutionLinks,
            difficulty: item.difficulty,
            paidOnly: item.paidOnly ? ':heavy_check_mark:' : '',
            status: item.status === 'ac' ? ':heavy_check_mark:' : ':dart:',
            acceptance: `${item.acRate.toFixed(2)}%`
        })
    });
};

module.exports = {
    generateMarkdown: generateMarkdown, // 生成 md 文件，包含 ReadMe 与题解
};
