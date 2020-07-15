// MITM ios-fenqu11.lxsjgo.com

// http-request ^https:\/\/ios-fenqu11\.lxsjgo\.com\/dog\/bug\?ts script-path=https://raw.githubusercontent.com/iepngs/Script/master/lxsj/index.js,requires-body=true,tag=旅行世界购物版
// http-response ^https:\/\/ios-fenqu11\.lxsjgo\.com\/dog\/bug\?ts script-path=https://raw.githubusercontent.com/iepngs/Script/master/lxsj/index.js,requires-body=true,timeout=10,tag=旅行世界购物版
// = -----------------------------------

const $hammer = (() => { const isRequest = "undefined" != typeof $request, isSurge = "undefined" != typeof $httpClient, isQuanX = "undefined" != typeof $task; const log = (...n) => { for (let i in n) console.log(n[i]) }; const alert = (title, body = "", subtitle = "", options = {}) => { let link = null; switch (typeof options) { case "string": link = isQuanX ? { "open-url": options } : options; break; case "object": if (["null", "{}"].indexOf(JSON.stringify(options)) == -1) { link = isQuanX ? options : options["open-url"]; break } default: link = isQuanX ? {} : "" }if (isSurge) return $notification.post(title, subtitle, body, link); if (isQuanX) return $notify(title, subtitle, body, link); log("==============📣系统通知📣=============="); log("title:", title, "subtitle:", subtitle, "body:", body, "link:", link) }; const read = key => { if (isSurge) return $persistentStore.read(key); if (isQuanX) return $prefs.valueForKey(key) }; const write = (val, key) => { if (isSurge) return $persistentStore.write(val, key); if (isQuanX) return $prefs.setValueForKey(val, key) }; const request = (method, params, callback) => { let options = {}; if (typeof params == "string") { options.url = params } else { options.url = params.url; if (typeof params == "object") { params.headers && (options.headers = params.headers); params.body && (options.body = params.body) } } method = method.toUpperCase(); const writeRequestErrorLog = function (m, u) { return err => { log(`\n===request error-s--\n`); log(`${m}${u}`, err); log(`\n===request error-e--\n`) } }(method, options.url); if (isSurge) { const _runner = method == "GET" ? $httpClient.get : $httpClient.post; return _runner(options, (error, response, body) => { if (error == null || error == "") { response.body = body; callback("", body, response) } else { writeRequestErrorLog(error); callback(error, "", response) } }) } if (isQuanX) { options.method = method; $task.fetch(options).then(response => { response.status = response.statusCode; delete response.statusCode; callback("", response.body, response) }, reason => { writeRequestErrorLog(reason.error); response.status = response.statusCode; delete response.statusCode; callback(reason.error, "", response) }) } }; const done = (value = {}) => { if (isQuanX) return isRequest ? $done(value) : null; if (isSurge) return isRequest ? $done(value) : $done() }; return { isRequest, isSurge, isQuanX, log, alert, read, write, request, done } })();

const Protagonist = "旅行世界购物版";
const CookieKey = "lxsjCookie";

let lastResponse = {
    data: {},
    error: ""
};

// request的时候写入Cookie
function GetCookie() {
    const CookieValue = JSON.stringify($request);
    $hammer.write(CookieValue, CookieKey);
    $hammer.alert(Protagonist, `Cookie写入成功🎉`);
    $hammer.done();
}

// response的时候重放
function replay(){
    return new Promise(resolve=>{
        const options = $hammer.read(CookieKey);
        if(!options){
            $hammer.alert(Protagonist, "Cookie不存在");
            resolve(false);
        }
        $hammer.request("post", options, (error, response, data) => {
            lastResponse.data = data;
            lastResponse.error = error;
            resolve(true);
        })
    });
}

// 检查投放结果
function checkResult(){
    if(lastResponse.error){
        $hammer.log(`${Protagonist} request error:`, error);
        $hammer.alert(Protagonist, lastResponse.error, "重放失败");
        return false;
    }
    $hammer.log(`${Protagonist} response data:`, lastResponse.data);
    try {
        const response = JSON.parse(lastResponse.data.body);
        if(lastResponse.data.status == 200){
            if(response.adInfo && response.adInfo != null){
                $hammer.alert(Protagonist, "金币不够了，要看广告");
                return false;
            }
            return true;
        }
        switch(response.errorCode){
            case 40000:
                // 位置满了
                $hammer.alert(Protagonist, response.message);
                break;
            case 40001:
                $hammer.alert(Protagonist, "token又失效了");
                break;
            default:
                const title = response.message ? response.message : `只知道错误码:${response.errorCode}`;
                $hammer.alert(Protagonist, title);
                break;
        }
        return false;
    } catch (error) {
        $hammer.log(`${Protagonist} response data:`, data);
        return false;
    }
}

// 解析response
async function catchResponse(){
    lastResponse.data = $response;
    while(true){
        if(!checkResult()) {
            $hammer.alert(Protagonist, "重放中止");
            break;
        }
        if(!(await replay())){
            break;
        }
    }
    $hammer.done();
}

$hammer.isRequest > 0 ? GetCookie() : catchResponse();
