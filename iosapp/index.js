
// cron "40 10,17 * * *" script-path=https://raw.githubusercontent.com/iepngs/Script/master/iosapp/index.js,tag=iOS限免监控

//-------------------------------------------------------------------------
// 监控的应用链接
const apps = [
    "https://apps.apple.com/cn/app/alook%E6%B5%8F%E8%A7%88%E5%99%A8-2%E5%80%8D%E9%80%9F/id1261944766",
    "https://apps.apple.com/us/app/shadowrocket/id932747118",
    "https://apps.apple.com/cn/app/notability/id736189492",
    "https://apps.apple.com/cn/app/shu-%E6%96%87%E4%BB%B6%E9%A2%84%E8%A7%88/id1282297037",
];
// 无限免应用是否通知,1通知 0不通知
const notice = 1;
//-------------------------------------------------------------------------

const $ = new hammer("iOS限免监控", 3);
let inventories = {
    free: [],
    charge: [],
};

function monitor(app){
    return new Promise(async resolve => {
        const matcher = /com\/(\w+)\/app\/.*\/id(\d+)$/.exec(app.split("?")[0]);
        if(matcher.length != 3){
            $.alert(app, "应用链接格式不对");
            return resolve();
        }
        const link = `https://itunes.apple.com/lookup?id=${matcher[2]}&country=${matcher[1]}`;
        await $.request('get', link, (error, response, data) => {
            if(error){
                $.log(error);
                return resolve();
            }
            response = JSON.parse(response);
            const result = response.results[0];
            if(result.price == 0.00){
                scpush(`${result.trackName}今日限免`, `速点击查看下载（注意商店地区）:\n${result.trackViewUrl}`);
                $.alert('速点击查看下载（注意商店地区）', `${result.trackName}今日限免`, result.trackViewUrl);
                inventories.free.push(result.trackName);
                return resolve();
            }
            inventories.charge.push(`${result.trackName} - ${result.formattedPrice}`);
            resolve();
        });
    })
}

function fmt(arr){
    return arr.length ? arr.join("\n") : "无";
}

(async function(){
    await Promise.all(apps.map(async app => await monitor(app)));
    let detail = `左滑查看今日监控的应用清单：\n\n`;
    detail += `今日限免${inventories.free.length}款:\n${fmt(inventories.free)}\n`
    detail += `其余${inventories.charge.length}款售价:\n${fmt(inventories.charge)}`;
    notice && $.alert(detail);
    $.log(notice);
    $.done();
})()


// util tool
function hammer(t="untitled",l=1){return new class{constructor(t,l){this.name=t,this.logLevel=l,this.isRequest="undefined"!=typeof $request,this.isSurge="undefined"!=typeof $httpClient,this.isQuanX="undefined"!=typeof $task,this.isNode="function"==typeof require,this.node=(()=>{if(!this.isNode){return null}const file="localstorage.yaml";let f,y,r;try{f=require('fs');y=require('js-yaml');r=require('request');f.appendFile(file,"",function(err){if(err)throw err;})}catch(e){console.log("install unrequired module by: yarn add module_name");console.log(e.message);return{}}return{file:file,fs:f,yaml:y,request:r,}})()}log(...n){if(l<2){return null}console.log(`\n***********${this.name}***********`);for(let i in n)console.log(n[i])}alert(body="",subtitle="",options={}){if(l==2||l==0){return null}let link=null;switch(typeof options){case"string":link=this.isQuanX?{"open-url":options}:options;break;case"object":if(["null","{}"].indexOf(JSON.stringify(options))==-1){link=this.isQuanX?options:options["open-url"];break}default:link=this.isQuanX?{}:""}if(this.isSurge)return $notification.post(this.name,subtitle,body,link);if(this.isQuanX)return $notify(this.name,subtitle,body,link);console.log(`系统通知📣\ntitle:${this.name}\nsubtitle:${subtitle}\nbody:${body}\nlink:${link}`)}request(method,params,callback){let options={};if(typeof params=="string"){options.url=params}else{options.url=params.url;if(typeof params=="object"){params.headers&&(options.headers=params.headers);params.body&&(options.body=params.body)}}method=method.toUpperCase();const writeRequestErrorLog=function(m,u){return err=>console.log(`${this.name}request error:\n${m}${u}`,err)}(method,options.url);if(this.isSurge){const _runner=method=="GET"?$httpClient.get:$httpClient.post;return _runner(options,(error,response,body)=>{if(error==null||error==""){response.body=body;callback("",body,response)}else{writeRequestErrorLog(error);callback(error,"",response)}})}options.method=method;if(this.isQuanX){$task.fetch(options).then(response=>{response.status=response.statusCode;delete response.statusCode;callback("",response.body,response)},reason=>{writeRequestErrorLog(reason.error);response.status=response.statusCode;delete response.statusCode;callback(reason.error,"",response)})}if(this.isNode){if(options.method=="POST"&&options.body){try{options.body=JSON.parse(options.body);options.json=true}catch(e){console.log(e.message)}}this.node.request(options,(error,response,body)=>{if(typeof body=="object"){body=JSON.stringify(body)}if(typeof response=='object'&&response){response.status=response.statusCode;delete response.statusCode}callback(error,body,response)})}}read(key){if(this.isSurge)return $persistentStore.read(key);if(this.isQuanX)return $prefs.valueForKey(key);if(this.isNode){let val="";try{const fileContents=this.node.fs.readFileSync(this.node.file,"utf8");const data=this.node.yaml.safeLoad(fileContents);val=(typeof(data)=="object"&&data[key])?data[key]:""}catch(e){console.log(`读取文件时错误:\n${e.message}`);return""}return val}}write(val,key){if(this.isSurge)return $persistentStore.write(val,key);if(this.isQuanX)return $prefs.setValueForKey(val,key);if(this.isNode){try{const fileContents=this.node.fs.readFileSync(this.node.file,"utf8");let data=this.node.yaml.safeLoad(fileContents);data=typeof data=="object"?data:{};data[key]=val;val=this.node.yaml.safeDump(data);this.node.fs.writeFileSync(this.node.file,val,'utf8')}catch(e){console.log(e.message);return false}return true}}delete(key){if(this.isNode){try{const fileContents=this.node.fs.readFileSync(this.node.file,"utf8");let data=this.node.yaml.safeLoad(fileContents);data=typeof data=="object"?data:{};if(!data.hasOwnProperty(key)){return true}delete data[key];const val=this.node.yaml.safeDump(data);this.node.fs.writeFileSync(this.node.file,val,'utf8')}catch(e){console.log(e.message);return false}return true}}done(value={}){if(this.isQuanX)return this.isRequest?$done(value):null;if(this.isSurge)return this.isRequest?$done(value):$done()}pad(s=false,c="*",l=15){return s?this.log(c.padEnd(l,c)):`\n${c.padEnd(l,c)}\n`}}(t,l)}