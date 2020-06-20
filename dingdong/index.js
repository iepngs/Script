/**
叮咚农场

说明：
从 我的 点击 “叮咚农场” 进入即可获取cookie。
获取Cookie后, 请将Cookie脚本禁用并移除主机名，以免产生不必要的MITM。

************************
[Mitm]
************************
hostname = maicai.api.ddxq.mobi


************************
QuantumultX 本地脚本配置:
************************

[task_local]
# go语言中文网签到
1 8,12,17 * * * iepngs/Script/master/dingdong/index.js

[rewrite_local]
# 获取Cookie
https:\/\/maicai\.api\.ddxq\.mobi\/user\/checkLogin url script-request-header iepngs/Script/master/dingdong/index.js


************************
Loon 2.1.0+ 脚本配置:
************************

[Script]
# go语言中文网签到
cron "1 8,12,17 * * *" script-path=https://raw.githubusercontent.com/iepngs/Script/master/dingdong/index.js,tag=叮咚养鱼

# 获取Cookie
http-request ^https:\/\/maicai\.api\.ddxq\.mobi\/user\/checkLogin script-path=https://raw.githubusercontent.com/iepngs/Script/master/dingdong/index.js,tag=叮咚农场

**/
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
            if (isSurge) return $persistentStore.write(val, key);//surge是反着顺序的
            if (isQuanX) return $prefs.setValueForKey(key, val);
        };
    const request = (method, params, callback) => {
        /**
         * 
         * params(<object>): {url: <string>, headers: <object>, body: <string>} | <url string>
         * 
         * callback(
         *      error, 
         *      <response-body string>?,
         *      {status: <int>, headers: <object>, body: <string>}?
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
                    callback("", body, response);
                } else {
                    writeRequestErrorLog(error);
                    callback(error);
                }
            });
        }
        if (isQuanX) {
            options.method = method;
            $task.fetch(options).then(
                response => {
                    response.status = response.statusCode;
                    delete response.statusCode;
                    callback("", response.body, response);
                },
                reason => {
                    writeRequestErrorLog(reason.error);
                    callback(reason.error);
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

const Protagonist = '叮咚农场',
    CookieKey = "CookieDDXQfarm",
    CookieKeyStationId = "CookieDDXQfarmStationId",
    DD_API_HOST = 'https://farm.api.ddxq.mobi';

let propsId = "", seedId = "";

const cookie = $hammer.read(CookieKey);
const station_id = $hammer.read(CookieKeyStationId);

function GetCookie() {
    try {
        CookieValueStationId = /.*&station_id=(\w+)?&/.exec($request.url)?.[1];
        if ($request.headers && CookieValueStationId) {
            const CookieValue = $request.headers['Cookie'];
            const cachedCookie = $hammer.read(CookieKey);
            const dynamic = cachedCookie ? (cachedCookie == CookieValue ? "" : "更新") : "写入";
            if(dynamic){
                $hammer.write(CookieKeyStationId, CookieValueStationId);
                const result = $hammer.write(CookieKey, CookieValue);
                $hammer.log(`CookieKey: ${CookieKey}, CookieValue: ${CookieValue}, read: ` + $hammer.read(CookieKey));
                $hammer.alert(Protagonist, dynamic + (result ? "成功🎉" : "失败"));
            }
        } else {
            $hammer.alert(Protagonist, "请检查匹配URL或配置内脚本类型", "写入失败");
        }
    } catch (error) {
        $hammer.alert(Protagonist, "写入失败: 未知错误");
        $hammer.log(error);
    }
    $hammer.done();
}

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
    return new Promise(resolve =>{
        const options = {
            url: `${DD_API_HOST}/api/task/list`,
            headers: initRequestHeaders(),
            body:`api_version=9.1.0&app_client_id=3&station_id=${station_id}&native_version=&latitude=30.272356&longitude=120.022035&gameId=1`
        }
        $hammer.request("post", options, (error, response) =>{
            if(error){
                $hammer.log(error)
                return
            }
            response = JSON.parse(response);
            if(response.code){
                $hammer.log(response);
                $hammer.alert("DDXQ", response.msg, "task/list");
                return
            }
            const taskList = response.data.userTasks;
            const taskStatus = {
                "TO_ACHIEVE": "未完成", 
                "TO_REWARD": "已完成，未领取奖励", 
                "WAITING_REWARD": "等待完成",
                "WAITING_WINDOW": "未到领取时间",
                "FINISHED": "完成，已领取奖励",
            };
            for (const task of taskList) {
                const desc = task.descriptions?.[0] ? `:${task.descriptions[0]}` : "";
                const status = taskStatus[task.buttonStatus] ? taskStatus[task.buttonStatus] : (task.buttonStatus ? task.buttonStatus : "未知");
                $hammer.log(`\n===========\n${task.taskName}${desc}\n- 持续天数:${task.continuousDays}\n- 任务状态:${status}\n`);
                switch (task.buttonStatus) {
                    case "TO_ACHIEVE":
                        taskAchieve(task.taskCode);
                        break;
                    case "TO_REWARD":
                        task.userTaskLogId && taskReward(task.userTaskLogId);
                        break;
                }
            }
            resolve();
        })
    });
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
        if(response.code){
            $hammer.log(response);
            $hammer.alert("DDXQ", response.msg, "task/achieve");
            return
        }
        if (response.data.taskStatus == "ACHIEVED") {
            const adRewardId = response.data?.userTaskLogId;
            adRewardId && taskReward(userTaskLogId);
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
        if(response.code){
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
                return $hammer.alert(Protagonist, response.msg, "userguide/detail");
            }
            const data = response.data;
            if(data.seeds[0].expPercent >= 100){
                return $hammer.alert(Protagonist, "鱼已经养活了");
            }
            propsId = data.props[0].propsId;
            seedId = data.seeds[0].seedId;
            $hammer.log("准备开始喂鱼啦");
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
        $hammer.request("post", options, (error, response, ff) =>{
            if(error){
                let dd = {
                    url: `${DD_API_HOST}/api/props/feed`,
                    headers: initRequestHeaders(),
                    body: `api_version=9.1.0&app_client_id=3&station_id=${station_id}&native_version=&latitude=30.272356&longitude=120.022035&gameId=1&propsId=${propsId}&seedId=${seedId}`
                };
                $hammer.log("dd:", dd, "response:", response, ff.status);
                $hammer.log(error);
                resolve(false);
            }
            response = JSON.parse(response);
            if(response.code){
                let nn = {
                    url: `${DD_API_HOST}/api/props/feed`,
                    headers: initRequestHeaders(),
                    body: `api_version=9.1.0&app_client_id=3&station_id=${station_id}&native_version=&latitude=30.272356&longitude=120.022035&gameId=1&propsId=${propsId}&seedId=${seedId}`
                };
                $hammer.log("nn:", nn, "response:", response);
                $hammer.alert(Protagonist, response.msg, "props/feed");
                resolve(false);
            }
            const data = response.data;

            $hammer.log(data.seeds[0].msg);

            const remain = data.props[0].amount;
            const process = data.seeds[0].expPercent;
            
            $hammer.log(`剩余饲料: ${remain}g, 进度: ${process}`);

            if(remain < 10){
                $hammer.alert(Protagonist, "饲料不够了", "props/feed");
                resolve(false);
            }
            resolve(true);
        })
    })
}

$hammer.isRequest ? GetCookie() : (async function(){
    if(!cookie){
        return $hammer.alert(Protagonist, "cookie不存在，先去获取吧");
    }

    await viewMyTask();
    $hammer.log(`【${Protagonist}】任务部分结束。`);

    await fishpond();
    let index = 1;
    while(await propsFeed(index)){
        index++;
    }
    $hammer.done();
})().catch(err => $hammer.log(`【🙅 ${Protagonist}】运行异常: ${err}`), $hammer.done());
