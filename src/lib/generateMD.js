const fs = require('fs');
const path = require('path');
let language = require('./language');
const Mustache = require('mustache');

/**
 * 读取并复制 tpl 模板文件
 * @param {string} libTplPath 
 * @param {string} localTplPath 
 * @returns 
 */
const readAndcopyTpl = async function (libTplPath, localTplPath) {
    let tpl;
    // try {
    //     // 获取本地 Tpl 模板文件数据
    //     await fs.statSync(localTplPath);
    //     tpl = await fs.readFileSync(localTplPath, 'utf-8');
    // } catch (e) {
    //     // 当本地无 md 模板文件时，读取 libTpl，并复制到本地 localTpl 中
    //     tpl = await fs.readFileSync(libTplPath, 'utf-8');
    //     await fs.writeFileSync(localTplPath, tpl);
    // }
    tpl = await fs.readFileSync(libTplPath, 'utf-8');
    return tpl;
};

/**
 * 题目 id 格式化
 * @param {number} id 题目 id
 * @returns string
 */
const formatId = (id) => {
    if (id < 10) {
        return '00' + id
    } else if (id < 100) {
        return '0' + id
    } else {
        return '' + id
    }
};

/**
 * 返回题目等级
 * @param {number} level 题目等级
 * @returns string
 */
const leveToStr = (level) => {
    switch (level) {
        case 1: 
            return 'Easy';
        case 2: 
            return 'Medium';
        case 3: 
            return 'Hard';
        default:
            return '';
    };
};

/**
 * 时间格式化处理
 * @param {string} fmt 
 * @returns string
 */
const getTimeStr = (fmt) => {
    let time = new Date();
    let now = {
        'M+': time.getMonth() + 1, // 月份
        'd+': time.getDate(), // 日
        'h+': time.getHours(), // 小时
        'm+': time.getMinutes(), // 分
        's+': time.getSeconds(), // 秒
        'q+': Math.floor((time.getMonth() + 3) / 3), // 季度
        'S': time.getMilliseconds() // 毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (time.getFullYear() + '').substr(4 - RegExp.$1.length));
    for (let k in now) { 
        if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (now[k]) : (('00' + now[k]).substr(('' + now[k]).length)));
        }
    }
    return fmt
};

/**
 * 生成 MD 文件
 * @param {*} resultObj 
 * @param {*} leetcodeNumObj 
 * @param {string} outputDir 
 * @param {string} templatePath 模板文件路径
 */
const generateMarkdown = async (resultList, leetcodeNumObj, outputDir, templatePath) => {
    const localTplPath = path.resolve(process.cwd(), templatePath);
    const libTplPath = path.resolve(__dirname, './README.tpl');
    let tpl = await readAndcopyTpl(libTplPath, localTplPath);

    let reg = /^\.?\/?/;
    outputDir = outputDir.replace(reg, ''); // 输出文件夹处理

    console.log('outputDir: ', outputDir);

    let hardNum = 0; // 对应难度数目
    let easyNum = 0; // 对应难度数目
    let mediumNum = 0; // 对应难度数目

    let solutions = [];

    // 处理数据，生成数组
    resultList.forEach((item, index) => {

        let solutionLinks = ``; // 题解链接
        
        // 拼接得到该题题解本地链接
        solutionLinks += ` (./${outputDir}/${item.stat.question_id}.${item.stat.question__title}/${item.stat.question__title})`

        // console.log('solutionLinks: ', solutionLinks);

        // 统计不同难度题目数目
        let difficulty = leveToStr(item.difficulty.level);
        switch (difficulty) {
            case 'Easy':
                easyNum++
                break
            case 'Medium':
                mediumNum++
                break
            case 'Hard':
                hardNum++
                break;
            default:
                break;
        };

        solutions.push({
            id: item.stat.question_id + '',
            title: item.stat.question__title,
            slug: item.stat.question__article__slug,
            solutionLinks,
            difficulty,
            paidOnly: item.paidOnly ? ':heavy_check_mark:' : '',
            status: item.status === 'ac' ? ':heavy_check_mark:' : '',
            acceptance: (item.stat.total_acs / item.stat.total_submitted * 100).toFixed(2) + '%' ,
        });
    });

    // 升序排列
    solutions.sort((a, b) => {
        return parseInt(a.id, 10) - parseInt(b.id, 10)
    });

    const viewData = {
        language: 'JavaScript',
        total: leetcodeNumObj.total,
        solved: leetcodeNumObj.solved,
        locked: leetcodeNumObj.locked,
        hard: hardNum,
        medium: mediumNum,
        easy: easyNum,
        time: getTimeStr('yyyy-MM-dd hh:mm'),
        solutions: solutions,
    };

    let readmeContent = Mustache.render(tpl, viewData);
    await fs.writeFileSync(path.resolve(process.cwd(), 'README.md'), readmeContent);
};

exports.generateMarkdown = generateMarkdown;
