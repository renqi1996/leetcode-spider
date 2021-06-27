const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const figlet = require('figlet');
const { clear } = require('console');
const log = console.log;
const initByCLiQA = require('./inquirer').initByCLiQA;
const formatTime = require('./utils/tools').formatTime;
const https = require('https');
const puppeteer = require('puppeteer');
const ora = require('ora');
const spider = require('./spider').spider;
const generateMarkdown = require('./generateMD').generateMarkdown;

const questions = initByCLiQA();

async function main () {
  // 清空控制台
  await clear();

  // 打印 logo
  await log(chalk.yellowBright(figlet.textSync('LeetCode Spider', { horizontalLayout: 'full' })));

  const questions = initByCLiQA();

  let answers = await inquirer.prompt(questions);

  // 更新 config.json
  if (answers.ifUpdate) {
    const updateTime = formatTime('yyyy-MM-dd hh:mm:ss');

    answers = {
      ...answers,
      ...updateTime
    };

    await fs.writeFileSync(path.resolve('./src/jsons/config.json'), JSON.stringify(answers, null, '  '));
  }

  // 爬取所有题目数据，并写入 src/jsons/problems
  await spider();

  // 生成 README.md 并生成题解 md 文件
  await generateMarkdown('./solutions', './README.tpl');

  process.exit();
}

main();
