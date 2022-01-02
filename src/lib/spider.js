const puppeteer = require('puppeteer');
// const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { gql, GraphQLClient, setHeader  } = require('graphql-request');
// const https = require('https');
// require('fetch-cookie/node-fetch')(require('node-fetch'));
// const fetch = require('node-fetch');
// const Promise = require("bluebird");
const async = require('async');
const axios = require('axios');
// const pMap = require('p-map');

let csrftoken;

let cookies = '';

const spider = async () => {
    const browser = await puppeteer.launch({
        // headless: false,
        userDataDir: './user_data' // 使用页面缓存数据
    });
    const page = await browser.newPage();

    // 模拟登陆
    // 判断用户今日是否已经登录
    // 若是，直接打开 leetcode 首页
    // 若否，打开 leetcode/login，并读取 config.json 进行登录
    
    const configData = await fs.readFileSync(path.resolve('./src/jsons/config.json'));
    const config = JSON.parse(configData);

    if (config.ifFirstTime) {
        await page.goto('https://leetcode.com/accounts/login/');
        await page.type('#id_login', config["e-mail"], { delay: 200 });
        await page.type('#id_password', config.password, { delay: 200 });
        await page.keyboard.press('Enter');
        await page.waitForNavigation();
    } else {
        await page.goto('https://leetcode.com/');
    }

    // 获取当前cookie
    const cookie = await page.cookies();
    csrftoken = cookie.find((item) => {
        return item.name === "csrftoken";
    })
    await fs.writeFileSync(path.resolve('./src/jsons/cookies.json'), JSON.stringify(cookie, null, '  '));

    // 爬取题目数据，并储存到本地 jsons/problems.json
    const endPoints = 'https://leetcode.com/graphql';

    const query = gql`\n    query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {\n  problemsetQuestionList: questionList(\n    categorySlug: $categorySlug\n    limit: $limit\n    skip: $skip\n    filters: $filters\n  ) {\n    total: totalNum\n    questions: data {\n      acRate\n      difficulty\n      freqBar\n      frontendQuestionId: questionFrontendId\n      isFavor\n      paidOnly: isPaidOnly\n      status\n      title\n      titleSlug\n      topicTags {\n        name\n        id\n        slug\n      }\n      hasSolution\n      hasVideoSolution\n    }\n  }\n}\n    `;
    const variables = {
        categorySlug: "",
        skip: 0,
        limit: 1906,
        filters: {}
    };

    const client = new GraphQLClient(endPoints);

    cookie.map(item => {
        cookies += `${item.name}=${item.value};`
    });

    client.setHeaders({
        authority: 'leetcode.com',
        'X-CSRFToken': csrftoken.value,
        'Content-Type': 'application/json',
        Referer: 'https://leetcode.com/problemset/all',
        Cookie: cookies,
    })

    const data = await client.rawRequest(query, variables);
    await fs.writeFileSync(path.resolve('./src/jsons/problems.json'), JSON.stringify(data, null, '  '));

    const list = data.data.problemsetQuestionList.questions;

    // 筛选已解答题目，获取对应的题目信息与题解，写入 jsons/solutions.json 中; 对象 key 值为题目 id
    const acList = list.filter((item) => {
        return item.status === 'ac';
    });

    const t = [];

    for (let i = 0; i < acList.length; i++) {
        const content = await fetchProblems(client, acList[i].titleSlug);
        const code = await fetchSolution(`https://leetcode.com/submissions/latest/?qid=${acList[i].frontendQuestionId}&lang=javascript`);
        t.push({
            ...acList[i],
            // content,
            code,
        })
        acList[i] = {
            ...acList[i],
            content,
            code,
        }
    }

    await browser.close;
};

const fetchSolution = (url) => {
    return new Promise((resolve, reject) => {
        axios.get(url, {
            headers: {
                authority: 'leetcode.com',
                'X-CSRFToken': csrftoken.value,
                'Content-Type': 'application/json',
                Referer: 'https://leetcode.com/problemset/all',
                Cookie: cookies,
            }
        })
        .then((result) => {
            resolve(result.data.code);
        }).catch((err) => {
            reject(err);
        });
    });
}

// fetch problem list
const fetchProblems = (client, titleSlug) => {
    return new Promise((resolve, reject) => {
        const query = gql`query questionData($titleSlug: String!) {\n  question(titleSlug: $titleSlug) {\n    questionId\n    questionFrontendId\n    title\n    titleSlug\n    content\n    stats\n    status\n}\n}\n`;
        const variables = {
            titleSlug: titleSlug,
        };
        client.rawRequest(query, variables)
            .then((res) => {
                const content = res.data.question.content;
                // console.log('content: ', content);
                resolve(content)
            }).catch((err) => {
                reject(err);
            });
    });
}

module.exports = {
    spider: spider,
}
