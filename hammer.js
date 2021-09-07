/**
* http://www.jsons.cn/jsforamt/
function hammer(t="untitled",l=3){return new class{constructor(t,l){this.name=t,this.logLevel=l,this.isRequest=("object"==typeof $request)&&$request.method!="OPTIONS",this.isSurge="undefined"!=typeof $httpClient,this.isQuanX="undefined"!=typeof $task,this.isNode="function"==typeof require,this.node=(()=>{if(!this.isNode){return null}const file="localstorage.yml";let f,y,r,yc,sc;try{f=require('fs');y=require('js-yaml');r=require('got');f.appendFile(file,"",function(err){if(err)throw err;});yc=y.load(f.readFileSync(file,"utf8"));sc=data=>f.writeFileSync(file,y.safeDump(data),'utf8')}catch(e){console.log(e.message);console.log("install unrequired module, example: yarn add js-yaml got");return{}}return{file:file,fs:f,yaml:y,request:r,yamlContents:yc,saveYamlContents:sc,}})()}log(...n){if(l<2){return null}for(let i in n){const ct=typeof n[i]=="object"?eval(`(${JSON.stringify(n[i])})`):n[i];console.log(`\n***********${this.name}***********\n${ct}`)}}alert(body="",subtitle="",options={}){if(l==2||l==0){return null}body=`${body}`;if(typeof options=="string"){options={"open-url":options}}let link={};if(Object.keys(options).length){link=this.isQuanX?options:{openUrl:options["open-url"],mediaUrl:options["media-url"]}}if(this.isSurge)return $notification.post(this.name,subtitle,body,link);if(this.isQuanX)return $notify(this.name,subtitle,body,link);console.log(`系统通知\ntitle:${this.name}\nsubtitle:${subtitle}\nbody:${body}\nlink:${link}`)}async request(method,params,callback){let options={};if(typeof params=="string"){options.url=params}else{options.url=params.url;if(typeof params=="object"){params.headers&&(options.headers=params.headers);params.body&&(options.body=params.body)}}if(!options.headers||typeof(options.headers)!="object"){options['headers']={}}if(!options.headers||(!Object.keys(options.headers).includes("User-Agent")&&!Object.keys(options.headers).includes("aser-agent"))){const ua='Mozilla%2F5.0%20(iPhone%3B%20CPU%20iPhone%20OS%2013_2_3%20like%20Mac%20OS%20X)%20AppleWebKit%2F605.1.15%20(KHTML%2C%20like%20Gecko)%20Version%2F13.0.3%20Mobile%2F15E148%20Safari%2F604.1';options['headers']['User-Agent']=decodeURIComponent(ua)}method=method.toUpperCase();const writeRequestErrorLog=function(n,m,u){return err=>console.log(`${n}request error:\n${m}${u}\n${err}`)}(this.name,method,options.url);if(this.isSurge){const _runner=method=="GET"?$httpClient.get:$httpClient.post;return _runner(options,(error,response,body)=>{if(error==null||error==""){response.body=body;callback("",body,response)}else{writeRequestErrorLog(error);callback(error,"",response)}})}options.method=method;if(this.isQuanX){$task.fetch(options).then(response=>{response.status=response.statusCode;delete response.statusCode;callback("",response.body,response)},reason=>{writeRequestErrorLog(reason.error);response.status=response.statusCode;delete response.statusCode;callback(reason.error,"",response)})}if(this.isNode){method=options.method.toLowerCase();const hc=this.node.request[method];if(typeof(hc)!="function"){return callback(`unsupport request method ${options.method}in got`)}let ro={responseType:"text",};if(options.headers){ro.headers=options.headers}if(options.body){ro.body=(options.body&&typeof(options.body)=="object")?JSON.stringify(options.body):options.body}if(params.option){const ks=Object.keys(params.option);for(const k of ks){ro[k]=params.option[k]}}let error="",body="",response={};try{response=await hc(options.url,ro);body=response.body;response={status:response.statusCode,headers:response.headers,body:body,}}catch(e){error=`${e.name}:${e.message}`}callback(error,body,response)}}read(key){if(this.isSurge)return $persistentStore.read(key);if(this.isQuanX)return $prefs.valueForKey(key);if(this.isNode){let val="";try{const data=this.node.yamlContents;val=(typeof(data)=="object"&&data[key])?(typeof(data[key])=='object'?JSON.stringify(data[key]):data[key]):""}catch(e){console.log(`读取文件时错误:\n${e.message}`);return""}return val}}write(val,key){if(this.isSurge)return $persistentStore.write(val,key);if(this.isQuanX)return $prefs.setValueForKey(val,key);if(this.isNode){try{const data=this.node.yamlContents;data=typeof data=="object"?data:{};data[key]=val;this.node.saveYamlContents(data)}catch(e){console.log(e.message);return false}return true}}delete(key){if(this.isSurge)return $persistentStore.remove(key);if(this.isQuanX)return $prefs.removeValueForKey(key);if(this.isNode){try{const data=this.node.yamlContents;data=typeof data=="object"?data:{};if(!data.hasOwnProperty(key)){return true}delete data[key];this.node.saveYamlContents(data)}catch(e){console.log(e.message);return false}return true}}done(value={}){if(this.isQuanX)return $done(value);if(this.isSurge)return this.isRequest?$done(value):$done()}pad(s=false,c="*",l=15){return s?this.log(c.padEnd(l,c)):`\n${c.padEnd(l,c)}\n`}}(t,l)}
*/

(() => {
    if("function" == typeof(require)){
        module.exports = hammer;
        // Useage:
        // const $ = require("./hammer.js")("jd", 3);
    }
})()

function hammer(t="untitled", l=3){
    /**
     * t <string> title
     * l <integer> log-level 
     *      0:alert-no  log-no
     *      1:alert-yes log-no
     *      2:alert-no  log-yes
     *      3:alert-yes log-yes
     */
    return new class{
        constructor(t, l){
            this.name = t,
            this.logLevel = l,
            this.isRequest = ("object" == typeof $request) && $request.method != "OPTIONS",
            this.isSurge = "undefined" != typeof $httpClient,
            this.isQuanX = "undefined" != typeof $task,
            this.isNode = "function" == typeof require,
            this.node=(()=>{
                if(!this.isNode) {
                    return null;
                }
                const file = "localstorage.yml";
                let f,y,r,yc,sc;
                try {
                    f = require('fs');
                    y = require('js-yaml');
                    r = require('got');
                    f.appendFile(file, "", function (err) {
                        if (err) throw err;
                    });
                    yc = y.load(f.readFileSync(file, "utf8"));
                    sc = data => f.writeFileSync(file, y.safeDump(data), 'utf8');
                } catch (e) {
                    console.log(e.message);
                    console.log("install unrequired module, example: yarn add js-yaml got");
                    return {};
                }
                return {
                    file: file,
                    fs: f,
                    yaml: y,
                    request: r,
                    yamlContents: yc,
                    saveYamlContents: sc,
                }
            })()
        }
        log(...n){
            if(l < 2){
                return null;
            }
            for (let i in n) {
                const ct = typeof n[i] == "object"?eval(`(${JSON.stringify(n[i])})`):n[i];
                console.log(`\n*********** ${this.name} ***********\n${ct}`);
            }
        }
        alert(body = "", subtitle = "", options = {}){
            // option(<object>|<string>): {open-url: <string>, media-url: <string>}
            if(l == 2 || l == 0){
                return null;
            }
            body = `${body}`;
            if(typeof options == "string"){
                options = {"open-url": options};
            }
            let link = {};
            if(Object.keys(options).length){
                link = this.isQuanX ? options : {openUrl: options["open-url"], mediaUrl: options["media-url"]};
            }
            if (this.isSurge) return $notification.post(this.name, subtitle, body, link);
            if (this.isQuanX) return $notify(this.name, subtitle, body, link);
            console.log(`系统通知\ntitle: ${this.name}\nsubtitle: ${subtitle}\nbody: ${body}\nlink: ${link}`);
        }
        async request(method, params, callback){
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
            if(!options.headers || typeof(options.headers) != "object"){
                options['headers'] = {};
            }
            if(!options.headers || (!Object.keys(options.headers).includes("User-Agent") && !Object.keys(options.headers).includes("user-agent"))){
                const ua = 'Mozilla%2F5.0%20(iPhone%3B%20CPU%20iPhone%20OS%2013_2_3%20like%20Mac%20OS%20X)%20AppleWebKit%2F605.1.15%20(KHTML%2C%20like%20Gecko)%20Version%2F13.0.3%20Mobile%2F15E148%20Safari%2F604.1';
                options['headers']['User-Agent'] = decodeURIComponent(ua);
            }
            method = method.toUpperCase();
    
            const writeRequestErrorLog = function (n, m, u) {
                return err => console.log(`${n} request error:\n${m} ${u}\n${err}`);
            }(this.name, method, options.url);
    
            if (this.isSurge) {
                const _runner = method == "GET" ? $httpClient.get : $httpClient.post;
                return _runner(options, (error, response, body) => {
                    if (error == null || error == "") {
                        response.body = body;
                        callback("", body, response);
                    } else {
                        writeRequestErrorLog(error);
                        callback(error, "", response);
                    }
                });
            }
            options.method = method;
            if (this.isQuanX) {
                $task.fetch(options).then(
                    response => {
                        response.status = response.statusCode;
                        delete response.statusCode;
                        callback("", response.body, response);
                    },
                    reason => {
                        writeRequestErrorLog(reason.error);
                        response.status = response.statusCode;
                        delete response.statusCode;
                        callback(reason.error, "", response);
                    }
                );
            }
            if(this.isNode){
                method = options.method.toLowerCase();
                const hc = this.node.request[method];
                if(typeof(hc) != "function"){
                    return callback(`unsupport request method ${options.method} in got`);
                }
                let ro = {
                    responseType: "text",
                };
                if(options.headers){
                    ro.headers = options.headers;
                }
                if(options.body){
                    ro.body = (options.body && typeof(options.body) == "object") ? JSON.stringify(options.body) : options.body;
                }
                if(params.option){
                    const ks = Object.keys(params.option);
                    for (const k of ks) {
                        ro[k] = params.option[k];
                    }
                }
                let error = "", body = "", response = {};
                try {
                    response = await hc(options.url, ro);
                    body = response.body;
                    response = {
                        status: response.statusCode,
                        headers: response.headers,
                        body: body,
                    }
                } catch (e) {
                    error = `${e.name}: ${e.message}`;
                }
                callback(error, body, response);
            }
        }
        read(key){
            if (this.isSurge) return $persistentStore.read(key);
            if (this.isQuanX) return $prefs.valueForKey(key);
            if (this.isNode) {
                let val = "";
                try{
                    const data = this.node.yamlContents;
                    val = (typeof(data) == "object" && data[key]) ? (typeof(data[key])=='object' ? JSON.stringify(data[key]) : data[key]) : "";
                }catch( e ){
                    console.log(`读取文件时错误:\n${e.message}`);
                    return "";
                }
                return val;
            }
        }
        write(val, key){
            if (this.isSurge) return $persistentStore.write(val, key);
            if (this.isQuanX) return $prefs.setValueForKey(val, key);
            if (this.isNode) {
                try {
                    const data = this.node.yamlContents;
                    data = typeof data == "object" ? data : {};
                    data[key] = val;
                    this.node.saveYamlContents(data);
                } catch (e) {
                    console.log(e.message);
                    return false;
                }
                return true;
            }
        }
        delete(key){
            if(this.isSurge) return $persistentStore.remove(key);
            if(this.isQuanX) return $prefs.removeValueForKey(key);
            if(this.isNode){
                try {
                    const data = this.node.yamlContents;
                    data = typeof data == "object" ? data : {};
                    if(!data.hasOwnProperty(key)){
                        return true;
                    }
                    delete data[key];
                    this.node.saveYamlContents(data);
                } catch (e) {
                    console.log(e.message);
                    return false;
                }
                return true;
            }
        }
        done(value = {}){
            if (this.isQuanX) return $done(value);
            if (this.isSurge) return this.isRequest ? $done(value) : $done();
        }
        pad(s=false, c="*", l=15){
            return s ? this.log(c.padEnd(l, c)) : `\n${c.padEnd(l,c)}\n`;
        }
    }(t, l)
}
