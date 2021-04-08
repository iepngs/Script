function assignGrabId(grabs, name){
    return grabs.filter(item => {
        return item.visible == 1 && item.name == name;
    })[0].id;
}

function hackGrabList(){
    let body = JSON.parse($response.body);
    const bodyData = body.data;
    for (const index in bodyData) {
        if(!bodyData[index].visible){
            continue;
        }
        switch (bodyData[index].name) {
            case "点赞":
                // 连击个数改负数
                body.data[index].bunch = body.data[index].bunch.map(item => {
                    return item == 9999 ? -item : item;
                })
                break;
            case "游轮":
                // 价格改负数
                body.data[index].price = -bodyData[index].price;
                break;
            case "梦幻城堡":
                // 改礼物id变动效
                body.data[index].id = assignGrabId(bodyData, "啤酒");
                break;
        }
    }
    return JSON.stringify(body);
}

function handleConfig(){
    let resp = $response.body;
    if(/"recordcount":\d+,"giftver":\d+,/.test(resp)){
        resp = hackGrabList();
        rewrite = true;
    }
    return resp;
}

function handleDiamonds(uri){
    let body = JSON.parse($response.body);
    if(!body.data){
        if(body.errcode){
            $.alert(body.errmsg, uri);
        }
        return $response.body;
    }
    let data = body.data;
    if(typeof data == "object" && Object.keys(data).length == 0){
        return $response.body;
    }

    data["lv"] = 88;
    data["exp"] = 1466600000000;
    data["diamonds"] = 10000;
    data["money"] = 10000;
    data["vip_expired"] = false;
    data["vip"] = 3;
    data["vip_prod_id"] = 39;
    data["this_exp"] = 1466600000000;
    data["next_exp"] = 166600000000;
    data["state"] = 4;

    body.data = data;
    
    rewrite = true;
    return JSON.stringify(body);
}


const $ = hammer("HMLive", 3);
let rewrite = false;
(()=>{
    const matcher = /\w+:\/\/[^\/]+\/(.*)/.exec($request.url);
    const uri = (matcher && matcher.length == 2) ? matcher[1] : "";
    let body = $response.body;

    if($request.method == "POST"){
        switch (uri) {
            case "lobby/config":
                body = handleConfig();
                break;
            case "auth/refresh_token":
            case "lobby/profile":
            case "lobby/get_level":
                body = handleDiamonds(uri);
                break;
        }
        rewrite && $.log(`$response.body:\n${$response.body}\n\nresponse:\n${body}`);
    }

    return $.done({body: body});
})();



function hammer(t="untitled",l=3){return new class{constructor(t,l){this.name=t,this.logLevel=l,this.isRequest=("object"==typeof $request)&&$request.method!="OPTIONS",this.isSurge="undefined"!=typeof $httpClient,this.isQuanX="undefined"!=typeof $task,this.isNode="function"==typeof require,this.node=(()=>{if(!this.isNode){return null}const file="localstorage.yml";let f,y,r;try{f=require('fs');y=require('js-yaml');r=require('request');f.appendFile(file,"",function(err){if(err)throw err;})}catch(e){console.log("install unrequired module by: yarn add module_name");console.log(e.message);return{}}return{file:file,fs:f,yaml:y,request:r,}})()}log(...n){if(l<2){return null}console.log(`\n***********${this.name}***********`);for(let i in n)console.log(typeof n[i]=="object"?JSON.stringify(n[i]):n[i])}alert(body="",subtitle="",options={}){if(l==2||l==0){return null}if(typeof options=="string"){options={"open-url":options}}let link=null;if(Object.keys(options).length){link=this.isQuanX?options:{openUrl:options["open-url"],mediaUrl:options["media-url"]}}if(this.isSurge)return $notification.post(this.name,subtitle,body,link);if(this.isQuanX)return $notify(this.name,subtitle,body,link);console.log(`系统通知📣\ntitle:${this.name}\nsubtitle:${subtitle}\nbody:${body}\nlink:${link}`)}request(method,params,callback){let options={};if(typeof params=="string"){options.url=params}else{options.url=params.url;if(typeof params=="object"){params.headers&&(options.headers=params.headers);params.body&&(options.body=params.body)}}method=method.toUpperCase();const writeRequestErrorLog=function(n,m,u){return err=>console.log(`${n}request error:\n${m}${u}\n${err}`)}(this.name,method,options.url);if(this.isSurge){const _runner=method=="GET"?$httpClient.get:$httpClient.post;return _runner(options,(error,response,body)=>{if(error==null||error==""){response.body=body;callback("",body,response)}else{writeRequestErrorLog(error);callback(error,"",response)}})}options.method=method;if(this.isQuanX){$task.fetch(options).then(response=>{response.status=response.statusCode;delete response.statusCode;callback("",response.body,response)},reason=>{writeRequestErrorLog(reason.error);response.status=response.statusCode;delete response.statusCode;callback(reason.error,"",response)})}if(this.isNode){if(options.method=="POST"&&options.body){try{options.body=JSON.parse(options.body);options.json=true}catch(e){console.log(e.message)}}this.node.request(options,(error,response,body)=>{if(typeof body=="object"){body=JSON.stringify(body)}if(typeof response=='object'&&response){response.status=response.statusCode;delete response.statusCode}callback(error,body,response)})}}read(key){if(this.isSurge)return $persistentStore.read(key);if(this.isQuanX)return $prefs.valueForKey(key);if(this.isNode){let val="";try{const fileContents=this.node.fs.readFileSync(this.node.file,"utf8");const data=this.node.yaml.safeLoad(fileContents);val=(typeof(data)=="object"&&data[key])?data[key]:""}catch(e){console.log(`读取文件时错误:\n${e.message}`);return""}return val}}write(val,key){if(this.isSurge)return $persistentStore.write(val,key);if(this.isQuanX)return $prefs.setValueForKey(val,key);if(this.isNode){try{const fileContents=this.node.fs.readFileSync(this.node.file,"utf8");let data=this.node.yaml.safeLoad(fileContents);data=typeof data=="object"?data:{};data[key]=val;val=this.node.yaml.safeDump(data);this.node.fs.writeFileSync(this.node.file,val,'utf8')}catch(e){console.log(e.message);return false}return true}}delete(key){if(this.isNode){try{const fileContents=this.node.fs.readFileSync(this.node.file,"utf8");let data=this.node.yaml.safeLoad(fileContents);data=typeof data=="object"?data:{};if(!data.hasOwnProperty(key)){return true}delete data[key];const val=this.node.yaml.safeDump(data);this.node.fs.writeFileSync(this.node.file,val,'utf8')}catch(e){console.log(e.message);return false}return true}}done(value={}){if(this.isQuanX)return $done(value);if(this.isSurge)return this.isRequest?$done(value):$done()}pad(s=false,c="*",l=15){return s?this.log(c.padEnd(l,c)):`\n${c.padEnd(l,c)}\n`}}(t,l)}