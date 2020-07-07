/**
MITM:
api.dushu.io,gateway-api.dushu.io

rewrite:
http-response ^https:\/\/(gateway-api\.dushu\.io\/athena-orchestration-system\/app\/v100\/memberInfo|api\.dushu\.io\/(UserInfo\/HasUserBuyed|userInfo|oauth\/login|login)) script-path=https://raw.githubusercontent.com/iepngs/Script/master/fdds/index.js,requires-body=true,tag=fdds
**/

const $hammer=(()=>{const isRequest="undefined"!=typeof $request,isSurge="undefined"!=typeof $httpClient,isQuanX="undefined"!=typeof $task;const log=(...n)=>{for(let i in n)console.log(n[i])};const alert=(title,body="",subtitle="",options={})=>{let link=null;switch(typeof options){case"string":link=isQuanX?{"open-url":options}:options;break;case"object":if(["null","{}"].indexOf(JSON.stringify(options))==-1){link=isQuanX?options:options["open-url"];break}default:link=isQuanX?{}:""}if(isSurge)return $notification.post(title,subtitle,body,link);if(isQuanX)return $notify(title,subtitle,body,link);log("==============📣系统通知📣==============");log("title:",title,"subtitle:",subtitle,"body:",body,"link:",link)};const read=key=>{if(isSurge)return $persistentStore.read(key);if(isQuanX)return $prefs.valueForKey(key)};const write=(val,key)=>{if(isSurge)return $persistentStore.write(val,key);if(isQuanX)return $prefs.setValueForKey(val,key)};const request=(method,params,callback)=>{let options={};if(typeof params=="string"){options.url=params}else{options.url=params.url;if(typeof params=="object"){params.headers&&(options.headers=params.headers);params.body&&(options.body=params.body)}}method=method.toUpperCase();const writeRequestErrorLog=function(m,u){return err=>{log(`\n===request error-s--\n`);log(`${m}${u}`,err);log(`\n===request error-e--\n`)}}(method,options.url);if(isSurge){const _runner=method=="GET"?$httpClient.get:$httpClient.post;return _runner(options,(error,response,body)=>{if(error==null||error==""){response.body=body;callback("",body,response)}else{writeRequestErrorLog(error);callback(error,"",response)}})}if(isQuanX){options.method=method;$task.fetch(options).then(response=>{response.status=response.statusCode;delete response.statusCode;callback("",response.body,response)},reason=>{writeRequestErrorLog(reason.error);response.status=response.statusCode;delete response.statusCode;callback(reason.error,"",response)})}};const done=(value={})=>{if(isQuanX)return isRequest?$done(value):null;if(isSurge)return isRequest?$done(value):$done()};return{isRequest,isSurge,isQuanX,log,alert,read,write,request,done}})();

(() => {
    if (!$hammer.isRequest || $request.method == 'OPTION') {
        return $hammer.done();
    }
    const patten = /https:\/\/([^\/]+)\/(.*)/;
    const matcher = patten.exec($request.url);
    if (!matcher || matcher.length != 3) {
        return $hammer.done();
    }
    const [, host, uri] = matcher;
    const originBodyContents = $response.body;
    $hammer.log(`fdds origin data:\n ${originBodyContents}`);
    let body = "";
    try {
        body = JSON.parse(originBodyContents);
        $hammer.log(`fdds catched uri: ${uri}`);
        switch (uri) {
            case "athena-orchestration-system/app/v100/memberInfo":
                body.data.vipFlag = true;
                break;
            case "user-orchestration/user/api/v100/ceiltip":
                body.data = {};
                break;
            case "UserInfo/HasUserBuyed":
                body.member = true;
                body.buyed = true;
                body.statusCode = 200;//0
                break;
            case "userInfo":
            case "oauth/login":
            case "login":
                body.is_vip = true;
                body.userRoleCode = "10";//9-12,9试用|12过期
                body.userStatus = 2;//1-4,1试用|4过期
                body.expire_time = Date.now() + 365 * 86400 * 1000;
                break;
            case "fragment/content":
                body.trialDuration = body.duration;
                body.hasBought = true;
                body.hasUnlocked = true;
                break;
            case "app/hasUserBlackCard":
                body.inActivity = true;
                body.had = true;
                // body.oldUser = true;
            default:
                break;
        }
        body = JSON.stringify(body);
    } catch (e) {
        $hammer.alert("fdds", "解析异常,重写失败");
        $hammer.log(`fdds解析错误：\n${e.message}`);
        body = originBodyContents;
    }
    $hammer.log(`fdds final data:\n ${body}`);
    $hammer.done({ body: body });
})()