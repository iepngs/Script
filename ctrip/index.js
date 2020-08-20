/*
cookie获取: 在携程app内点击"我的",然后点击"我的积分",再点击下面的"签到.任务"即可
http-request https:\/\/m\.ctrip\.com\/restapi\/soa2\/14946\/json\/userBaseInfo script-path=https://raw.githubusercontent.com/iepngs/Script/master/ctrip/index.js,tag=携程旅行
mimt:m.ctrip.com

cron "29 8 * * *" script-path=https://raw.githubusercontent.com/iepngs/Script/master/ctrip/index.js,tag=携程旅行
*/

const $hammer=(()=>{const isRequest="undefined"!=typeof $request,isSurge="undefined"!=typeof $httpClient,isQuanX="undefined"!=typeof $task;const log=(...n)=>{for(let i in n)console.log(n[i])};const alert=(title,body="",subtitle="",options={})=>{let link=null;switch(typeof options){case"string":link=isQuanX?{"open-url":options}:options;break;case"object":if(["null","{}"].indexOf(JSON.stringify(options))==-1){link=isQuanX?options:options["open-url"];break}default:link=isQuanX?{}:""}if(isSurge)return $notification.post(title,subtitle,body,link);if(isQuanX)return $notify(title,subtitle,body,link);log("==============📣系统通知📣==============");log("title:",title,"subtitle:",subtitle,"body:",body,"link:",link)};const read=key=>{if(isSurge)return $persistentStore.read(key);if(isQuanX)return $prefs.valueForKey(key)};const write=(val,key)=>{if(isSurge)return $persistentStore.write(val,key);if(isQuanX)return $prefs.setValueForKey(val,key)};const request=(method,params,callback)=>{let options={};if(typeof params=="string"){options.url=params}else{options.url=params.url;if(typeof params=="object"){params.headers&&(options.headers=params.headers);params.body&&(options.body=params.body)}}method=method.toUpperCase();const writeRequestErrorLog=function(m,u){return err=>{log(`\n===request error-s--\n`);log(`${m} ${u}`,err);log(`\n===request error-e--\n`)}}(method,options.url);if(isSurge){const _runner=method=="GET"?$httpClient.get:$httpClient.post;return _runner(options,(error,response,body)=>{if(error==null||error==""){response.body=body;callback("",body,response)}else{writeRequestErrorLog(error);callback(error,"",response)}})}if(isQuanX){options.method=method;$task.fetch(options).then(response=>{response.status=response.statusCode;delete response.statusCode;callback("",response.body,response)},reason=>{writeRequestErrorLog(reason.error);response.status=response.statusCode;delete response.statusCode;callback(reason.error,"",response)})}};const done=(value={})=>{if(isQuanX)return isRequest?$done(value):null;if(isSurge)return isRequest?$done(value):$done()};const pad=(c="~",s=false,l=15)=>s?console.log(c.padEnd(l,c)):`\n${c.padEnd(l,c)}\n`;return{isRequest,isSurge,isQuanX,log,alert,read,write,request,done,pad}})();

const Protagnist = "携程旅行";
const cookieKey = "cookie_ctrip";

function GetCookie(){
    const cookieVal = $request.headers.Cookie;
    if (cookieVal) {
        $hammer.write(cookieVal, cookieKey);
        $hammer.alert(Protagnist, '获取Cookie: 成功');
    }
    $hammer.done();
}

function Sign() {
    const cookieVal = $hammer.read(cookieKey);
    if(!cookieVal){
        $hammer.log(`${Protagnist} 无cookie`);
        $hammer.done();
    }
    const options = {
        url: 'https://m.ctrip.com/restapi/soa2/14946/json/saveDailyBonus?',
        headers: {
            'Cookie': cookieVal,
            'User-Agent' : `Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 mediaCode=SFEXPRESSAPP-iOS-ML`,
        }
    }
    $hammer.request('get', options, (error, response, data) => {
        const result = JSON.parse(response);
        const detail = result.resultcode == 0 ? `签到结果: 成功,总积分${result.integrated}` : `签到结果: 未知, ${result.resultmessage}`;
        $hammer.alert(Protagnist, detail);
        $hammer.done();
    })
}

$hammer.isRequest ? GetCookie() : Sign();



function randomNumber(start, end, fixed = 0) {const differ = end - start, random = Math.random();return (start + differ * random).toFixed(fixed);};
let fakeMD5 = "";
for (let index = 0; ; index++) {
    const random = randomNumber(97, 132);
    fakeMD5 += random > 122 ? randomNumber(0, 9).toString() : String.fromCharCode(random);
    if(fakeMD5.length == 32) break;
}
console.log(fakeMD5);