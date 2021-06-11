const puppeteer = require('puppeteer');
const chalk = require('chalk');
const log = console.log;
const https = require('https');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.goto('https://leetcode.com/problemset/all/');
    // 爬取当前所有题目数据
    await https.get('https://leetcode.com/api/problems/all/', res => {
        let resData = '';    
        res.on('data', data => {
            resData += data;
        });
        res.on('end', () => {
            fs.writeFileSync('../jsons/problems.json',resData);
        })
    });
    await browser.close();
})();