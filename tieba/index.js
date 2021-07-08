// cookie 获取：
// 网页打开tieba.baidu.com，登陆后从“我的”点击进入“我的贴子”即可。

const $ = hammer('贴吧签到');
const CookieKey = 'CookieTB';

const flushCookie = () => {
    const regex = /(^|)BDUSS=([^;]*)(;|$)/;
    console.log($request.headers.Cookie);
    const headerCookie = $request.headers.Cookie.match(regex)[0];
    console.log(headerCookie);
    if(headerCookie){
        $.write(headerCookie, CookieKey);
        $.alert('Cookie已写入');
    }
    $.done();
};

const main = () => {
    const cookieVal = $.read(CookieKey);
    if (!cookieVal) {
        return $.alert("签到失败", "未获取到cookie");
    }

    let successnum = 0;
    const host = "https://tieba.baidu.com";
    const ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16A366";
    const buildRequsetBody = body => {
        return {
            url: `${host}/sign/add`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Cookie: cookieVal,
                "User-Agent": ua
            },
            body: body
        };
    };
    const fetchMyLikedForums = () => {
        return new Promise(resolve => {
            const options = {
                url: `${host}/mo/q/newmoindex`,
                headers: {
                    "Content-Type": "application/octet-stream",
                    Referer: `${host}/index/tbwise/forum`,
                    Cookie: cookieVal,
                    "User-Agent": ua
                }
            };
            $.request('get', options, (error, response, resp) => {
                if(error){
                    $.alert("未成功获取关注的贴吧列表", "签到失败");
                    return resolve(false);
                }
                const body = JSON.parse(response);
                const isSuccessResponse = body && body.no == 0 && body.error == "success" && body.data.tbs;
                if (!isSuccessResponse) {
                    $.alert((body && body.error) ? body.error : "接口数据获取失败", "签到失败");
                    return resolve(false);
                }
                resolve(body.data);
            });
        })
    };
    const signin = async (bar, tbs) => {
        return new Promise(resolve => {
            const body = `tbs=${tbs}&kw=${bar.forum_name}&ie=utf-8`;
            $.request('post', buildRequsetBody(body), (error,response,resp) => {
                if(error){
                    $.log(`${bar.forum_name} signin error:`, error);
                    return resolve(`网络请求异常`);
                }
                let res = "";
                try {
                    const result = JSON.parse(response);
                    $.log(`${bar.forum_name}签到结果：\n${response}`);
                    if(result.no == 0){
                        successnum++;
                        const info = result.data.uinfo;
                        res = `✅获得${info.cont_sign_num}积分,第${info.user_sign_rank}个签到`;
                    }else{
                        res = `❎签到失败(${result.no}):${result.error}`;
                    }
                } catch (e) {
                    res = `❎签到异常:${e.message}`
                }
                setTimeout(() => {
                    resolve(res);
                }, Math.ceil(Math.random()*2000));
            });
        });
    };
    const startSignin = async () => {
        const resp = await fetchMyLikedForums();
        if(resp){
            const forums = resp.like_forum;
            const total = forums.length;
            if(total < 1){
                return $.alert("签到失败", "请确认您有关注的贴吧");
            }
            let result = `当前关注的贴吧有${total}个:\n`;
            for (const bar of forums) {
                result += `${bar.forum_name}> `;
                if(bar.is_sign == 1){
                    successnum++;
                    result += `${bar.user_level}级\n`;
                    continue;
                }
                result += await signin(bar, resp.tbs);
                result += "\n";
            }
            $.alert(result, `今日已签:${successnum}/${total}`);
        }
        $.done();
    };
    startSignin();
};

$.isRequest ? flushCookie() : main();

function hammer(t="untitled",l=3){return new class{constructor(t,l){this.name=t,this.logLevel=l,this.isRequest=("object"==typeof $request)&&$request.method!="OPTIONS",this.isSurge="undefined"!=typeof $httpClient,this.isQuanX="undefined"!=typeof $task,this.isNode="function"==typeof require,this.node=(()=>{if(!this.isNode){return null}const file="localstorage.yml";let f,y,r,yc,sc;try{f=require('fs');y=require('js-yaml');r=require('got');f.appendFile(file,"",function(err){if(err)throw err;});yc=y.load(f.readFileSync(file,"utf8"));sc=data=>f.writeFileSync(file,y.safeDump(data),'utf8')}catch(e){console.log("install unrequired module, example: yarn add js-yaml got");console.log(e.message);return{}}return{file:file,fs:f,yaml:y,request:r,yamlContents:yc,saveYamlContents:sc,}})()}log(...n){if(l<2){return null}console.log(`\n***********${this.name}***********`);for(let i in n)console.log(typeof n[i]=="object"?eval(`(${JSON.stringify(n[i])})`):n[i])}alert(body="",subtitle="",options={}){if(l==2||l==0){return null}if(typeof options=="string"){options={"open-url":options}}let link=null;if(Object.keys(options).length){link=this.isQuanX?options:{openUrl:options["open-url"],mediaUrl:options["media-url"]}}if(this.isSurge)return $notification.post(this.name,subtitle,body,link);if(this.isQuanX)return $notify(this.name,subtitle,body,link);console.log(`系统通知\ntitle:${this.name}\nsubtitle:${subtitle}\nbody:${body}\nlink:${link}`)}async request(method,params,callback){let options={};if(typeof params=="string"){options.url=params}else{options.url=params.url;if(typeof params=="object"){params.headers&&(options.headers=params.headers);params.body&&(options.body=params.body)}}if(!options.headers||typeof(options.headers)!="object"){options['headers']={}}if(!options.headers||!Object.keys(options.headers).includes("User-Agent")){const ua='Mozilla%2F5.0%20(iPhone%3B%20CPU%20iPhone%20OS%2013_2_3%20like%20Mac%20OS%20X)%20AppleWebKit%2F605.1.15%20(KHTML%2C%20like%20Gecko)%20Version%2F13.0.3%20Mobile%2F15E148%20Safari%2F604.1';options['headers']['User-Agent']=decodeURIComponent(ua)}method=method.toUpperCase();const writeRequestErrorLog=function(n,m,u){return err=>console.log(`${n}request error:\n${m}${u}\n${err}`)}(this.name,method,options.url);if(this.isSurge){const _runner=method=="GET"?$httpClient.get:$httpClient.post;return _runner(options,(error,response,body)=>{if(error==null||error==""){response.body=body;callback("",body,response)}else{writeRequestErrorLog(error);callback(error,"",response)}})}options.method=method;if(this.isQuanX){$task.fetch(options).then(response=>{response.status=response.statusCode;delete response.statusCode;callback("",response.body,response)},reason=>{writeRequestErrorLog(reason.error);response.status=response.statusCode;delete response.statusCode;callback(reason.error,"",response)})}if(this.isNode){method=options.method.toLowerCase();const hc=this.node.request[method];if(typeof(hc)!="function"){return callback(`unsupport request method ${options.method}in got`)}let ro={responseType:"text",};if(options.headers){ro.headers=options.headers}if(options.body){ro.body=(options.body&&typeof(options.body)=="object")?JSON.stringify(options.body):options.body}if(params.option){const ks=Object.keys(params.option);for(const k of ks){ro[k]=params.option[k]}}let error="",body="",response={};try{response=await hc(options.url,ro);body=response.body;response={status:response.statusCode,headers:response.headers,body:body,}}catch(e){error=`${e.name}:${e.message}`}callback(error,body,response)}}read(key){if(this.isSurge)return $persistentStore.read(key);if(this.isQuanX)return $prefs.valueForKey(key);if(this.isNode){let val="";try{const data=this.node.yamlContents;val=(typeof(data)=="object"&&data[key])?data[key]:""}catch(e){console.log(`读取文件时错误:\n${e.message}`);return""}return val}}write(val,key){if(this.isSurge)return $persistentStore.write(val,key);if(this.isQuanX)return $prefs.setValueForKey(val,key);if(this.isNode){try{const data=this.node.yamlContents;data=typeof data=="object"?data:{};data[key]=val;this.node.saveYamlContents(data)}catch(e){console.log(e.message);return false}return true}}delete(key){if(this.isSurge)return $persistentStore.remove(key);if(this.isQuanX)return $prefs.removeValueForKey(key);if(this.isNode){try{const data=this.node.yamlContents;data=typeof data=="object"?data:{};if(!data.hasOwnProperty(key)){return true}delete data[key];this.node.saveYamlContents(data)}catch(e){console.log(e.message);return false}return true}}done(value={}){if(this.isQuanX)return $done(value);if(this.isSurge)return this.isRequest?$done(value):$done()}pad(s=false,c="*",l=15){return s?this.log(c.padEnd(l,c)):`\n${c.padEnd(l,c)}\n`}}(t,l)}