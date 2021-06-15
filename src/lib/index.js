const puppeteer = require('puppeteer');
const chalk = require('chalk');
const log = console.log;
const https = require('https');
const fs = require('fs');
const path = require('path');
const ensureDirExists = require('./utils/ensureDirExists');
const generateMarkdown = require('./generateMD').generateMarkdown;

(async () => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.goto('https://leetcode.com/problemset/all/');
    // 爬取当前所有题目数据
    // await https.get('https://leetcode.com/api/problems/all/', res => {
    //     let resData = '';    
    //     res.on('data', data => {
    //         resData += data;
    //     });
    //     res.on('end', () => {
    //         fs.writeFileSync('../jsons/problems.json',resData);
    //     })
    // });
    // 读取数据，并取出其中题目数组
    const data = await fs.readFileSync(path.resolve(__dirname, '../jsons/problems.json'), 'utf-8');
    const lists = JSON.parse(data).stat_status_pairs;
    console.log('lists: ', lists.length);
    const config = {
        template: './README.tpl',
        outputDir: './solutions',
    };
    const leetcodeNumObj = {
        total: JSON.parse(data).num_total,
        solved: JSON.parse(data).num_solved,
        locked: 0,
    };
    let locked = 0;
    lists.forEach((item) => {
        if (item.paid_only) {
            locked ++;
        }
    });
    leetcodeNumObj.locked = locked;
    await generateMarkdown(lists, leetcodeNumObj, config.outputDir, config.template);
    await browser.close();
})();