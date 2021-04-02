const $ = hammer("钉钉打卡提醒", 3);

// 数据来源：https://github.com/NateScarlet/holiday-cn
// https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/2020.json
const cnHoliday = {
    "2021": [{"name":"清明节","date":"2021-04-03","isOffDay":true},{"name":"清明节","date":"2021-04-04","isOffDay":true},{"name":"清明节","date":"2021-04-05","isOffDay":true},{"name":"劳动节","date":"2021-04-25","isOffDay":false},{"name":"劳动节","date":"2021-05-01","isOffDay":true},{"name":"劳动节","date":"2021-05-02","isOffDay":true},{"name":"劳动节","date":"2021-05-03","isOffDay":true},{"name":"劳动节","date":"2021-05-04","isOffDay":true},{"name":"劳动节","date":"2021-05-05","isOffDay":true},{"name":"劳动节","date":"2021-05-08","isOffDay":false},{"name":"端午节","date":"2021-06-12","isOffDay":true},{"name":"端午节","date":"2021-06-13","isOffDay":true},{"name":"端午节","date":"2021-06-14","isOffDay":true},{"name":"中秋节","date":"2021-09-18","isOffDay":false},{"name":"中秋节","date":"2021-09-19","isOffDay":true},{"name":"中秋节","date":"2021-09-20","isOffDay":true},{"name":"中秋节","date":"2021-09-21","isOffDay":true},{"name":"国庆节","date":"2021-09-26","isOffDay":false},{"name":"国庆节","date":"2021-10-01","isOffDay":true},{"name":"国庆节","date":"2021-10-02","isOffDay":true},{"name":"国庆节","date":"2021-10-03","isOffDay":true},{"name":"国庆节","date":"2021-10-04","isOffDay":true},{"name":"国庆节","date":"2021-10-05","isOffDay":true},{"name":"国庆节","date":"2021-10-06","isOffDay":true},{"name":"国庆节","date":"2021-10-07","isOffDay":true},{"name":"国庆节","date":"2021-10-09","isOffDay":false}]
};
let isOffDay = false;

function CompareDate(d1, d2) {
    return ((new Date(d1.replace(/-0?/g, "\/"))) > (new Date(d2.replace(/-0?/g, "\/"))));
}

function getToday() {
    const date = new Date();
    const month = date.getMonth(),
        day = date.getDate(),
        week = date.getDay();
    isOffDay = week == 6 || !week;
    return date.getFullYear() + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day);
}

const today = getToday();
const holiday = cnHoliday[today.substring(0, 4)];

for (const key in holiday) {
    if (CompareDate(holiday[key]["date"], today)) {
        break;
    }
    if (holiday[key]["date"] == today) {
        isOffDay = holiday[key]["isOffDay"];
        break;
    }
}

function showRemind() {
    const corpId = "ding307c0c3ff8b707a435c2f4657eb6378f",
        link = "dingtalk://dingtalkclient/page/link?url=https%3A%2F%2Fattend.dingtalk.com%2Fattend%2Findex.html%3FcorpId%3D",
        node = (new Date()).getHours() > 12 ? "下班" : "上班";
    $.alert("钉钉",  `${node}打卡了么？`, "", `${link}${corpId}`);
}

$.log("===work checkin remind===")
$.log(today, isOffDay)
$.log("===work checkin remind===")
isOffDay || showRemind();

function hammer(t="untitled",l=3){return new class{constructor(t,l){this.name=t,this.logLevel=l,this.isRequest=("object"==typeof $request)&&$request.method!="OPTIONS",this.isSurge="undefined"!=typeof $httpClient,this.isQuanX="undefined"!=typeof $task,this.isNode="function"==typeof require,this.node=(()=>{if(!this.isNode){return null}const file="localstorage.yml";let f,y,r;try{f=require('fs');y=require('js-yaml');r=require('request');f.appendFile(file,"",function(err){if(err)throw err;})}catch(e){console.log("install unrequired module by: yarn add module_name");console.log(e.message);return{}}return{file:file,fs:f,yaml:y,request:r,}})()}log(...n){if(l<2){return null}console.log(`\n***********${this.name}***********`);for(let i in n)console.log(typeof n[i]=="object"?JSON.stringify(n[i]):n[i])}alert(body="",subtitle="",options={}){if(l==2||l==0){return null}if(typeof options=="string"){options={"open-url":options}}let link=null;if(Object.keys(options).length){link=this.isQuanX?options:{openUrl:options["open-url"],mediaUrl:options["media-url"]}}if(this.isSurge)return $notification.post(this.name,subtitle,body,link);if(this.isQuanX)return $notify(this.name,subtitle,body,link);console.log(`系统通知📣\ntitle:${this.name}\nsubtitle:${subtitle}\nbody:${body}\nlink:${link}`)}request(method,params,callback){let options={};if(typeof params=="string"){options.url=params}else{options.url=params.url;if(typeof params=="object"){params.headers&&(options.headers=params.headers);params.body&&(options.body=params.body)}}method=method.toUpperCase();const writeRequestErrorLog=function(n,m,u){return err=>console.log(`${n}request error:\n${m}${u}\n${err}`)}(this.name,method,options.url);if(this.isSurge){const _runner=method=="GET"?$httpClient.get:$httpClient.post;return _runner(options,(error,response,body)=>{if(error==null||error==""){response.body=body;callback("",body,response)}else{writeRequestErrorLog(error);callback(error,"",response)}})}options.method=method;if(this.isQuanX){$task.fetch(options).then(response=>{response.status=response.statusCode;delete response.statusCode;callback("",response.body,response)},reason=>{writeRequestErrorLog(reason.error);response.status=response.statusCode;delete response.statusCode;callback(reason.error,"",response)})}if(this.isNode){if(options.method=="POST"&&options.body){try{options.body=JSON.parse(options.body);options.json=true}catch(e){console.log(e.message)}}this.node.request(options,(error,response,body)=>{if(typeof body=="object"){body=JSON.stringify(body)}if(typeof response=='object'&&response){response.status=response.statusCode;delete response.statusCode}callback(error,body,response)})}}read(key){if(this.isSurge)return $persistentStore.read(key);if(this.isQuanX)return $prefs.valueForKey(key);if(this.isNode){let val="";try{const fileContents=this.node.fs.readFileSync(this.node.file,"utf8");const data=this.node.yaml.safeLoad(fileContents);val=(typeof(data)=="object"&&data[key])?data[key]:""}catch(e){console.log(`读取文件时错误:\n${e.message}`);return""}return val}}write(val,key){if(this.isSurge)return $persistentStore.write(val,key);if(this.isQuanX)return $prefs.setValueForKey(val,key);if(this.isNode){try{const fileContents=this.node.fs.readFileSync(this.node.file,"utf8");let data=this.node.yaml.safeLoad(fileContents);data=typeof data=="object"?data:{};data[key]=val;val=this.node.yaml.safeDump(data);this.node.fs.writeFileSync(this.node.file,val,'utf8')}catch(e){console.log(e.message);return false}return true}}delete(key){if(this.isNode){try{const fileContents=this.node.fs.readFileSync(this.node.file,"utf8");let data=this.node.yaml.safeLoad(fileContents);data=typeof data=="object"?data:{};if(!data.hasOwnProperty(key)){return true}delete data[key];const val=this.node.yaml.safeDump(data);this.node.fs.writeFileSync(this.node.file,val,'utf8')}catch(e){console.log(e.message);return false}return true}}done(value={}){if(this.isQuanX)return $done(value);if(this.isSurge)return this.isRequest?$done(value):$done()}pad(s=false,c="*",l=15){return s?this.log(c.padEnd(l,c)):`\n${c.padEnd(l,c)}\n`}}(t,l)}