// MITM ios-fenqu11.lxsjgo.com

// http-request ^https:\/\/ios-fenqu11\.lxsjgo\.com\/dog\/bug\?ts script-path=https://raw.staticdn.net/iepngs/Script/master/lxsj/index.js,requires-body=true,tag=旅行世界购物版
// http-response ^https:\/\/ios-fenqu11\.lxsjgo\.com\/dog\/bug\?ts script-path=https://raw.staticdn.net/iepngs/Script/master/lxsj/index.js,requires-body=true,timeout=10,tag=旅行世界购物版
// = -----------------------------------

const $hammer = (() => { const isRequest = "undefined" != typeof $request, isSurge = "undefined" != typeof $httpClient, isQuanX = "undefined" != typeof $task; const log = (...n) => { for (let i in n) console.log(n[i]) }; const alert = (title, body = "", subtitle = "", options = {}) => { let link = null; switch (typeof options) { case "string": link = isQuanX ? { "open-url": options } : options; break; case "object": if (["null", "{}"].indexOf(JSON.stringify(options)) == -1) { link = isQuanX ? options : options["open-url"]; break } default: link = isQuanX ? {} : "" }if (isSurge) return $notification.post(title, subtitle, body, link); if (isQuanX) return $notify(title, subtitle, body, link); log("==============📣系统通知📣=============="); log("title:", title, "subtitle:", subtitle, "body:", body, "link:", link) }; const read = key => { if (isSurge) return $persistentStore.read(key); if (isQuanX) return $prefs.valueForKey(key) }; const write = (val, key) => { if (isSurge) return $persistentStore.write(val, key); if (isQuanX) return $prefs.setValueForKey(val, key) }; const request = (method, params, callback) => { let options = {}; if (typeof params == "string") { options.url = params } else { options.url = params.url; if (typeof params == "object") { params.headers && (options.headers = params.headers); params.body && (options.body = params.body) } } method = method.toUpperCase(); const writeRequestErrorLog = function (m, u) { return err => { log(`\n===request error-s--\n`); log(`${m}${u}`, err); log(`\n===request error-e--\n`) } }(method, options.url); if (isSurge) { const _runner = method == "GET" ? $httpClient.get : $httpClient.post; return _runner(options, (error, response, body) => { if (error == null || error == "") { response.body = body; callback("", body, response) } else { writeRequestErrorLog(error); callback(error, "", response) } }) } if (isQuanX) { options.method = method; $task.fetch(options).then(response => { response.status = response.statusCode; delete response.statusCode; callback("", response.body, response) }, reason => { writeRequestErrorLog(reason.error); response.status = response.statusCode; delete response.statusCode; callback(reason.error, "", response) }) } }; const done = (value = {}) => { if (isQuanX) return isRequest ? $done(value) : null; if (isSurge) return isRequest ? $done(value) : $done() }; return { isRequest, isSurge, isQuanX, log, alert, read, write, request, done } })();

const Protagonist = "旅行世界购物版";
const CookieKey = "lxsjCookie";
const showlog = false;

let lastResponse = {
    data: {},
    error: ""
};

// request的时候写入Cookie
function GetCookie() {
    const options = {
        url: $request.url,
        headers: $request.headers,
        body: $request.body
    };
    const CookieValue = JSON.stringify(options);
    $hammer.write(CookieValue, CookieKey);
    showlog && $hammer.alert(Protagonist, `Cookie写入成功🎉`);
    $hammer.done();
}

// response的时候重放
function replay(index) {
    return new Promise(resolve => {
        $hammer.log(`${Protagonist} 第${index}次重放`);
        let options = $hammer.read(CookieKey);
        options = options ? JSON.parse(options) : false;
        if (!options) {
            $hammer.alert(Protagonist, "Cookie不存在");
            return resolve(false);
        }
        $hammer.request("post", options, (error, response, data) => {
            lastResponse.data = data;
            lastResponse.error = error;
            setTimeout(()=>{
                resolve(true);
            }, 250);
        })
    });
}

// 检查投放结果
function checkResult() {
    if (lastResponse.error) {
        $hammer.log(`${Protagonist} request error:`, lastResponse.error);
        return lastResponse.error;
    }
    const response = lastResponse.data;
    showlog && $hammer.log(`${Protagonist} checkResult data:`, response);
    const result = JSON.parse(response.body);
    if (response.status == 200) {
        if (result.adInfo == null) {
            return false;
        }
        return "金币不够了，要看广告";
    }
    switch (result.errorCode) {
        case 40000:
            // 位置满了
            return result.message;
        case 40001:
            return "token又失效了";
        default:
            return result.message ? result.message : `只知道错误码:${result.errorCode}`;
    }
}

// 解析response
async function catchResponse() {
    lastResponse.data = $response;
    showlog && $hammer.log(`${Protagonist} catchResponse:`, $response);
    let index = 1;
    while (true) {
        const stopReplay = checkResult();
        if (stopReplay) {
            showlog && $hammer.alert(Protagonist, stopReplay, "重放中止");
            break;
        }
        if (!(await replay(index++))) {
            break;
        }
    }
    $hammer.done();
}

typeof $response == "object" ? catchResponse() : GetCookie();