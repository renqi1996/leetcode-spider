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

module.exports = {
    formatTime: getTimeStr,
}
