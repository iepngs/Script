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
// #Cookie获取
// 1.阅读文章弹出金币
// 2.签到
// 3.我的农场
// http-request ^https:\/\/is\.snssdk\.com\/score_task\/v1\/task\/(sign_in|get_read_bonus) script-path=https://raw.staticdn.net/iepngs/Script/master/jrtt/index.js,requires-body=true,tag=今日头条极速版-任务
// http-request ^https:\/\/i\.snssdk\.com\/ttgame\/game_farm\/home_info script-path=https://raw.staticdn.net/iepngs/Script/master/jrtt/index.js,requires-body=true,tag=今日头条极速版-游戏
// ====================================
// #今日头条定时任务
// Warning：定时时间不要动
// cron "5,35 8-21 * * *" script-path=https://raw.staticdn.net/iepngs/Script/master/jrtt/index.js,tag=今日头条极速版
// ====================================
// MITM=i.snssdk.com,is.snssdk.com
// ====================================

const $hammer=(()=>{const isRequest="undefined"!=typeof $request,isSurge="undefined"!=typeof $httpClient,isQuanX="undefined"!=typeof $task;const log=(...n)=>{for(let i in n)console.log(n[i])};const alert=(title,body="",subtitle="",options={})=>{let link=null;switch(typeof options){case"string":link=isQuanX?{"open-url":options}:options;break;case"object":if(["null","{}"].indexOf(JSON.stringify(options))==-1){link=isQuanX?options:options["open-url"];break}default:link=isQuanX?{}:""}if(isSurge)return $notification.post(title,subtitle,body,link);if(isQuanX)return $notify(title,subtitle,body,link);log("==============📣系统通知📣==============");log("title:",title,"subtitle:",subtitle,"body:",body,"link:",link)};const read=key=>{if(isSurge)return $persistentStore.read(key);if(isQuanX)return $prefs.valueForKey(key)};const write=(val,key)=>{if(isSurge)return $persistentStore.write(val,key);if(isQuanX)return $prefs.setValueForKey(val,key)};const request=(method,params,callback)=>{let options={};if(typeof params=="string"){options.url=params}else{options.url=params.url;if(typeof params=="object"){params.headers&&(options.headers=params.headers);params.body&&(options.body=params.body)}}method=method.toUpperCase();const writeRequestErrorLog=function(m,u){return err=>{log(`\n===request error-s--\n`);log(`${m} ${u}`,err);log(`\n===request error-e--\n`)}}(method,options.url);if(isSurge){const _runner=method=="GET"?$httpClient.get:$httpClient.post;return _runner(options,(error,response,body)=>{if(error==null||error==""){response.body=body;callback("",body,response)}else{writeRequestErrorLog(error);callback(error,"",response)}})}if(isQuanX){options.method=method;$task.fetch(options).then(response=>{response.status=response.statusCode;delete response.statusCode;callback("",response.body,response)},reason=>{writeRequestErrorLog(reason.error);response.status=response.statusCode;delete response.statusCode;callback(reason.error,"",response)})}};const done=(value={})=>{if(isQuanX)return isRequest?$done(value):null;if(isSurge)return isRequest?$done(value):$done()};const pad=(c="~",s=false,l=15)=>s?console.log(c.padEnd(l,c)):`\n${c.padEnd(l,c)}\n`;return{isRequest,isSurge,isQuanX,log,alert,read,write,request,done,pad}})();
function date(fmt, dateObject = '') { dateObject = dateObject ? (dateObject == "object" ? dateObject : (new Date(+dateObject.toString().padEnd(13, "0").substr(0, 13)))) : new Date(); let ret; const opt = { "Y": dateObject.getFullYear().toString(), "m": (dateObject.getMonth() + 1).toString(), "d": dateObject.getDate().toString(), "H": dateObject.getHours().toString(), "i": dateObject.getMinutes().toString(), "s": dateObject.getSeconds().toString() }; for (let k in opt) { ret = new RegExp("(" + k + ")").exec(fmt); if (ret) { fmt = fmt.replace(ret[1], ret[1].length == 1 ? opt[k].padStart(2, "0") : opt[k]) }; }; return fmt; }
function randomNumber(start, end, fixed = 0) {const differ = end - start, random = Math.random();return (start + differ * random).toFixed(fixed);};

//====================================
const level = 1;//开启日志级别 0:关闭 1:响应body 2:响应所有数据
//++++++++++++++++++++++++++++++++++++

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
const stepCookieKey = "jrttStepCookie";
const hour = +(new Date()).getHours();
let tips = "";
const log = (section, response, data) => {
    level && $hammer.log(`${Protagonist} ${section} response:`, level == 1 ? response : data);
}
const dailyStep = () => {
    return new Promise(resolve => {
        let history = $hammer.read(stepCookieKey);
        history = history ? JSON.parse(history) : false;
        const today = date("Ymd");
        if(history && history.date == today){
            return resolve(history.step);
        }
        // 1w就够上限再多也没有意义
        const step = randomNumber(10001, 11007);
        $hammer.write(`{"step":${step},"date":${today}}`, stepCookieKey);
        resolve(step);
    })
}

//++++++++++++++++++++++++++++++++++++
async function GetCookie() {
    let suffix = /\/([^\/]+(?!.*\/))/.exec($request.url.replace("/?", "?"))[1].split("?");
    const uri = suffix.shift();
    const queryString = suffix.length ? suffix.join("?"): "";
    $hammer.log(`${Protagonist} GetCookie(${uri ? uri : $request.url}).\n${queryString}`);
    let cookieVal = {
        qs: queryString,
        headers: {"User-Agent": $request.headers["User-Agent"]}
    }
    const copyHeaders = header => (cookieVal.headers[header] = $request.headers[header]);
    let category = "";
    switch (uri) {
        case "sign_in":
            category = "签到";
        case "get_read_bonus":
            category = "阅读";
            copyHeaders("x-Tt-Token");
            $hammer.write(JSON.stringify(cookieVal), uri == "sign_in" ? taskCookieKey : readCookieKey);
            break;
        case "home_info":
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
    const dbg = false;
    if(dbg && await checkTaskCookie()){
        // 这仨有问题还么有搞定
        await openIndexBox();
        await walkCount();
        await viewSleepStatus(true);
        return $hammer.done();
    }
    // 5,35 8-21 * * *
    const minute = (new Date()).getMinutes();
    const onece = hour == 8 && minute < 30;
    const conclusion = !!(hour == 20 || hour == 21);
    if(await checkTaskCookie()){
        // minute < 30 && await openIndexBox();
        if(onece){
            await daliySignDetail();
            await viewSleepStatus();
        }
        (hour == 20 && minute < 30) && await viewSleepStatus();
        // (hour == 21 && minute > 30) && await walkPageData();
    }
    if(await checkFarmCookie()){
        onece && await getGameSign();
        if([8,12,21].indexOf(hour) > -1 && minute < 30){
            await offlineProfit();
            await farmPolling();
            await threeMeals();
        }
        if(conclusion && minute > 30){
            await farmTask();
        }
    }
    
    // 每日上限10篇,超过无奖励
    await checkReadCookie() && await reading();

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
    if(uri.indexOf("sleep") > -1){
        options.url = options.url.replace("/?", "/?&_request_from=web&");
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
        let options = initTaskOptions("task/open_treasure_box", 2);
        options.body = "";
        $hammer.request('post', options, (error, response, data) => {
            if(error){
                $hammer.log(`${Protagonist} 首页宝箱 请求异常:\n${error}`, data);
                return resolve(false);
            }
            log("首页宝箱", response, data);
            const obj = JSON.parse(response);
            const result = obj.err_no == 0 ? `金币:+${obj.data.score_amount}, 下次时间: ${date("H点i分s秒", obj.data.next_treasure_time)}` : obj.err_tips;
            tips += `\n[首页宝箱] ${result}`;
            setTimeout(function(){
                resolve(true);
            }, 2500);
        })
    })
}

//++++++++++++++++++++++++++++++++++++
// 阅读
function reading(){
    return new Promise(resolve => {
        let options = initTaskOptions("task/get_read_bonus", 2);
        let article = /group_id=(\d+)/.exec(options.url);
        article = article ? article[1] : "";
        if(!article){
            $hammer.log(`${Protagonist} 阅读中止，cookie异常\n${options.url}`);
            return resolve(false);
        }
        article = article.replace(/\d{3}$/, (Math.random()*1e3).toFixed(0).padStart(3,"0"));
        options.url = options.url.replace(/group_id=\d+/, `group_id=${article}`);
        const readDuration = [8,9,12,20,21].indexOf(hour) > -1;
        const pushFlag = "impression_type=push&";
        const byPush = options.url.indexOf(pushFlag) > 0;
        if(readDuration && byPush){
            options.url = options.url.replace(pushFlag, "");
        }
        if(!readDuration && !byPush){
            options.url = options.url.replace("group_id=", `${pushFlag}group_id=`);
        }
        const delaySeconds = randomNumber(3, 10);
        level && $hammer.log(`${Protagonist} will be execute reading after delay ${delaySeconds}s.`);
        setTimeout(() => {
            $hammer.request('get', options, (error, response, data) => {
                if(error){
                    $hammer.log(`${Protagonist} 阅读奖励 请求异常:\n${error}`, data);
                    return resolve(false);
                }
                log("阅读奖励", response, data);
                const obj = JSON.parse(response);
                let result = obj.err_tips;
                if(obj.err_no == 0){
                    result = `金币:+${obj.data.score_amount}`;
                }else{
                    $hammer.log(`${Protagonist} 阅读响应数据异常：\n${response}`);
                }
                tips += `\n[阅读奖励] ${result}`;
                resolve(true);
            })
        }, delaySeconds * 1000);
    })
}

//++++++++++++++++++++++++++++++++++++
// 查询睡觉任务状态
function viewSleepStatus(collect=false) {
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
            tips += `\n[睡觉待收金币] ${obj.data.sleep_unexchanged_score}\n[当前睡觉状态] `;
            if(obj.data.sleeping){
                tips += `已昏睡${obj.data.sleep_last_time}s`;
                if(hour > 7 && hour < 20){
                    await stopSleep();
                }
                await collectSleepCoin(obj.data.sleep_unexchanged_score);
                return resolve(true);
            }else{
                collect && collectSleepCoin(obj.data.history_amount);
            }
            tips += `睁着眼睛的没在睡`;
            (hour > 19 || hour < 3) && await startSleep();
            resolve(true);
        })
    })
}

// 开始睡觉
function startSleep() {
    return new Promise(resolve => {
        let options = initTaskOptions("sleep/start");
        options.body = JSON.stringify({task_id: 145});
        setTimeout(() => {
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
        }, 2000);
    })
}

// 结束睡觉
function stopSleep() {
    return new Promise(resolve => {
        let options = initTaskOptions("sleep/stop");
        options.body = JSON.stringify({task_id: 145});
        setTimeout(() => {
            $hammer.request('post', options, (error, response, data) => {
                if(error){
                    $hammer.log(`${Protagonist} 结束睡觉 请求异常:\n${error}`, data);
                    return resolve(false);
                }
                log("停止睡觉", response, data);
                let obj = JSON.parse(response);
                const result = obj.err_no == 0 ? (obj.data.sleeping ? "成功" : "失败") : obj.err_tips;
                //result == "成功" && await collectSleepCoin(obj.data.history_amount); // aysnc
                tips += `\n[结束睡觉状态] ${result}`;
                resolve(true);
            })
        }, 2000);
    })
}

// 领取睡觉金币
function collectSleepCoin(coins) {
    return new Promise(resolve => {
        setTimeout(()=>{
            if(coins < 1) {
                return resolve(false);
            }
            let options = initTaskOptions("sleep/done_task");
            options.url = options.url.replace("/?", "/?rit=undefined&use_ecpm=undefined");
            options.headers['Content-Type'] = "application/json; encoding=utf-8";
            options.body = JSON.stringify({task_id: 145, score_amount: coins});
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
        }, 2000);
    })
}

//++++++++++++++++++++++++++++++++++++
// walk
function walkPageData() {
    return new Promise(resolve => {
        const options = initTaskOptions("walk/page_data");
        $hammer.request('get', options, async (error, response, data) => {
            if(error){
                $hammer.log(`${Protagonist} 走路活动 请求异常:\n${error}`, data);
                return resolve(false);
            }
            log("走路活动", response, data);
            const obj = JSON.parse(response);
            tips += `\n[走路活动] `;
            if(obj.err_no){
                tips += `查询异常: ${obj.err_tips}`;
                return resolve(false);
            }
            tips += `${obj.data.city}地区`;
            for (const section of obj.data.today_info) {
                // section.received_status == 2 && await collectWalkCoin(136);
                if(section.received_status == 1){
                    await walkCount();
                    break;
                }
            }
            if(obj.data.walk_info.length == 6 && !obj.data.is_awarded){
                await collectWalkCoin(137);
            }
            setTimeout(()=>{
                resolve(true);
            }, 1200);
        })
    })
}

function walkCount() {
    return new Promise(async resolve => {
        let options = initTaskOptions("walk/count");
        const step = await dailyStep();
        options.body = JSON.stringify({
            count: step,
            client_time: +(Date.now()/1000).toFixed(0)
        });
        $hammer.request('post', options, async (error, response, data) => {
            if(error){
                $hammer.log(`${Protagonist} 步数同步 请求异常:\n${error}`, data);
                return resolve(false);
            }
            log("步数同步", response, data);
            const obj = JSON.parse(response);
            $hammer.log(`${Protagonist} walk request body:\n${options.body}`);
            const result = obj.err_no == 0 ? `已同步${obj.data.walk_count}步` : `失败(${step}): ${obj.err_tips}`;
            tips += `\n[步数同步] ${result}`;
            obj.err_no || await collectWalkCoin(136);
            setTimeout(()=>{
                resolve(true);
            }, 1200);
        })
    })
}

function collectWalkCoin(id){
    return new Promise(resolve => {
        setTimeout(()=>{
            let options = initTaskOptions("walk/bonus");
            options.url = options.url.replace("/?", "/?rit=undefined&use_ecpm=undefined&");
            options.headers['Content-Type'] = "application/json; encoding=utf-8";
            options.body = JSON.stringify({
                task_id: id,
                client_time: +(Date.now()/1000).toFixed(0)
            });
            $hammer.request('post', options, (error, response, data) => {
                const title = id == 136 ? "走路日签" : "走路满勤";
                if(error){
                    $hammer.log(`${Protagonist} 领取${title} 请求异常:\n${error}`, data);
                    return resolve(false);
                }
                log(title, response, data);
                let obj = JSON.parse(response);
                const result = obj.err_no == 0 ? `金币:+${obj.data.score_amount}` : `失败:${obj.err_tips}`;
                tips += `\n[${title}] ${result}`;
                resolve(true);
            })
        }, 2000);
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
            if(!result.data){
                tips += "已领取或无奖励";
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

function offlineProfit(){
    return new Promise(resolve => {
        const options = farmOptions(`double_reward&watch_ad=1`);
        $hammer.request('get', options, (error, response, data) =>{
            if(error){
                $hammer.log(`${Protagonist} 游戏离线收益 error: ${error}`);
                return resolve(false);
            }
            log("游戏离线收益", response, data);
            const result = JSON.parse(response);
            tips += `\n[游戏离线收益] ${result.status_code?result.message:"已收取"}`;
            return resolve(true);
        })
    })
}

function farmPolling() {
    return new Promise(resolve => {
        const avatar = "https%3A%2F%2Fs2.pstatp.com%2Fpgc%2Fv2%2Fresource%2Fpgc_web_v3%2Feeef6c8ca9b5db8d0b443379d9dce231.png";
        const options = farmOptions(`polling_info&nickname=anonymouse&avatar_url=${avatar}`);
        $hammer.request('get', options, async (error, response, data) =>{
            if(error){
                $hammer.log(`${Protagonist} 游戏主页 error: ${error}`);
                return resolve(false);
            }
            log("游戏主页", response, data);
            const result = JSON.parse(response);
            tips += `\n[游戏主页] `;
            if (result.status_code != 0) {
                tips += `异常：${result.message}`;
                return resolve(false);
            }
            tips += `状态：正常`;
            const info = result.data.info;
            if(info.box_num){
                await open_box();
            }
            if(info.water > 100){
                await land_water();
            }
            let type = "未知";
            switch (info.kind_of_game) {
                case 1:
                    type = "打地鼠";
                    break;
                case 2:
                    type = "钓鱼";
                    break;
                default:
                    $hammer.log(`${Protagonist} farmPolling.info:\n`, info);
                    break;
            }
            if(info.diglett_num && !info.diglett_cooling_time){
                await diglettGame(type) && await diglettReward();
            }
            resolve(true);
        })
    })
}


//游戏宝箱
function open_box(again=false) {
    return new Promise(resolve => {
        const options = farmOptions(`box/open`);
        setTimeout(async () => {
            $hammer.request('get', options, async (error, response, data) =>{
                if(error){
                    $hammer.log(`${Protagonist} 打开游戏宝箱 error: ${error}`);
                    return resolve(0);
                }
                log("打开游戏宝箱", response, data);
                const result = JSON.parse(response);
                tips += again ? `` : "\n[打开游戏宝箱] ";
                if (result.status_code != 0) {
                    tips += result.message;
                    return resolve(0);
                }
                if(!again){
                    let coins = 0;
                    let max = result.data.box_num;
                    while(max-- > 0){
                        coins += await open_box(true);
                    }
                    tips += `获得金币：${coins}`;
                }
                resolve(result.data.incr_coin);
            })
        }, 3000);
    })
}

//浇水
function land_water(again=false) {
    return new Promise(resolve => {
        setTimeout(()=>{
            const options = farmOptions(`land_water`);
            $hammer.request('get', options, async (error, response, data) =>{
                if(error){
                    $hammer.log(`${Protagonist} 浇水 error: ${error}`);
                    return resolve(false);
                }
                log("浇水", response, data);
                const result = JSON.parse(response);
                tips += again ? "" : `\n[游戏浇水] `;
                if (result.status_code != 0) {
                    tips += result.message;
                    return resolve(false);
                }
                if(again){
                    return resolve(true);
                }
                let times = 0;
                let max = result.data.water / 10 - 10;
                while(max-- > 0) {
                    const resp = await land_water(true);
                    if(!resp){
                        break;
                    }
                    times++;
                }
                tips += `${times}次`;
                for (const land of result.data.info) {
                    if (!land.status && land.unlock_able) {
                        await unblockLand(land.land_id);
                        break;
                    }
                    land.farm_event && await repairLand(land.land_id, land.farm_event.event_id);
                }
                return resolve(true);
            })
        }, randomNumber(2, 3)*1000);
    })
}

//修复土地
function repairLand(id, type){
    return new Promise(resolve => {
        const options = farmOptions(`handle_event&land_id=${id}&event_type=${type}&watch_ad=1`);
        setTimeout(()=>{
            $hammer.request('get', options, (error, response, data) =>{
                if(error){
                    $hammer.log(`${Protagonist} 修复土地 error: ${error}`);
                    return resolve(false);
                }
                log("修复土地", response, data);
                const result = JSON.parse(response);
                tips += `,第${id}块土地修复：` + (result.status_code ? result.message : "成功");
                resolve(true);
            })
        }, randomNumber(8,12)*1000);
    })
}

//解锁土地
function unblockLand(id) {
    return new Promise(resolve => {
        const options = farmOptions(`land/unlock&land_id=${id}`);
        setTimeout(()=>{
            $hammer.request('get', options, (error, response, data) =>{
                if(error){
                    $hammer.log(`${Protagonist} 解锁土地 error: ${error}`);
                    return resolve(false);
                }
                log("解锁土地", response, data);
                const result = JSON.parse(response);
                tips += `,第${id}块土地解锁：` + (result.status_code ? result.message : "成功");
                resolve(true);
            })
        }, 1500);
    })
}

//获取任务
function farmTask() {
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
                (task.status == 1) && await taskReward(task.task_id);
            }
            resolve(true);
        })
    })
}

//领取任务奖励
function taskReward(id) {
    return new Promise(resolve => {
        const options = farmOptions(`reward/task&task_id=${id}`);
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
function threeMeals() {
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
                if(task.status == 1 || task.status == 4){
                    const rewardDesc = `${task.title}:${task.reward_num}${task.name}`;
                    await mealReward(task.gift_id, task.status, rewardDesc);
                }
            }
            resolve(true);
        })
    })
}

//三餐礼包领取
function mealReward(id, status, rewardDesc) {
    return new Promise(resolve => {
        const options = farmOptions(`reward/gift&gift_id=${id}&watch_ad=${status == 4 ? 1 : 0}`);
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
            tips += rewardDesc;
            resolve(true);
        })
    })
}

function diglettGame(type) {
    return new Promise(resolve => {
        setTimeout(()=>{
            const options = farmOptions(`diglett_game`);
            $hammer.request('get', options, (error, response, data) =>{
                if(error){
                    $hammer.log(`${Protagonist} 随机游戏 error: ${error}`);
                    return resolve(false);
                }
                log("随机游戏", response, data);
                const result = JSON.parse(response);
                tips += `\n[随机游戏] ${result.status_code ? result.message : type}`;
                resolve(true);
            })
        }, 5000);
    })
}

function diglettReward() {
    return new Promise(resolve => {
        const num = randomNumber(80, 90);
        const options = farmOptions(`diglett_reward&diamond_num=${num}&watch_ad=1`);
        $hammer.request('get', options, (error, response, data) =>{
            if(error){
                $hammer.log(`${Protagonist} 游戏钻石 error: ${error}`);
                return resolve(false);
            }
            log("游戏钻石", response, data);
            const result = JSON.parse(response);
            tips += `\n[游戏钻石] `;
            if (result.status_code != 0) {
                tips += `异常：${result.message}`;
                return resolve(false);
            }
            tips += `收获砖石:${num},今日剩余:${result.data.diglett_num}次,当前背包共有钻石:${result.data.diamond_num}个`;
            resolve(true);
        })
    })
}

//++++++++++++++++++++++++++++++++
$hammer.isRequest ? GetCookie() : main();
//++++++++++++++++++++++++++++++++
