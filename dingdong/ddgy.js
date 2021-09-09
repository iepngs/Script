/**
叮咚果园

说明：
叮咚买菜App - 右下角“我的”- 叮咚果园 进入后浇水一次即可获取cookie(种新树需要重新捕获一次)

************************
[Mitm]
************************
hostname = farm.api.ddxq.mobi


************************
QuantumultX 本地脚本配置:
************************

[task_local]
# 叮咚果园
1 8,12,17 * * * iepngs/Script/master/dingdong/ddgy.js

[rewrite_local]
# 获取Cookie
https:\/\/farm\.api\.ddxq\.mobi\/api\/v2\/props\/feed url script-request-header iepngs/Script/master/dingdong/ddgy.js


************************
Loon 2.1.0+ 脚本配置:
************************

[Script]
# 叮咚果园
cron "1 8,11,17 * * *" script-path=https://raw.githubusercontent.com/iepngs/Script/master/dingdong/ddgy.js,tag=叮咚果园

# 获取Cookie
http-request ^https:\/\/farm\.api\.ddxq\.mobi\/api\/v2\/props\/feed script-path=https://raw.githubusercontent.com/iepngs/Script/master/dingdong/ddgy.js,tag=叮咚果园

***********************
Nodejs
***********************
export DDFruitFarm = {"station_id":"抓包获得"","uid":"抓包获得"","seedId":"抓包获得","propsId":"抓包获得","cookie":"抓包获得"}
如：export DDFruitFarm = {"station_id":"5de89c8d26c3d","uid":"5d7ccfda7e48","seedId":"2108272230","propsId":"21082722","cookie":"DDXQSESSID=f3ccf95fb545f7"}
**/

const $ = hammer("叮咚果园", 3);

const CookieKey = "DDFruitFarm",
    DD_API_HOST = 'https://farm.api.ddxq.mobi/api/v2';

let CookieValue = $.read(CookieKey);
CookieValue = CookieValue ? CookieValue : (($.isNode && process.env[CookieKey]) ? process.env[CookieKey] : '');
CookieContents = CookieValue ? JSON.parse(CookieValue) : {};
const {station_id, uid, seedId, propsId} = CookieContents;

function GetCookie() {
    // https://farm.api.ddxq.mobi/api/v2/props/feed?api_version=9.1.0&app_client_id=1&station_id=5de89&native_version=&uid=5dc&latitude=31.292&longitude=121.425&propsCode=FEED&seedId=210&propsId=210
    let ur = $request.url.split('?');
    ur.shift();
    ur = ur.join('?').split('&');
    const keys = Object.keys(CookieContents);
    for (const u of ur) {
        let pv = u.split('=');
        const k = pv.shift();
        if (!keys.includes(k)) {
            continue;
        }
        CookieContents[k] = pv.join('=');
    }
    CookieContents.cookie = $request.headers.Cookie;
    for (const k of keys) {
        if(!CookieContents[k]){
            return $.done();
        }
    }
    CookieValue = JSON.stringify(CookieContents);
    const result = $.write(CookieValue, CookieKey);
    $.alert(result ? "Cookie已写入" : "Cookie已捕获但写入失败");
    return $.done();
}

const initRequestHeaders = function() {
    return {
        "Host": "farm.api.ddxq.mobi",
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": "https://orchard-m.ddxq.mobi",
        "Accept-Encoding": "gzip, deflate, br",
        "Cookie": CookieContents.cookie,
        "Connection": "keep-alive",
        "Accept": "*/*",
        "User-Agent": `Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 xzone/9.31.1 station_id/${station_id}`,
        "Referer": "https://orchard-m.ddxq.mobi/?is_nav_hide=true&s=mine_orchard",
        "Accept-Language": "zh-cn",
        "DDMC-GAME-TID": "2",
    };
};

function fetchMyTask(){
    return new Promise(resolve =>{
        const options = {
            url: `${DD_API_HOST}/task/list?api_version=9.1.0&app_client_id=1&station_id=${station_id}&native_version=&app_version=9.31.1&uid=${uid}&latitude=30.272356&longitude=120.022035&gameId=1&cityCode=0901`,
            headers: initRequestHeaders()
        }
        $.request("GET", options, async (error, response) =>{
            if(error){
                $.log(error)
                return resolve();
            }
            response = JSON.parse(response);
            if(response.code){
                $.log(response);
                $.alert(response.msg, "task/list");
                return resolve();
            }
            if(response.error){
                $.log(response);
                $.alert(`${response.status}#${response.error}#${response.message}`, "task/list");
                return resolve();
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
                if(["INVITATION", "POINT_EXCHANGE", "LUCK_DRAW"].includes(task.taskCode)){
                    continue;
                }
                const desc = task.taskDescription[0] ? `:${task.taskDescription[0]}` : "";
                const status = taskStatus[task.buttonStatus] ? taskStatus[task.buttonStatus] : (task.buttonStatus ? task.buttonStatus : "未知");
                switch (task.buttonStatus) {
                    case "TO_ACHIEVE":
                        if(["ANY_ORDER", "BUY_GOODS", "MULTI_ORDER"].includes(task.taskCode)){
                            continue;
                        }
                        console.log(`\n${task.taskName}(${task.taskCode})${desc}\n- 持续天数:${task.continuousDays}\n- 任务状态:${status}`);
                        await taskAchieve(task.taskCode);
                        break;
                    case "TO_REWARD":
                        task.userTaskLogId && await taskReward(task.userTaskLogId);
                        break;
                }
            }
            resolve();
        })
    });
}

// 做任务
function taskAchieve(taskCode){
    return new Promise(resolve =>{
        const options = {
            url: `${DD_API_HOST}/task/achieve?api_version=9.28.0&env=PE&app_client_id=3&station_id=${station_id}&native_version=9.31.1&h5_source=&page_type=2&gameId=2&city_number=0901&uid=${uid}&latitude=30.272356&longitude=120.022035&taskCode=${taskCode}`,
            headers: initRequestHeaders()
        }
        $.request("GET", options, async (error, response) =>{
            if(error){
                $.log(error)
                return resolve();
            }
            response = JSON.parse(response);
            if(response.code){
                $.log(response);
                $.alert(response.msg, `task/achieve?${taskCode}`);
                return resolve();
            }
            if (response.data.taskStatus == "ACHIEVED") {
                const userTaskLogId = response.data.hasOwnProperty("userTaskLogId")?response.data.userTaskLogId:null;
                if(userTaskLogId){
                    await taskReward(userTaskLogId);
                    return resolve();
                }
            }
            await showReward(response.data.rewards);
            resolve();
        })
    })
}

// 有任务编号的领取奖励
function taskReward(userTaskLogId){
    return new Promise(resolve => {
        const options = {
            url: `${DD_API_HOST}/task/reward?api_version=9.1.0&app_client_id=1&station_id=${station_id}&native_version=&latitude=30.272356&longitude=120.022035&gameId=1&userTaskLogId=${userTaskLogId}&uid=${uid}`,
            headers: initRequestHeaders()
        }
        $.request("GET", options, async (error, response) =>{
            if(error){
                $.log(error)
                return resolve();
            }
            response = JSON.parse(response);
            if(response.code){
                $.log(response);
                $.alert(response.msg, "task/reward");
                return resolve();
            }
            await showReward(response.data.rewards);
            resolve();
        })
    })
}


function showReward(data){
    return new Promise(resolve => {
        let amount = {fr:0, fd:0};
        for (const reward of data) {
            switch (reward.rewardCode) {
                case 'FERTILIZER':
                    amount.fr += reward.amount;
                    break;
                case 'FEED':
                    amount.fd += reward.amount;
                default:
                    break;
            }
        }
        // if(taskCode == "LOTTERY"){
            // $.alert(`本时段三餐开福袋已领取：${amount}g`);
        // }else{
            console.log(`任务完成，获得水滴：${amount.fd}g, 肥料：${amount.fr}g`);
        // }
        resolve();
    })
}

function fruitTreeSeed(i){
    return new Promise(resolve => {
        const options = {
            url: `${DD_API_HOST}/props/feed?api_version=9.1.0&app_client_id=1&station_id=${station_id}&native_version=&uid=${uid}&latitude=30.272356&longitude=120.022035&propsCode=FEED&seedId=${seedId}&propsId=${propsId}`,
            headers: initRequestHeaders()
        };
        console.log(`第${i}次浇水`);
        $.request("GET", options, (error, response) => {
            if(error){
                $.log(error);
                return resolve(false);
            }
            response = JSON.parse(response);
            if(response.code){
                console.log(response.msg);
                (response.code == 800) || $.alert(response.msg);
                return resolve(false);
            }
            const data = response.data;
            let treeName = data.seed.speciesCode.split('_')[0];
            if(data.seed.expPercent >= 100){
                $.alert(`去看看,${treeName}应该已经成熟了`);
                return resolve(false);
            }
            const remain = data.feed.amount;
            const description = `剩余水滴: ${remain}g, 肥料: ${data.fertilizer.amount}g(当前肥力：${data.fertilizerUse.amount}g),进度: ${data.seed.expPercent}, ${data.msg}`;
            console.log(description);
            if(remain < 10){
                $.alert(description, `今天浇了${i}次，现在水滴不够了`);
                return resolve(false);
            }
            setTimeout(()=>{
                resolve(true);
            }, Math.floor(Math.random()*1500));
        })
    })
}

$.isRequest ? GetCookie() : (async function(){
    if(!CookieContents.cookie){
        $.alert("cookie不存在，先去获取吧(浇一次水)");
        return $.done();
    }
    await fetchMyTask();
    console.log(`\n任务做完开始浇水\n`);
    let index = 1;
    while(await fruitTreeSeed(index)){
        index++;
    }
    $.done();
})().catch(err => {$.log(`🙅 运行异常: ${err}`) && $.done()});

function hammer(t="untitled",l=3){return new class{constructor(t,l){this.name=t,this.logLevel=l,this.isRequest=("object"==typeof $request)&&$request.method!="OPTIONS",this.isSurge="undefined"!=typeof $httpClient,this.isQuanX="undefined"!=typeof $task,this.isNode="function"==typeof require,this.node=(()=>{if(!this.isNode){return null}const file="localstorage.yml";let f,y,r,yc,sc;try{f=require('fs');y=require('js-yaml');r=require('got');f.appendFile(file,"",function(err){if(err)throw err;});yc=y.load(f.readFileSync(file,"utf8"));sc=data=>f.writeFileSync(file,y.safeDump(data),'utf8')}catch(e){console.log(e.message);console.log("install unrequired module, example: yarn add js-yaml got");return{}}return{file:file,fs:f,yaml:y,request:r,yamlContents:yc,saveYamlContents:sc,}})()}log(...n){if(l<2){return null}for(let i in n){const ct=typeof n[i]=="object"?eval(`(${JSON.stringify(n[i])})`):n[i];console.log(`\n***********${this.name}***********\n${ct}`)}}alert(body="",subtitle="",options={}){if(l==2||l==0){return null}body=`${body}`;if(typeof options=="string"){options={"open-url":options}}let link={};if(Object.keys(options).length){link=this.isQuanX?options:{openUrl:options["open-url"],mediaUrl:options["media-url"]}}if(this.isSurge)return $notification.post(this.name,subtitle,body,link);if(this.isQuanX)return $notify(this.name,subtitle,body,link);console.log(`系统通知\ntitle:${this.name}\nsubtitle:${subtitle}\nbody:${body}\nlink:${link}`)}async request(method,params,callback){let options={};if(typeof params=="string"){options.url=params}else{options.url=params.url;if(typeof params=="object"){params.headers&&(options.headers=params.headers);params.body&&(options.body=params.body)}}if(!options.headers||typeof(options.headers)!="object"){options['headers']={}}if(!options.headers||(!Object.keys(options.headers).includes("User-Agent")&&!Object.keys(options.headers).includes("aser-agent"))){const ua='Mozilla%2F5.0%20(iPhone%3B%20CPU%20iPhone%20OS%2013_2_3%20like%20Mac%20OS%20X)%20AppleWebKit%2F605.1.15%20(KHTML%2C%20like%20Gecko)%20Version%2F13.0.3%20Mobile%2F15E148%20Safari%2F604.1';options['headers']['User-Agent']=decodeURIComponent(ua)}method=method.toUpperCase();const writeRequestErrorLog=function(n,m,u){return err=>console.log(`${n}request error:\n${m}${u}\n${err}`)}(this.name,method,options.url);if(this.isSurge){const _runner=method=="GET"?$httpClient.get:$httpClient.post;return _runner(options,(error,response,body)=>{if(error==null||error==""){response.body=body;callback("",body,response)}else{writeRequestErrorLog(error);callback(error,"",response)}})}options.method=method;if(this.isQuanX){$task.fetch(options).then(response=>{response.status=response.statusCode;delete response.statusCode;callback("",response.body,response)},reason=>{writeRequestErrorLog(reason.error);response.status=response.statusCode;delete response.statusCode;callback(reason.error,"",response)})}if(this.isNode){method=options.method.toLowerCase();const hc=this.node.request[method];if(typeof(hc)!="function"){return callback(`unsupport request method ${options.method}in got`)}let ro={responseType:"text",};if(options.headers){ro.headers=options.headers}if(options.body){ro.body=(options.body&&typeof(options.body)=="object")?JSON.stringify(options.body):options.body}if(params.option){const ks=Object.keys(params.option);for(const k of ks){ro[k]=params.option[k]}}let error="",body="",response={};try{response=await hc(options.url,ro);body=response.body;response={status:response.statusCode,headers:response.headers,body:body,}}catch(e){error=`${e.name}:${e.message}`}callback(error,body,response)}}read(key){if(this.isSurge)return $persistentStore.read(key);if(this.isQuanX)return $prefs.valueForKey(key);if(this.isNode){let val="";try{const data=this.node.yamlContents;val=(typeof(data)=="object"&&data[key])?(typeof(data[key])=='object'?JSON.stringify(data[key]):data[key]):""}catch(e){console.log(`读取文件时错误:\n${e.message}`);return""}return val}}write(val,key){if(this.isSurge)return $persistentStore.write(val,key);if(this.isQuanX)return $prefs.setValueForKey(val,key);if(this.isNode){try{const data=this.node.yamlContents;data=typeof data=="object"?data:{};data[key]=val;this.node.saveYamlContents(data)}catch(e){console.log(e.message);return false}return true}}delete(key){if(this.isSurge)return $persistentStore.remove(key);if(this.isQuanX)return $prefs.removeValueForKey(key);if(this.isNode){try{const data=this.node.yamlContents;data=typeof data=="object"?data:{};if(!data.hasOwnProperty(key)){return true}delete data[key];this.node.saveYamlContents(data)}catch(e){console.log(e.message);return false}return true}}done(value={}){if(this.isQuanX)return $done(value);if(this.isSurge)return this.isRequest?$done(value):$done()}pad(s=false,c="*",l=15){return s?this.log(c.padEnd(l,c)):`\n${c.padEnd(l,c)}\n`}}(t,l)}
