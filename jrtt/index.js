/*

1元现金速撸
 
下载【今日头条极速版】
      ↓
进入"任务"
      ↓
填邀请码【1996253918】

即可立即提现1元到支付宝，秒到账！点击下载 
https://a2.app.qq.com/o/simple.jsp?pkgname=com.ss.android.article.lite&ckey=CK1431889492477


iepngs
签到、首页宝箱、阅读、睡觉、游戏

*/

// ====================================
// #今日头条签到获取ck
// 1.阅读文章弹出金币
// 2.我的 > 签到
// 3.游戏
// http-request ^https:\/\/is\.snssdk\.com\/score_task\/v1\/task\/(sign_in|get_read_bonus) script-path=https://raw.githubusercontent.com/iepngs/Script/master/jrtt/index.js,requires-body=true,tag=今日头条极速版-任务
// http-request ^https:\/\/i\.snssdk\.com\/ttgame\/game_farm\/home_info script-path=https://raw.githubusercontent.com/iepngs/Script/master/jrtt/index.js,requires-body=true,tag=今日头条极速版-游戏
// ====================================
// #今日头条定时任务
// Warning：定时时间不要动
// cron "*/2 8,9,12,21 * * *" script-path=https://raw.githubusercontent.com/iepngs/Script/master/jrtt/index.js,tag=今日头条极速版
// ====================================
// MITM=i.snssdk.com,is.snssdk.com
// ====================================

const $hammer=(()=>{const isRequest="undefined"!=typeof $request,isSurge="undefined"!=typeof $httpClient,isQuanX="undefined"!=typeof $task;const log=(...n)=>{for(let i in n)console.log(n[i])};const alert=(title,body="",subtitle="",options={})=>{let link=null;switch(typeof options){case"string":link=isQuanX?{"open-url":options}:options;break;case"object":if(["null","{}"].indexOf(JSON.stringify(options))==-1){link=isQuanX?options:options["open-url"];break}default:link=isQuanX?{}:""}if(isSurge)return $notification.post(title,subtitle,body,link);if(isQuanX)return $notify(title,subtitle,body,link);log("==============📣系统通知📣==============");log("title:",title,"subtitle:",subtitle,"body:",body,"link:",link)};const read=key=>{if(isSurge)return $persistentStore.read(key);if(isQuanX)return $prefs.valueForKey(key)};const write=(val,key)=>{if(isSurge)return $persistentStore.write(val,key);if(isQuanX)return $prefs.setValueForKey(val,key)};const request=(method,params,callback)=>{let options={};if(typeof params=="string"){options.url=params}else{options.url=params.url;if(typeof params=="object"){params.headers&&(options.headers=params.headers);params.body&&(options.body=params.body)}}method=method.toUpperCase();const writeRequestErrorLog=function(m,u){return err=>{log(`\n===request error-s--\n`);log(`${m} ${u}`,err);log(`\n===request error-e--\n`)}}(method,options.url);if(isSurge){const _runner=method=="GET"?$httpClient.get:$httpClient.post;return _runner(options,(error,response,body)=>{if(error==null||error==""){response.body=body;callback("",body,response)}else{writeRequestErrorLog(error);callback(error,"",response)}})}if(isQuanX){options.method=method;$task.fetch(options).then(response=>{response.status=response.statusCode;delete response.statusCode;callback("",response.body,response)},reason=>{writeRequestErrorLog(reason.error);response.status=response.statusCode;delete response.statusCode;callback(reason.error,"",response)})}};const done=(value={})=>{if(isQuanX)return isRequest?$done(value):null;if(isSurge)return isRequest?$done(value):$done()};const pad=(c="~",s=false,l=15)=>s?console.log(c.padEnd(l,c)):c.padEnd(l,c);return{isRequest,isSurge,isQuanX,log,alert,read,write,request,done,pad}})();
function date(fmt, dateObject = '') { dateObject = dateObject ? (dateObject == "object" ? dateObject : (new Date(+dateObject.toString().padEnd(13, "0").substr(0, 13)))) : new Date(); let ret; const opt = { "Y": dateObject.getFullYear().toString(), "m": (dateObject.getMonth() + 1).toString(), "d": dateObject.getDate().toString(), "H": dateObject.getHours().toString(), "i": dateObject.getMinutes().toString(), "s": dateObject.getSeconds().toString() }; for (let k in opt) { ret = new RegExp("(" + k + ")").exec(fmt); if (ret) { fmt = fmt.replace(ret[1], ret[1].length == 1 ? opt[k].padStart(2, "0") : opt[k]) }; }; return fmt; }
function randomNumber(start, end, fixed = 0) {const differ = end - start, random = Math.random();return (start + differ * random).toFixed(fixed);};

//====================================
const level = 2;//开启日志级别 0:关闭 1:响应body 2:响应所有数据
//++++++++++++++++++++++++++++++++-

//++++++++++++++++++++++++++++++++++++
const Protagonist = "今日头条极速版";
const host1 = "https://i.snssdk.com";
const host2 = "https://is.snssdk.com";
let taskQS = "", taskHeaders = "";
let readQS = "", readHeaders = "";
let farmQS = "", farmHeaders = "";
const taskCookieKey = "jrttTaskCookie";
const readCookieKey = "jrttReadCookie";
const farmCookieKey = "jrttFarmCookie";
const hour = +(new Date()).getHours();
let tips = "";
const log = (section, response, data) => {
    level && $hammer.log(`${Protagonist} ${section} response:`, level == 1 ? response : data);
}

//++++++++++++++++++++++++++++++++++++
function GetCookie() {
    let suffix = /\/([^\/]+(?!.*\/))/.exec($request.url.replace("/?", "?"))[1].split("?");
    const uri = suffix.shift();
    const queryString = suffix.length ? suffix.join("?"): "";
    $hammer.log(`${Protagonist} GetCookie(${uri ? uri : $request.url}).`);
    let cookieVal = {
        qs: queryString,
        headers: {
            "User-Agent": $request.headers["User-Agent"]
        }
    }
    const copyHeaders = header => (cookieVal.headers[header] = $request.headers[header]);
    let category = "";
    switch (uri) {
        case "sign_in":
            // get https://is.snssdk.com/score_task/v1/task/sign_in
            category = "签到";
        case "get_read_bonus":
            // get https://is.snssdk.com/score_task/v1/task/get_read_bonus
            category = "阅读";
            copyHeaders("x-Tt-Token");
            $hammer.write(JSON.stringify(cookieVal), uri == "sign_in" ? taskCookieKey : readCookieKey);
            break;
        case "home_info":
            // get https://i.snssdk.com/ttgame/game_farm/home_info
            category = "游戏";
            ["Cookie", "Referer"].forEach(copyHeaders);
            $hammer.write(JSON.stringify(cookieVal), farmCookieKey);
            break;
        default:
            return $hammer.done();
    }
    $hammer.alert(Protagonist, `${category}Cookie已写入`);
    $hammer.done();
}

//++++++++++++++++++++++++++++++++
async function main() {
    if(await checkTaskCookie()){
        $hammer.log(`${Protagonist} run task.`);
        $hammer.log(`${Protagonist} run task.daliySignDetail`);
        await daliySignDetail();
        // $hammer.log(`${Protagonist} run task.viewSleepStatus`);
        // await viewSleepStatus();
        // $hammer.log(`${Protagonist} run task.openIndexBox`);
        // await openIndexBox();
    }
    $hammer.log(`${Protagonist} run read.`);
    await checkReadCookie() && setTimeout(async () => {
        await reading();
    }, randomNumber(3, 61) * 1000);
    
    
    $hammer.alert(Protagonist, tips);
    return $hammer.done();


    $hammer.log(`${Protagonist} run farm.1`);
    if(await checkFarmCookie()){
        $hammer.log(`${Protagonist} run farm.2`);
        $hammer.log(`${Protagonist} run task.getGameSign`);
        await getGameSign();
        $hammer.log(`${Protagonist} run task.open_box`);
        await open_box();
        $hammer.log(`${Protagonist} run task.land_water`);
        await land_water();
        $hammer.log(`${Protagonist} run task.daily_task`);
        await daily_task();
        $hammer.log(`${Protagonist} run task.game_farm_list`);
        await game_farm_list();
    }
    $hammer.alert(Protagonist, tips);
    return $hammer.done();


    // */2 8,9,12,21 * * *
    const minute = (new Date()).getMinutes();
    const onece = hour == 8 && minute > 57;
    if(await checkTaskCookie()){
        $hammer.log(`${Protagonist} run task.`);
        if(onece){
            await daliySignDetail();
            await viewSleepStatus();
        }
        if(minute < 3){
            await openIndexBox();
        }
    }
    if([9,12,21].indexOf(hour) > -1){
        // 每篇文章阅读时长：63s-121s
        await checkReadCookie() && setTimeout(async () => {
            await reading();
        }, randomNumber(3, 61) * 1000);
    }
    if(await checkFarmCookie()){
        $hammer.log(`${Protagonist} run farm.`);
        if(onece){
            await getGameSign();
            await open_box();
            await land_water();
            await daily_task();
        }
        if([9,8,12,21].indexOf(hour) > 0 && minute < 3){
            await game_farm_list();
        }
    }
    $hammer.alert(Protagonist, tips);
    $hammer.done();
}

//++++++++++++++++++++++++++++++++++++
function checkTaskCookie(){
    return new Promise(resolve => {
        let taskCookieVal = $hammer.read(taskCookieKey);
        taskCookieVal = taskCookieVal ? JSON.parse(taskCookieVal) : "";
        if(!taskCookieVal){
            $hammer.alert(Protagonist, "任务Cookie不存在");
            return resolve(false);
        }
        taskQS = taskCookieVal.qs;
        taskCookieVal.headers["sdk-version"] = 2;
        taskHeaders = taskCookieVal.headers;
        resolve(true);
    })
}

function checkReadCookie(){
    return new Promise(resolve => {
        let readCookieVal = $hammer.read(readCookieKey);
        readCookieVal = readCookieVal ? JSON.parse(readCookieVal) : "";
        if(!readCookieVal){
            $hammer.log(`${$hammer.pad()}\n${Protagonist} 阅读Cookie不存在\n${$hammer.pad()}`);
            return resolve(false);
        }
        readQS = readCookieVal.qs;
        readCookieVal.headers["sdk-version"] = 2;
        readHeaders = readCookieVal.headers;
        resolve(true);
    })
}

function checkFarmCookie(){
    return new Promise(resolve => {
        let farmCookieVal = $hammer.read(farmCookieKey);
        farmCookieVal = farmCookieVal ? JSON.parse(farmCookieVal) : "";
        if(!farmCookieVal){
            $hammer.alert(Protagonist, "游戏Cookie不存在");
            return resolve(false);
        }
        farmQS = farmCookieVal.qs;
        farmCookieVal.headers["Content-Type"] = "applicationo/json";
        farmHeaders = farmCookieVal.headers;
        resolve(true);
    })
}

//++++++++++++++++++++++++++++++++++++
// 任务options
const initTaskOptions = (uri, host=1) => {
    let options = uri == "task/get_read_bonus" ? {
        url: `${host == 1 ? host1 : host2}/score_task/v1/${uri}/?${readQS}`,
        headers: readHeaders
    } : {
        url: `${host == 1 ? host1 : host2}/score_task/v1/${uri}/?${taskQS}`,
        headers: taskHeaders
    }
    if(!uri.indexOf("sleep")){
        options.url.replace("/?", "/?request_from=web&");
    }
    return options;
};

// 游戏options
const farmOptions = param => {
    let paramArray = param.split("&");
    const uri = paramArray.shift();
    return {
        url: `${host2}/ttgame/game_farm/${uri}?${farmQS}${paramArray.length ? "&" + paramArray.join("&") : ""}`,
        headers: farmHeaders
    };
};

//++++++++++++++++++++++++++++++++++++
// 签到状态
function daliySignDetail(){
    return new Promise(resolve => {
        const options = initTaskOptions("task/sign_in/detail", 2);

        $hammer.log("daliySignDetail:", options);
        return resolve(true);

        $hammer.request('get', options, async (error, response, data) => {
            if(error){
                $hammer.log(`${Protagonist} 签到状态 请求异常:\n${error}`, data);
                return resolve(false);
            }
            log("签到状态", response, data);
            const obj = JSON.parse(response);
            tips += "\n[签到状态] ";
            if(obj.err_no){
                tips += obj.err_tips;
                return resolve(false);
            }
            tips += `已连签:${obj.data.days}天`;
            obj.data.today_signed || await daliySign();
            resolve(true);
        })
    })
}

// 每日签到
function daliySign() {
    return new Promise(resolve => {
        const options = initTaskOptions("task/sign_in", 2);
        $hammer.request('post', options, (error, response, data) => {
            if(error){
                $hammer.log(`${Protagonist} 每日签到 请求异常:\n${error}`, data);
                return resolve(false);
            }
            log("签到", response, data);
            const obj = JSON.parse(response);
            const result = obj.err_no == 0 ? `金币 +${obj.data.score_amount}` : `失败: ${obj.err_tips}`;
            tips += `\n[每日签到] ${result}`;
            setTimeout(()=>{
                resolve(true);
            }, 1200);
        })
    })
}

//++++++++++++++++++++++++++++++++++++
// 首页宝箱
function openIndexBox() {
    return new Promise(resolve => {
        const options = initTaskOptions("task/open_treasure_box", 2);
        $hammer.request('post', options, (error, response, data) => {
            if(error){
                $hammer.log(`${Protagonist} 首页宝箱 请求异常:\n${error}`, data);
                return resolve(false);
            }
            log("首页宝箱", response, data);
            const obj = JSON.parse(response);
            const result = obj.err_no == 0 ? `金币:+${obj.data.score_amount}, 下次时间: ${date("H点i分s秒", obj.data.next_treasure_time)}` : obj.err_tips;
            tips += `\n[首页宝箱] ${result}`;
            resolve(true);
        })
    })
}

//++++++++++++++++++++++++++++++++++++
// 阅读
function reading(){
    return new Promise(resolve => {
        let options = initTaskOptions("task/get_read_bonus", 2);
        const partten = /group_id=(\d+)/;
        let article = partten.exec(options.url);
        article = article ? article[1] : "";
        if(!article){
            $hammer.log(`${Protagonist} 阅读中止，cookie异常`);
            return resolve(false);
        }
        article.replace(/\d{4}$/, (Math.random()*1e4).toFixed(0).padStart(4,"0"));
        options.url = options.url.replace(partten, `group_id=${article}`);
        
        $hammer.log("阅读 request header：", options);
        return resolve(true);

        $hammer.request('get', options, (error, response, data) => {
            if(error){
                $hammer.log(`${Protagonist} 阅读奖励 请求异常:\n${error}`, data);
                return resolve(false);
            }
            log("阅读奖励", response, data);
            const obj = JSON.parse(response);
            const result = obj.err_no == 0 ? `金币:+${obj.data.score_received}, 今日已读: ${obj.data.done_times}篇` : obj.err_tips;
            tips += `\n[阅读奖励] ${result}`;
            resolve(true);
        })
    })
}

//++++++++++++++++++++++++++++++++++++
// 查询睡觉任务状态
function viewSleepStatus() {
    return new Promise(resolve => {
        const options = initTaskOptions("sleep/status");
        $hammer.request('get', options, async (error, response, data) => {
            if(error){
                $hammer.log(`${Protagonist} 睡觉状态查询 请求异常:\n${error}`, data);
                return resolve(false);
            }
            log("睡觉状态查询", response, data);
            const obj = JSON.parse(response);
            if (obj.err_no != 0) {
                $hammer.log(`${Protagonist} 睡觉状态查询异常:\n${obj.err_tips}`);
                return resolve(false);
            }
            // let amount = (obj.data.sleep_last_time / obj.data.sleep_coin_speed).toFixed(0) * sleep_coin_per_interval;
            // amount = amount > 2665 ? 2665 : amount;
            tips += `\n[睡觉待收金币] ${obj.data.sleep_unexchanged_score}\n[当前睡觉状态] `;
            if(obj.data.sleeping){
                tips += `已昏睡${obj.data.sleep_last_time}s`;
                if(hour > 8 && hour < 20){
                    await stopSleep();
                }
                await collectSleepCoin(obj.data.sleep_unexchanged_score);
                return resolve(true);
            }
            tips += `睁着眼睛的没在睡`;
            (hour > 7 && hour < 3) && await startSleep();
            resolve(true);
        })
    })
}

// 开始睡觉
function startSleep() {
    return new Promise(resolve => {
        let options = initTaskOptions("sleep/start");
        options.body = JSON.stringify({task_id: 145});
        $hammer.request('post', options, (error, response, data) => {
            if(error){
                $hammer.log(`${Protagonist} 开启睡觉 请求异常:\n${error}`, data);
                return resolve(false);
            }
            log("开启睡觉", response, data);
            let obj = JSON.parse(response);
            const result = obj.err_no == 0 ? (obj.data.sleeping ? "成功" : "失败") : obj.err_tips;
            tips += `\n[开启睡觉状态] ${result}`;
            resolve(true);
        })
    })
}

// 结束睡觉
function stopSleep() {
    return new Promise(resolve => {
        let options = initTaskOptions("sleep/stop");
        options.body = jrtt_sleepbd;
        $hammer.request('post', options, (error, response, data) => {
            if(error){
                $hammer.log(`${Protagonist} 结束睡觉 请求异常:\n${error}`, data);
                return resolve(false);
            }
            log("停止睡觉", response, data);
            let obj = JSON.parse(response);
            const result = obj.err_no == 0 ? (obj.data.sleeping ? "成功" : "失败") : obj.err_tips;
            tips += `\n[结束睡觉状态] ${result}`;
            resolve(true);
        })
    })
}

// 领取睡觉金币
function collectSleepCoin(coins) {
    return new Promise(resolve => {
        if(coins < 1) {
            return resolve(false);
        }
        let options = initTaskOptions("sleep/done_task");
        options.url.replace("/?", "?rit=undifined&use_ecpm=undefined");
        options.headers['Content-Type'] = "application/json; encoding=utf-8";
        options.body = {
            task_id: 145,
            score_amount: coins
        };
        $hammer.request('post', options, (error, response, data) => {
            if(error){
                $hammer.log(`${Protagonist} 领取睡觉金币 请求异常:\n${error}`, data);
                return resolve(false);
            }
            log("领取睡觉金币", response, data);
            let obj = JSON.parse(response);
            const result = obj.err_no == 0 ? (obj.data.sleeping ? `${coins}个` : "失败") : obj.err_tips;
            tips += `\n[领取睡觉金币] ${result}`;
            resolve(true);
        })
    })
}

//++++++++++++++++++++++++++++++++++++
//游戏签到
function getGameSign() {
    return new Promise(resolve => {
        const options = farmOptions(`reward/sign_in&watch_ad=0`);
        $hammer.request('get', options, (error, response, data) =>{
            if(error){
                $hammer.log(`${Protagonist} 游戏签到 error: ${error}`);
                return resolve(false);
            }
            log("游戏签到", response, data);
            const result = JSON.parse(response);
            tips += `\n[游戏签到] `;
            if (result.status_code != 0) {
                tips += result.message;
                return resolve(false);
            }
            let receive = "";
            for (item of result.data.sign){
                if(item.status == 1){
                    receive += `${item.num}个${item.name};`;
                }
            }
            if(receive){
                tips += `获得: ${receive}`;
            }
            resolve(true);
        })
    })
}

//游戏宝箱
function open_box(first=false) {
    return new Promise(resolve => {
        const options = farmOptions(`box/open`);
        $hammer.request('get', options, async (error, response, data) =>{
            if(error){
                $hammer.log(`${Protagonist} 打开游戏宝箱 error: ${error}`);
                return resolve(false);
            }
            log("打开游戏宝箱", response, data);
            const result = JSON.parse(response);
            tips += first ? `\n[打开游戏宝箱] ` : "";
            if (result.status_code != 0) {
                tips += result.message;
                return resolve(false);
            }
            tips += `获得金币：${result.data.incr_coin}`;
            result.data.box_num && await open_box(true);
            resolve(true);
        })
    })
}

//浇水
function land_water(first=false) {
    return new Promise(resolve => {
        const options = farmOptions(`land_water`);
        $hammer.request('get', options, async (error, response, data) =>{
            if(error){
                $hammer.log(`${Protagonist} 浇水 error: ${error}`);
                return resolve(false);
            }
            log("浇水", response, data);
            const result = JSON.parse(response);
            tips += first ? `\n[游戏浇水] ` : "";
            if (result.status_code != 0) {
                tips += result.message;
                return resolve(false);
            }
            if(first){
                return resolve(true);
            }
            let times = 1;
            let max = result.data.water / 10 - 10;
            while(max-- > 0) {
                if(!await land_water(true)){
                    times++;
                    break;
                }
            }
            tips += `${times}次`;
            for (const land of result.data.info) {
                if (!land.status && land.unlock_able) {
                    await unblock_land(land.land_id);
                }
            }
            setTimeout(()=>{
                resolve(true);
            }, randomNumber(1, 3)*1000);
        })
    })
}

//解锁土地
function unblock_land(land_id) {
    return new Promise(resolve => {
        const options = farmOptions(`land/unlock&land_id=${land_id}`);
        $hammer.request('get', options, (error, response, data) =>{
            if(error){
                $hammer.log(`${Protagonist} 解锁土地 error: ${error}`);
                return resolve(false);
            }
            log("解锁土地", response, data);
            const result = JSON.parse(response);
            tips += `,第${land_id}块土地解锁：` + (result.status_code ? result.message : "成功");
            resolve(true);
        })
    })
}

//获取任务
function daily_task() {
    return new Promise(resolve => {
        const options = farmOptions(`daily_task/list`);
        $hammer.request('get', options, async (error, response, data) =>{
            if(error){
                $hammer.log(`${Protagonist} 获取任务 error: ${error}`);
                return resolve(false);
            }
            const result = JSON.parse(response);
            log("获取任务", response, data);
            tips += `\n[获取游戏任务] 状态：`;
            if (result.status_code != 0) {
                tips += result.message;
                return resolve(false);
            }
            tips += "正常";
            for (const task of result.data) {
                (task.status == 1) && await task_reward(task.task_id);
            }
            resolve(true);
        })
    })
}

//领取任务奖励
function task_reward(task_id) {
    return new Promise(resolve => {
        const options = farmOptions(`reward/task&task_id=${task_id}`);
        $hammer.request('get', options, (error, response, data) =>{
            if(error){
                $hammer.log(`${Protagonist} 游戏任务领取 error: ${error}`);
                return resolve(false);
            }
            log("游戏任务领取", response, data);
            const result = JSON.parse(response);
            resolve(true);
        })
    })
}

//三餐礼包状态
function game_farm_list() {
    return new Promise(resolve => {
        const options = farmOptions(`gift/list`);
        $hammer.request('get', options, async (error, response, data) =>{
            if(error){
                $hammer.log(`${Protagonist} 三餐礼包 error: ${error}`);
                return resolve(false);
            }
            log("三餐礼包", response, data);
            const result = JSON.parse(response);
            if (result.status_code != 0) {
                tips += `\n[三餐礼包查询] 异常：${result.message}`;
                return resolve(false);
            }
            for (const task of result.data) {
                (task.status == 1) && await game_farm_reward(task.task_id);
            }
            resolve(true);
        })
    })
}

//三餐礼包领取
function game_farm_reward(task_id) {
    return new Promise(resolve => {
        const options = farmOptions(`reward/gift&gift_id=${task_id}`);
        $hammer.request('get', options, (error, response, data) =>{
            if(error){
                $hammer.log(`${Protagonist} 三餐领取 error: ${error}`);
                return resolve(false);
            }
            log("三餐领取", response, data);
            const result = JSON.parse(response);
            tips += `\n[三餐领取] `;
            if (result.status_code != 0) {
                tips += `异常：${result.message}`;
                return resolve(false);
            }
            tips += `金币：${result.message}`;
            resolve(true);
        })
    })
}

//++++++++++++++++++++++++++++++++
$hammer.isRequest ? GetCookie() : main();
//++++++++++++++++++++++++++++++++