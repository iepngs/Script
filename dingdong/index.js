

// cron "1 8,12,17 * * *" script-path="",tag="叮咚养鱼"

const $hammer = (() => {
    const isRequest = "undefined" != typeof $request,
        isSurge = "undefined" != typeof $httpClient,
        isQuanX = "undefined" != typeof $task;

    const log = (...n) => { for (let i in n) console.log(n[i]) };
    const alert = (title, body = "", subtitle = "", link = "") => {
        if (isSurge) return $notification.post(title, subtitle, body, link);
        if (isQuanX) return $notify(title, subtitle, (link && !body ? link : body));
        log("==============📣系统通知📣==============");
        log("title:", title, "subtitle:", subtitle, "body:", body, "link:", link);
    };
    const read = key => {
        if (isSurge) return $persistentStore.read(key);
        if (isQuanX) return $prefs.valueForKey(key);
    },
        write = (key, val) => {
            if (isSurge) return $persistentStore.write(key, val);
            if (isQuanX) return $prefs.setValueForKey(key, val);
        };
    const request = (method, params, callback) => {
        /**
         * 
         * params(<object>): {url: <string>, headers: <object>, body: <string>} | <url string>
         * 
         * callback(
         *      error, 
         *      {status: <int>, headers: <object>, body: <string>} | ""
         * )
         * 
         */
        let options = {};
        if (typeof params == "string") {
            options.url = params;
        } else {
            options.url = params.url;
            if (typeof params == "object") {
                params.headers && (options.headers = params.headers);
                params.body && (options.body = params.body);
            }
        }
        method = method.toUpperCase();

        const writeRequestErrorLog = function (m, u) {
            return err => {
                log("=== request error -s--");
                log(`${m} ${u}`, err);
                log("=== request error -e--");
            };
        }(method, options.url);

        if (isSurge) {
            const _runner = method == "GET" ? $httpClient.get : $httpClient.post;
            return _runner(options, (error, response, body) => {
                if (error == null || error == "") {
                    response.body = body;
                    callback("", response);
                } else {
                    writeRequestErrorLog(error);
                    callback(error, "");
                }
            });
        }
        if (isQuanX) {
            options.method = method;
            $task.fetch(options).then(
                response => {
                    response.status = response.statusCode;
                    delete response.statusCode;
                    callback("", response);
                },
                reason => {
                    writeRequestErrorLog(reason.error);
                    callback(reason.error, "");
                }
            );
        }
    };
    const done = (value = {}) => {
        if (isQuanX) return isRequest ? $done(value) : null;
        if (isSurge) return isRequest ? $done(value) : $done();
    };
    return { isRequest, isSurge, isQuanX, log, alert, read, write, request, done };
})();

const cookieName = '叮咚买菜'
const cookie = $hammer.read(cookieName);//"DDXQSESSID=a360dbae1dd64231884a44e733b2e575";
const station_id = "5de89c8d26c3d12d538b456a";
const propsId = "", seedId = "";
const DD_API_HOST = 'https://farm.api.ddxq.mobi';

const initRequestHeaders = function() {
    return {
        "Host": "farm.api.ddxq.mobi",
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": "https://game.m.ddxq.mobi",
        "Accept-Encoding": "gzip, deflate, br",
        "Cookie": cookie,
        "Connection": "keep-alive",
        "Accept": "*/*",
        "User-Agent": `Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 xzone/9.11.1 station_id/${station_id}`,
        "Referer": "https://game.m.ddxq.mobi/index.html",
        "Accept-Language": "zh-cn"
    };
};

function viewMyTask(){
    const options = {
        url: `${DD_API_HOST}/api/task/list`,
        headers: initRequestHeaders(),
        body:`api_version=9.1.0&app_client_id=3&station_id=${station_id}&native_version=&latitude=30.272356&longitude=120.022035&gameId=1`
    }
    
    $hammer.request("post", options, (error, response) =>{
        if(error){
            console.log(error)
            return
        }
        response = JSON.parse(response);
        if(!response.code){
            $hammer.log(response);
            $hammer.alert("DDXQ", response.msg, "task/list");
            return
        }
        const taskList = response.data.userTasks;
        const taskStatus = {
            "TO_ACHIEVE": "未完成", 
            "TO_REWARD": "已完成，未领取奖励", 
            "WAITING_WINDOW": "未到领取时间",
            "FINISHED": "完成，已领取奖励",
        };
        for (const task of taskList) {
            $hammer.log(`${task.taskName}:${task.descriptions?.[0]} - 持续天数：${task.continuousDays} - 任务状态:${taskStatus[task.buttonStatus]}`);
            switch (task.buttonStatus) {
                case "TO_ACHIEVE":                    
                    taskAchieve(task.taskCode);
                    break;
                case "TO_REWARD":
                    task.userTaskLogId && taskReward(task.userTaskLogId);
                    break;
                default:
                    break;
            }
        }
    })
}


// 做任务
// taskCode:
//      BROWSE_GOODS: 领取30s广告奖励
//      CONTINUOUS_SIGN: 领取签到奖励
//      DAILY_SIGN: 每日签到
function taskAchieve(taskCode){
    const options = {
        url: `${DD_API_HOST}/api/task/achieve`,
        headers: initRequestHeaders(),
        body: `api_version=9.1.0&app_client_id=3&station_id=${station_id}&native_version=&latitude=30.272356&longitude=120.022035&gameId=1&taskCode=${taskCode}`
    }
    
    $hammer.request("post", options, (error, response) =>{
        if(error){
            console.log(error)
            return
        }
        response = JSON.parse(response);
        if(!response.code){
            $hammer.log(response);
            $hammer.alert("DDXQ", response.msg, "task/list");
            return
        }
        if (response.data.taskStatus == "ACHIEVED") {
            const adRewardId = response.data?.userTaskLogId;
            if (adRewardId) {
                taskReward(userTaskLogId);
            }
        }
    })
}

// 有任务编号的领取奖励
function taskReward(userTaskLogId){
    const options = {
        url: `${DD_API_HOST}/api/task/reward`,
        headers: initRequestHeaders(),
        body: `api_version=9.1.0&app_client_id=3&station_id=${station_id}&native_version=&latitude=30.272356&longitude=120.022035&gameId=1&userTaskLogId=${userTaskLogId}`
    }
    
    $hammer.request("post", options, (error, response) =>{
        if(error){
            console.log(error)
            return
        }
        response = JSON.parse(response);
        if(!response.code){
            $hammer.log(response);
            $hammer.alert("DDXQ", response.msg, "task/reward");
            return
        }

        $hammer.log(response);
    })
}


function fishpond() {
    $hammer.log('正在获取鱼池信息…');
    return new Promise(resolve => {
        const options = {
            url: `${DD_API_HOST}/api/userguide/detail`,
            headers: initRequestHeaders(),
            body: `api_version=9.1.0&app_client_id=3&station_id=${station_id}&native_version=&latitude=30.272356&longitude=120.022035&gameId=1&guideCode=FISHPOND_V1`
        };        
        $hammer.request("post", options, (error, response) =>{
            if(error){
                return $hammer.log(error);
            }
            response = JSON.parse(response);
            if(response.code){
                $hammer.log(response);
                return $hammer.alert("DDXQ", response.msg, "userguide/detail");
            }
            const data = response.data;
            if(data.seeds[0].expPercent >= 100){
                return $hammer.alert("DDXQ", "鱼已经养活了");
            }
            propsId = data.props[0].propsId;
            seedId = data.seeds[0].seedId;
            $hammer.log('要准备开始喂鱼啦');
            resolve();
        })
    })
}

function propsFeed(i){
    return new Promise(resolve => {
        const options = {
            url: `${DD_API_HOST}/api/props/feed`,
            headers: initRequestHeaders(),
            body: `api_version=9.1.0&app_client_id=3&station_id=${station_id}&native_version=&latitude=30.272356&longitude=120.022035&gameId=1&propsId=${propsId}&seedId=${seedId}`
        };
        $hammer.log(`第${i}次喂鱼`);
        $hammer.request("post", options, (error, response) =>{
            if(error){
                $hammer.log(error);
                resolve(false);
            }
            response = JSON.parse(response);
            if(!response.code){
                $hammer.log(response);
                $hammer.alert("DDXQ", response.msg, "props/feed");
                resolve(false);
            }
            const data = response.data;

            $hammer.log(data.seeds[0].msg);

            const remain = data.props[0].amount;
            const process = data.seeds[0].expPercent;
            
            $hammer.log(`剩余饲料: ${remain}g, 进度: ${process}`);

            if(remain < 10){
                $hammer.alert("DDXQ", "饲料不够了", "props/feed");
                resolve(false);
            }
            resolve(true);
        })
    })
}

(async function(){
    if(!cookie){
        return $hammer.alert(cookieName, "cookie不存在，先去获取吧");
    }
    await (()=>{
        return new Promise(resolve =>{
            resolve(viewMyTask())
        })
    })();
    $hamme.log(`【${cookieName}】任务部分结束。`)
    await fishpond();
    let index = 1;
    while(await propsFeed(index)){
        index++;
    }
    $hammer.done();
})().catch(err => $hammer.log(`【🙅 ${cookieName}】运行异常: ${err}`), $hammer.done());
