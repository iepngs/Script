// MITM
// weixin.566.com,api.566.com

// rewrite
// http-response ^https:\/\/(api|weixin)\.566\.com\/api\/(Sys\/UserVipStatus|Sys\/HasVipPrivilege|User\/UserInfos|Resource\/IsUnlockChapter|ad\/AdList|ad\/noticelist) script-path=https://gitee.com/iepngs/repo/raw/loon/index.js,requires-body=true,tag=万题库

const $hammer=(()=>{const isRequest="undefined"!=typeof $request,isSurge="undefined"!=typeof $httpClient,isQuanX="undefined"!=typeof $task;const log=(...n)=>{for(let i in n)console.log(n[i])};const alert=(title,body="",subtitle="",options={})=>{let link=null;switch(typeof options){case"string":link=isQuanX?{"open-url":options}:options;break;case"object":if(["null","{}"].indexOf(JSON.stringify(options))==-1){link=isQuanX?options:options["open-url"];break}default:link=isQuanX?{}:""}if(isSurge)return $notification.post(title,subtitle,body,link);if(isQuanX)return $notify(title,subtitle,body,link);log("==============📣系统通知📣==============");log("title:",title,"subtitle:",subtitle,"body:",body,"link:",link)};const read=key=>{if(isSurge)return $persistentStore.read(key);if(isQuanX)return $prefs.valueForKey(key)};const write=(val,key)=>{if(isSurge)return $persistentStore.write(val,key);if(isQuanX)return $prefs.setValueForKey(val,key)};const request=(method,params,callback)=>{let options={};if(typeof params=="string"){options.url=params}else{options.url=params.url;if(typeof params=="object"){params.headers&&(options.headers=params.headers);params.body&&(options.body=params.body)}}method=method.toUpperCase();const writeRequestErrorLog=function(m,u){return err=>{log(`\n===request error-s--\n`);log(`${m} ${u}`,err);log(`\n===request error-e--\n`)}}(method,options.url);if(isSurge){const _runner=method=="GET"?$httpClient.get:$httpClient.post;return _runner(options,(error,response,body)=>{if(error==null||error==""){response.body=body;callback("",body,response)}else{writeRequestErrorLog(error);callback(error,"",response)}})}if(isQuanX){options.method=method;$task.fetch(options).then(response=>{response.status=response.statusCode;delete response.statusCode;callback("",response.body,response)},reason=>{writeRequestErrorLog(reason.error);response.status=response.statusCode;delete response.statusCode;callback(reason.error,"",response)})}};const done=(value={})=>{if(isQuanX)return isRequest?$done(value):null;if(isSurge)return isRequest?$done(value):$done()};const pad=(c,s=false,l=15)=>s?console.log(c.padEnd(l,c)):c.padEnd(l,c);return{isRequest,isSurge,isQuanX,log,alert,read,write,request,done,pad}})();

function initExpireDate(s=0){
    const dateObj = new Date(+Date.now()+s*1000);
    const year = dateObj.getUTCFullYear();
    const month = dateObj.getUTCMonth() + 1;
    const date = dateObj.getUTCDate();
    const hour = dateObj.getUTCHours();
    const minute = dateObj.getUTCMinutes();
    const second = dateObj.getUTCSeconds();
    const padzero = n => +n > 9 ? n : "0" + n.toString();
    const fmt1 = [year, month, date].map(padzero).join("-");
    const fmt2 = [hour, minute, second].map(padzero).join(":");
    return fmt1 + "T" + fmt2;
}

(()=>{
    const Protagonist = "万题库";
    let uri = "", bodyObj = {};
    try{
        uri = /\/([^\/\?]+(?!.*\/))/.exec($request.url)[1];
        bodyObj = JSON.parse($response.body);
        $hammer.log(`${Protagonist} request uri:\n${$hammer.pad("~")}\n${uri}`);
    }catch(e){
        console.log(e.message);
        return $hammer.done({body: $response.body});
    }
    switch (uri) {
        case "AdList":
            bodyObj.AdList = [];
            bodyObj.NewVerAdList = [];
            break;
        case "noticelist":
            bodyObj.Notice = [];
            break;
        case "IsUnlockChapter":
            bodyObj.IsUnlock = 1;
            break;
        case "UserVipStatus":
            bodyObj.IsValid = 1;
            bodyObj.ExpireDate = initExpireDate(7*86400);
            bodyObj.DaysToExpire = 7;
            bodyObj.VipType = 8;
            break;
        case "UserInfos":
            bodyObj.UserLevel.VipLevel = 3;
            bodyObj.UserLevel.ExpLimit = Math.ceil(+Date.now()/1000+86400*7);
            break;
        case "HasVipPrivilege":
            bodyObj.VipType = 8;
            bodyObj.HasVipPrivilege = 1;
            bodyObj.Locks = [];
            break;
        default:
            console.log("cross default section.")
            break;
    }
    const newBody = JSON.stringify(bodyObj);
    $hammer.done({body: newBody});
})();