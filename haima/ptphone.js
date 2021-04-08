
// 夜空 xapi.wangran.live
// 聆心 api.fengtan.live
// 陪我 pw.futrueredland.com.cn

// 11 11,16 * * *

// ^http:\/\/xapi\.wangran\.live\/api\/home\/find
// ^http:\/\/api\.fengtan\.live\/api\/home\/anchor
// ^https:\/\/pw\.futrueredland\.com.cn\/v1\/userexpose\/getUserList



const $ = hammer("PTPhone", 3);

function record(){
    let pt = "un";
    const urlPart = $request.url.split(".");
    switch (urlPart[1]) {
        case "wangran":
            pt = "yk";
            break;
        case "fengtan":
            pt = "lx";
            break;
        case "futrueredland":
            pt = "pw";
            break;
        default:
            break;
    }
    const resp = JSON.parse($response.body);
    if(!resp || (pt == "pw" && resp.code != 200) || (pt != "pw" && resp.code)){
        $.log("Response data not match:", resp);
        return $.done({body: $response.body});
    }
const rows = pt == "pw" ? resp.data : resp.data.data;
    let result = {
        pt: pt,
        data: []
    };
    for (const item of rows) {
        if(pt == "pw"){
            if(item.weixin == "" && item.qq == ""){
                continue;
            }
        }else{
            if (item.phone == "") {
                continue;
            }
        }
        result.data.push({
            nick: item.nickname,
            gender:item.hasOwnProperty("phone")?item.gender:-1,
            phone:item.hasOwnProperty("phone")?item.phone:"",
            area: item.hasOwnProperty("city")?item.city:"",
            weixin:item.hasOwnProperty("weixin")?item.weixin:"",
            qq:item.hasOwnProperty("qq")?item.qq:0,
        });
    }
    if(result.data.length < 1){
        $.log("Response data not match:", resp);
        return $.done({body: $response.body});
    }
    const options = {
        url: `http://test.i.tubbzb.com/test/ptphone`,
        body: JSON.stringify(result),
    };
    $.request("post", options, (error, response, data) => {
        if(error || data.status != 200){
            $.log(`${options.url} request error: \n${error}`);
        }
        $.alert(response, pt);
        return $.done({body: $response.body});
    })
}

function notify(){
    $.alert("Click to open", "", {"open-url": `${platform}live://home`});
    $.done();
}

$.isRequest ? record() : notify();

function hammer(t="untitled",l=3){return new class{constructor(t,l){this.name=t,this.logLevel=l,this.isRequest=("object"==typeof $request)&&$request.method!="OPTIONS",this.isSurge="undefined"!=typeof $httpClient,this.isQuanX="undefined"!=typeof $task,this.isNode="function"==typeof require,this.node=(()=>{if(!this.isNode){return null}const file="localstorage.yml";let f,y,r;try{f=require('fs');y=require('js-yaml');r=require('request');f.appendFile(file,"",function(err){if(err)throw err;})}catch(e){console.log("install unrequired module by: yarn add module_name");console.log(e.message);return{}}return{file:file,fs:f,yaml:y,request:r,}})()}log(...n){if(l<2){return null}console.log(`\n***********${this.name}***********`);for(let i in n)console.log(typeof n[i]=="object"?JSON.stringify(n[i]):n[i])}alert(body="",subtitle="",options={}){if(l==2||l==0){return null}if(typeof options=="string"){options={"open-url":options}}let link=null;if(Object.keys(options).length){link=this.isQuanX?options:{openUrl:options["open-url"],mediaUrl:options["media-url"]}}if(this.isSurge)return $notification.post(this.name,subtitle,body,link);if(this.isQuanX)return $notify(this.name,subtitle,body,link);console.log(`系统通知📣\ntitle:${this.name}\nsubtitle:${subtitle}\nbody:${body}\nlink:${link}`)}request(method,params,callback){let options={};if(typeof params=="string"){options.url=params}else{options.url=params.url;if(typeof params=="object"){params.headers&&(options.headers=params.headers);params.body&&(options.body=params.body)}}method=method.toUpperCase();const writeRequestErrorLog=function(n,m,u){return err=>console.log(`${n}request error:\n${m}${u}\n${err}`)}(this.name,method,options.url);if(this.isSurge){const _runner=method=="GET"?$httpClient.get:$httpClient.post;return _runner(options,(error,response,body)=>{if(error==null||error==""){response.body=body;callback("",body,response)}else{writeRequestErrorLog(error);callback(error,"",response)}})}options.method=method;if(this.isQuanX){$task.fetch(options).then(response=>{response.status=response.statusCode;delete response.statusCode;callback("",response.body,response)},reason=>{writeRequestErrorLog(reason.error);response.status=response.statusCode;delete response.statusCode;callback(reason.error,"",response)})}if(this.isNode){if(options.method=="POST"&&options.body){try{options.body=JSON.parse(options.body);options.json=true}catch(e){console.log(e.message)}}this.node.request(options,(error,response,body)=>{if(typeof body=="object"){body=JSON.stringify(body)}if(typeof response=='object'&&response){response.status=response.statusCode;delete response.statusCode}callback(error,body,response)})}}read(key){if(this.isSurge)return $persistentStore.read(key);if(this.isQuanX)return $prefs.valueForKey(key);if(this.isNode){let val="";try{const fileContents=this.node.fs.readFileSync(this.node.file,"utf8");const data=this.node.yaml.safeLoad(fileContents);val=(typeof(data)=="object"&&data[key])?data[key]:""}catch(e){console.log(`读取文件时错误:\n${e.message}`);return""}return val}}write(val,key){if(this.isSurge)return $persistentStore.write(val,key);if(this.isQuanX)return $prefs.setValueForKey(val,key);if(this.isNode){try{const fileContents=this.node.fs.readFileSync(this.node.file,"utf8");let data=this.node.yaml.safeLoad(fileContents);data=typeof data=="object"?data:{};data[key]=val;val=this.node.yaml.safeDump(data);this.node.fs.writeFileSync(this.node.file,val,'utf8')}catch(e){console.log(e.message);return false}return true}}delete(key){if(this.isNode){try{const fileContents=this.node.fs.readFileSync(this.node.file,"utf8");let data=this.node.yaml.safeLoad(fileContents);data=typeof data=="object"?data:{};if(!data.hasOwnProperty(key)){return true}delete data[key];const val=this.node.yaml.safeDump(data);this.node.fs.writeFileSync(this.node.file,val,'utf8')}catch(e){console.log(e.message);return false}return true}}done(value={}){if(this.isQuanX)return $done(value);if(this.isSurge)return this.isRequest?$done(value):$done()}pad(s=false,c="*",l=15){return s?this.log(c.padEnd(l,c)):`\n${c.padEnd(l,c)}\n`}}(t,l)}