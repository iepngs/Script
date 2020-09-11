// 快手极速版签到
// app下载⏬：https://nbic2zwnf.kwairr9aw56vso581r.com/f/Yzcsl79n_AO

// Task:
// cron "15 9 * * *" script-path=https://raw.githubusercontent.com/iepngs/Script/master/ks/index.js,tag=快手极速版签到,enable=true

// Script: 
// http-request ^https:\/\/nebula\.kuaishou\.com\/rest\/n\/nebula\/sign\/sign script-path=https://raw.githubusercontent.com/iepngs/Script/master/ks/index.js,tag=快手极速版签到,enabled=true

// MITM: nebula.kuaishou.com

const Protagnist = '快手极速版';
const $hammer = new hammer(Protagnist);

const KsCookieKey = 'ksCookie';
let KsCookieVal = '';

function GetCookie(){
    KsCookieVal = $request.headers.Cookie;
    $hammer.write(KsCookieVal, KsCookieKey);
    $hammer.alert("Cookie已捕获");
    $hammer.done();
}

function DailySign(){
    KsCookieVal = KsCookieVal || $hammer.read(KsCookieKey);
    if(!KsCookieVal){
        $hammer.log("Cookie不存在");
        return $hammer.done();
    }
    const options = {
        url: 'https://nebula.kuaishou.com/rest/n/nebula/sign/sign?source=popup',
        headers: {
            'Cookie': KsCookieVal,
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 ksNebula/2.3.2.78',
            'Referer': 'https://nebula.kuaishou.com/nebula/task/earning?source=timer&layoutType=4&hyId=nebula_earning'
        }
    };
    $hammer.request('get', options, (error, response, data) => {
        if(error){
            $hammer.log(`request error:\n ${error}`);
            return $hammer.done();
        }
        response = JSON.parse(response);
        if(response.result != 1 || response.data.status != 2){
            $hammer.log(`响应解析异常: \n${response}`);
            return $hammer.done();
        }
        const content = `${response.data.nebulaSignInPopup.subTitle},剩余金币：${response.data.totalCoin}`;
        $hammer.alert(content, response.data.nebulaSignInPopup.title);
        $hammer.done();
    })
}

$hammer.isRequest ? GetCookie() : DailySign();

function hammer(t="untitled",l=1){return new class{constructor(t,l){this.name=t,this.logLevel=l,this.isRequest="undefined"!=typeof $request,this.isSurge="undefined"!=typeof $httpClient,this.isQuanX="undefined"!=typeof $task,this.isNode="function"==typeof require,this.node=(()=>{if(!this.isNode){return null}const file="localstorage.yaml";let f,y,r;try{f=require('fs');y=require('js-yaml');r=require('request');f.appendFile(file,"",function(err){if(err)throw err;})}catch(e){console.log("install unrequired module by: yarn add module_name");console.log(e.message);return{}}return{file:file,fs:f,yaml:y,request:r,}})()}log(...n){if(l<2){return null}console.log(`\n***********${this.name}***********`);for(let i in n)console.log(n[i])}alert(body="",subtitle="",options={}){if(l==2||l==0){return null}let link=null;switch(typeof options){case"string":link=this.isQuanX?{"open-url":options}:options;break;case"object":if(["null","{}"].indexOf(JSON.stringify(options))==-1){link=this.isQuanX?options:options["open-url"];break}default:link=this.isQuanX?{}:""}if(this.isSurge)return $notification.post(this.name,subtitle,body,link);if(this.isQuanX)return $notify(this.name,subtitle,body,link);console.log(`系统通知📣\ntitle:${this.name}\nsubtitle:${subtitle}\nbody:${body}\nlink:${link}`)}request(method,params,callback){let options={};if(typeof params=="string"){options.url=params}else{options.url=params.url;if(typeof params=="object"){params.headers&&(options.headers=params.headers);params.body&&(options.body=params.body)}}method=method.toUpperCase();const writeRequestErrorLog=function(m,u){return err=>console.log(`${this.name}request error:\n${m}${u}`,err)}(method,options.url);if(this.isSurge){const _runner=method=="GET"?$httpClient.get:$httpClient.post;return _runner(options,(error,response,body)=>{if(error==null||error==""){response.body=body;callback("",body,response)}else{writeRequestErrorLog(error);callback(error,"",response)}})}options.method=method;if(this.isQuanX){$task.fetch(options).then(response=>{response.status=response.statusCode;delete response.statusCode;callback("",response.body,response)},reason=>{writeRequestErrorLog(reason.error);response.status=response.statusCode;delete response.statusCode;callback(reason.error,"",response)})}if(this.isNode){if(options.method=="POST"&&options.body){try{options.body=JSON.parse(options.body);options.json=true}catch(e){console.log(e.message)}}this.node.request(options,function(error,response,body){response.status=response.statusCode;delete response.statusCode;callback(error,typeof body=="objecet"?JSON.stringify(body):body,response)})}}read(key){if(this.isSurge)return $persistentStore.read(key);if(this.isQuanX)return $prefs.valueForKey(key);if(this.isNode){let val="";try{const fileContents=this.node.fs.readFileSync(this.node.file,"utf8");const data=this.node.yaml.safeLoad(fileContents);val=(typeof(data)=="object"&&data[key])?data[key]:""}catch(e){console.log(`读取文件时错误:\n${e.message}`);return""}return val}}write(val,key){if(this.isSurge)return $persistentStore.write(val,key);if(this.isQuanX)return $prefs.setValueForKey(val,key);if(this.isNode){try{const fileContents=this.node.fs.readFileSync(this.node.file,"utf8");let data=this.node.yaml.safeLoad(fileContents);data=typeof data=="object"?data:{};data[key]=val;val=this.node.yaml.safeDump(data);this.node.fs.writeFileSync(this.node.file,val,'utf8')}catch(e){console.log(e.message);return false}return true}}delete(key){if(this.isNode){try{const fileContents=this.node.fs.readFileSync(this.node.file,"utf8");let data=this.node.yaml.safeLoad(fileContents);data=typeof data=="object"?data:{};if(!data.hasOwnProperty(key)){return true}delete data[key];const val=this.node.yaml.safeDump(data);this.node.fs.writeFileSync(this.node.file,val,'utf8')}catch(e){console.log(e.message);return false}return true}}done(value={}){if(this.isQuanX)return this.isRequest?$done(value):null;if(this.isSurge)return this.isRequest?$done(value):$done()}pad(s=false,c="*",l=15){return s?this.log(c.padEnd(l,c)):`\n${c.padEnd(l,c)}\n`}}(t,l)}