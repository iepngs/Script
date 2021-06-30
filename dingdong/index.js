/**
叮咚农场

说明：
叮咚买菜App - 右下角“我的”- 叮咚农场 进入即可获取cookie。
获取Cookie后, 请将Cookie脚本禁用并移除主机名，以免产生不必要的MITM。

************************
[Mitm]
************************
hostname = maicai.api.ddxq.mobi


************************
QuantumultX 本地脚本配置:
************************

[task_local]
# 叮咚农场
1 8,12,17 * * * iepngs/Script/master/dingdong/index.js

[rewrite_local]
# 获取Cookie
https:\/\/maicai\.api\.ddxq\.mobi\/user\/checkLogin url script-request-header iepngs/Script/master/dingdong/index.js


************************
Loon 2.1.0+ 脚本配置:
************************

[Script]
# 叮咚农场
cron "1 8,12,17 * * *" script-path=https://raw.githubusercontent.com/iepngs/Script/master/dingdong/index.js,tag=叮咚养鱼

# 获取Cookie
http-request ^https:\/\/maicai\.api\.ddxq\.mobi\/user\/checkLogin script-path=https://raw.githubusercontent.com/iepngs/Script/master/dingdong/index.js,tag=叮咚农场

**/

const $ = hammer("叮咚农场", 3);

const CookieKey = "CookieDDXQfarm",
    StationIdCookieKey = "CookieDDXQfarmStationId",
    DD_API_HOST = 'https://farm.api.ddxq.mobi/api/v2';

let propsId = "", seedId = "";

const cookie = $.read(CookieKey);
const station_id = $.read(StationIdCookieKey);

function GetCookie() {
    try {
        const StationIdCookieValue = /.*&station_id=(\w+)?&/.exec($request.url)?.[1];
        if ($request.headers && StationIdCookieValue) {
            const CookieValue = $request.headers['Cookie'];
            const cachedCookie = $.read(CookieKey);
            const dynamic = cachedCookie ? (cachedCookie == CookieValue ? "" : "更新") : "写入";
            if(dynamic){
                $.write(StationIdCookieValue, StationIdCookieKey);
                const result = $.write(CookieValue, CookieKey);
                $.log(`CookieKey: ${CookieKey}, CookieValue: ${CookieValue}, read: ` + $.read(CookieKey));
                $.alert(dynamic + (result ? "成功🎉" : "失败"));
            }else{
                $.alert("有一样的cookie在了");
            }
        }
    } catch (error) {
        $.alert("写入失败: 未知错误");
        $.log(error);
    }
    $.done();
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

function fetchMyTask(){
    return new Promise(resolve =>{
        const options = {
            url: `${DD_API_HOST}/task/list?api_version=9.1.0&app_client_id=3&station_id=${station_id}&native_version=&latitude=30.272356&longitude=120.022035&gameId=1`,
            headers: initRequestHeaders()
        }
        $.request("GET", options, (error, response) =>{
            if(error){
                $.log(error)
                return
            }
            response = JSON.parse(response);
            if(response.code){
                $.log(response);
                $.alert(response.msg, "task/list");
                return
            }
            if(response.error){
                $.log(response);
                $.alert(`${response.status}#${response.error}#${response.message}`, "task/list");
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
                $.log(`\n${task.taskName}${desc}\n- 持续天数:${task.continuousDays}\n- 任务状态:${status}\n===========`);
                switch (task.buttonStatus) {
                    case "TO_ACHIEVE":
                        if(["INVITATION", "ANY_ORDER", "POINT_EXCHANGE"].indexOf(task.taskCode) == -1)
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
function taskAchieve(taskCode){
    const options = {
        url: `${DD_API_HOST}/task/achieve?api_version=9.1.0&app_client_id=3&station_id=${station_id}&native_version=&latitude=30.272356&longitude=120.022035&gameId=1&taskCode=${taskCode}`,
        headers: initRequestHeaders()
    }
    $.request("GET", options, (error, response) =>{
        if(error){
            $.log(error)
            return
        }
        response = JSON.parse(response);
        if(response.code){
            $.log(response);
            $.alert(response.msg, `task/achieve?${taskCode}`);
            return
        }
        if (response.data.taskStatus == "ACHIEVED") {
            const userTaskLogId = response.data?.userTaskLogId;
            if(userTaskLogId){
                taskReward(userTaskLogId);
            }else{
                const amount = response.data.rewards.amount;
                // if(taskCode == "LOTTERY"){
                    // $.alert(`本时段三餐开福袋已领取：${amount}g`);
                // }else{
                    $.log(`任务完成，获得饲料：${amount}g`);
                // }
            }
        }
    })
}

// 有任务编号的领取奖励
function taskReward(userTaskLogId){
    const options = {
        url: `${DD_API_HOST}/task/reward?api_version=9.1.0&app_client_id=3&station_id=${station_id}&native_version=&latitude=30.272356&longitude=120.022035&gameId=1&userTaskLogId=${userTaskLogId}`,
        headers: initRequestHeaders()
    }
    $.request("GET", options, (error, response) =>{
        if(error){
            $.log(error)
            return
        }
        response = JSON.parse(response);
        if(response.code){
            $.log(response);
            $.alert(response.msg, "task/reward");
            return
        }
        $.log(`任务完成，获得饲料：${response.data.rewards.amount}g`);
        $.log(response);
    })
}

function FreshCray(data){
    if(!Object.keys(data).includes("crayResponseVo")){
        return false;
    }
    const crv = data.crayResponseVo;
    if(!crv || typeof(crv) != "object"){
        $.log(data.crayResponseVo)
        return false;
    }
    const fields = ["crayGuide", "crayVo", "receiveStartTime", "feedStartTime", "feedEndTime", "feedToExchange"];
    for (const field of fields) {
        if(!Object.keys(crv).includes(field)){
            return false;
        }
    }
    if(crv.feedToExchange){
        // 可能是兑换时间之类
        return false;
    }
    const nowTs = (new Date()).getTime();
    if(nowTs < crv.receiveStartTime || nowTs < crv.feedStartTime || nowTs > crv.feedEndTime){
        return false;
    }
    if(crv.crayGuide.isCompleted && crv.crayVo && typeof crv.crayVo == "object" && Object.keys(crv.crayVo).includes("seedId")){
        return crv.crayVo;
    }
    return false;
}

function fishpond() {
    $.log('正在获取鱼池信息…');
    return new Promise(resolve => {
        const options = {
            url: `${DD_API_HOST}/userguide/detail?api_version=9.1.0&app_client_id=3&station_id=${station_id}&native_version=&latitude=30.272356&longitude=120.022035&gameId=1&guideCode=FISHPOND_V1`,
            headers: initRequestHeaders()
        };        
        $.request("GET", options, (error, response) =>{
            if(error){
                $.log(error);
                return resolve(false);
            }
            response = JSON.parse(response);
            if(response.code){
                $.log(response);
                $.alert(response.msg, "userguide/detail");
                return resolve(false);
            }
            const data = response.data;
            const cray = FreshCray(data);
            const pet = cray ? cray : data.baseSeed;
            const petName = cray ? "小龙虾" : "鱼";
            if(pet.expPercent >= 100){
                $.alert(`去看看,${petName}应该已经养活了`, "userguide/detail");
                if(!cray){
                    return resolve(false);
                }
                // 龙虾完事继续养鱼
            }
            propsId = data.feed.propsId;
            const amount = data.feed.amount;
            $.log(`当前饲料剩余:${amount}g,${pet.msg}`);
            if(amount < 10){
                $.alert("饲料不够，下次再喂吧。");
                return resolve(false);
            }
            seedId = pet.seedId;
            $.log(`准备开始喂${petName}啦`);
            resolve(true);
        })
    })
}

function propsFeed(i){
    return new Promise(resolve => {
        const options = {
            url: `${DD_API_HOST}/props/feed?api_version=9.1.0&app_client_id=3&station_id=${station_id}&native_version=&latitude=30.272356&longitude=120.022035&gameId=1&propsId=${propsId}&seedId=${seedId}`,
            headers: initRequestHeaders()
        };
        $.log(`第${i}次喂食`);
        $.request("GET", options, (error, response) => {
            if(error){
                $.log(error);
                return resolve(false);
            }
            response = JSON.parse(response);
            if(response.code){
                $.log(response);
                (response.code == 800) || $.alert(response.msg, "props/feed");
                return resolve(false);
            }
            const data = response.data;
            $.log(data.msg);
            const remain = data.props.amount;
            const description = `剩余饲料: ${remain}g, 进度: ${data.seed.expPercent}`;
            $.log(description);
            if(remain < 10){
                $.alert(description, `今天喂了${i}次，现在饲料不够了`);
                return resolve(false);
            }
            setTimeout(()=>{
                resolve(true);
            }, Math.floor(Math.random()*1500));
        })
    })
}

$.isRequest ? GetCookie() : (async function(){
    if(!cookie){
        return $.alert("cookie不存在，先去获取吧");
    }

    await fetchMyTask();
    $.log(`任务部分结束。`);

    if(await fishpond()){
        let index = 1;
        while(await propsFeed(index)){
            index++;
        }
    }
    $.done();
})().catch(err => {$.log(`🙅 运行异常: ${err}`) && $.done()});

function hammer(t="untitled",l=3){return new class{constructor(t,l){this.name=t,this.logLevel=l,this.isRequest=("object"==typeof $request)&&$request.method!="OPTIONS",this.isSurge="undefined"!=typeof $httpClient,this.isQuanX="undefined"!=typeof $task,this.isNode="function"==typeof require,this.node=(()=>{if(!this.isNode){return null}const file="localstorage.yml";let f,y,r,yc,sc;try{f=require('fs');y=require('js-yaml');r=require('got');f.appendFile(file,"",function(err){if(err)throw err;});yc=y.load(f.readFileSync(file,"utf8"));sc=data=>f.writeFileSync(file,y.safeDump(data),'utf8')}catch(e){console.log("install unrequired module, example: yarn add js-yaml got");console.log(e.message);return{}}return{file:file,fs:f,yaml:y,request:r,yamlContents:yc,saveYamlContents:sc,}})()}log(...n){if(l<2){return null}for(let i in n){const ct=typeof n[i]=="object"?eval(`(${JSON.stringify(n[i])})`):n[i];console.log(`\n***********${this.name}***********\n${ct}`)}}alert(body="",subtitle="",options={}){if(l==2||l==0){return null}if(typeof options=="string"){options={"open-url":options}}let link={};if(Object.keys(options).length){link=this.isQuanX?options:{openUrl:options["open-url"],mediaUrl:options["media-url"]}}if(this.isSurge)return $notification.post(this.name,subtitle,body,link);if(this.isQuanX)return $notify(this.name,subtitle,body,link);console.log(`系统通知\ntitle:${this.name}\nsubtitle:${subtitle}\nbody:${body}\nlink:${link}`)}async request(method,params,callback){let options={};if(typeof params=="string"){options.url=params}else{options.url=params.url;if(typeof params=="object"){params.headers&&(options.headers=params.headers);params.body&&(options.body=params.body)}}if(!options.headers||typeof(options.headers)!="object"){options['headers']={}}if(!options.headers||(!Object.keys(options.headers).includes("User-Agent")&&!Object.keys(options.headers).includes("aser-agent"))){const ua='Mozilla%2F5.0%20(iPhone%3B%20CPU%20iPhone%20OS%2013_2_3%20like%20Mac%20OS%20X)%20AppleWebKit%2F605.1.15%20(KHTML%2C%20like%20Gecko)%20Version%2F13.0.3%20Mobile%2F15E148%20Safari%2F604.1';options['headers']['User-Agent']=decodeURIComponent(ua)}method=method.toUpperCase();const writeRequestErrorLog=function(n,m,u){return err=>console.log(`${n}request error:\n${m}${u}\n${err}`)}(this.name,method,options.url);if(this.isSurge){const _runner=method=="GET"?$httpClient.get:$httpClient.post;return _runner(options,(error,response,body)=>{if(error==null||error==""){response.body=body;callback("",body,response)}else{writeRequestErrorLog(error);callback(error,"",response)}})}options.method=method;if(this.isQuanX){$task.fetch(options).then(response=>{response.status=response.statusCode;delete response.statusCode;callback("",response.body,response)},reason=>{writeRequestErrorLog(reason.error);response.status=response.statusCode;delete response.statusCode;callback(reason.error,"",response)})}if(this.isNode){method=options.method.toLowerCase();const hc=this.node.request[method];if(typeof(hc)!="function"){return callback(`unsupport request method ${options.method}in got`)}let ro={responseType:"text",};if(options.headers){ro.headers=options.headers}if(options.body){ro.body=(options.body&&typeof(options.body)=="object")?JSON.stringify(options.body):options.body}if(params.option){const ks=Object.keys(params.option);for(const k of ks){ro[k]=params.option[k]}}let error="",body="",response={};try{response=await hc(options.url,ro);body=response.body;response={status:response.statusCode,headers:response.headers,body:body,}}catch(e){error=`${e.name}:${e.message}`}callback(error,body,response)}}read(key){if(this.isSurge)return $persistentStore.read(key);if(this.isQuanX)return $prefs.valueForKey(key);if(this.isNode){let val="";try{const data=this.node.yamlContents;val=(typeof(data)=="object"&&data[key])?data[key]:""}catch(e){console.log(`读取文件时错误:\n${e.message}`);return""}return val}}write(val,key){if(this.isSurge)return $persistentStore.write(val,key);if(this.isQuanX)return $prefs.setValueForKey(val,key);if(this.isNode){try{const data=this.node.yamlContents;data=typeof data=="object"?data:{};data[key]=val;this.node.saveYamlContents(data)}catch(e){console.log(e.message);return false}return true}}delete(key){if(this.isSurge)return $persistentStore.remove(key);if(this.isQuanX)return $prefs.removeValueForKey(key);if(this.isNode){try{const data=this.node.yamlContents;data=typeof data=="object"?data:{};if(!data.hasOwnProperty(key)){return true}delete data[key];this.node.saveYamlContents(data)}catch(e){console.log(e.message);return false}return true}}done(value={}){if(this.isQuanX)return $done(value);if(this.isSurge)return this.isRequest?$done(value):$done()}pad(s=false,c="*",l=15){return s?this.log(c.padEnd(l,c)):`\n${c.padEnd(l,c)}\n`}}(t,l)}
