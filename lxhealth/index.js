/*

//desc: 步数上传
//author: iepngs

[Script]
// *Loon
http-request ^https:\/\/sports\.lifesense\.com\/sport_service\/sport\/sport\/uploadMobileStepV2 requires-body=true,timeout=10,script-path=https://raw.githubusercontent.com/iepngs/Script/master/lxhealth/index.js,tag=lxhealth

// *QX
^https:\/\/sports\.lifesense\.com\/sport_service\/sport\/sport\/uploadMobileStepV2 url script-request-body iepngs/Script/lxhealth/index.js,tag=lxhealth

[MitM] 
hostname = sports.lifesense.com

*/

const $hammer = (() => {
    const isRequest = "undefined" != typeof $request,
        isSurge = "undefined" != typeof $httpClient,
        isQuanX = "undefined" != typeof $task;

    const log = (...n) => { for (let i in n) console.log(n[i]) };
    const alert = (title, body = "", subtitle = "", link = "") => {
        if (isSurge) return $notification.post(title, subtitle, body, link);
        if (isQuanX) return $notify(title, subtitle, (link && !body ? link : body));
        log("==============📣系统通知📣==============");
        log("title:", title, "subtitle:", subtitle, "body:", body, "link:", link);
    };
    const read = key => {
        if (isSurge) return $persistentStore.read(key);
        if (isQuanX) return $prefs.valueForKey(key);
    },
        write = (key, val) => {
            if (isSurge) return $persistentStore.write(val, key);//surge是反着顺序的
            if (isQuanX) return $prefs.setValueForKey(key, val);
        };
    const request = (method, params, callback) => {
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
        method = method.toUpperCase();

        const writeRequestErrorLog = function (m, u) {
            return err => {
                log("=== request error -s--");
                log(`${m} ${u}`, err);
                log("=== request error -e--");
            };
        }(method, options.url);

        if (isSurge) {
            const _runner = method == "GET" ? $httpClient.get : $httpClient.post;
            return _runner(options, (error, response, body) => {
                if (error == null || error == "") {
                    response.body = body;
                    callback("", body, response);
                } else {
                    writeRequestErrorLog(error);
                    callback(error);
                }
            });
        }
        if (isQuanX) {
            options.method = method;
            $task.fetch(options).then(
                response => {
                    response.status = response.statusCode;
                    delete response.statusCode;
                    callback("", response.body, response);
                },
                reason => {
                    writeRequestErrorLog(reason.error);
                    callback(reason.error);
                }
            );
        }
    };
    const done = (value = {}) => {
        if (isQuanX) return isRequest ? $done(value) : null;
        if (isSurge) return isRequest ? $done(value) : $done();
    };
    return { isRequest, isSurge, isQuanX, log, alert, read, write, request, done };
})();

function hackingRequestBody(data) {
    try {
        data = JSON.parse(data);
    } catch (e) {
        return data;
    }
    const lastOneIndex = data.list.length - 1;
    let steps = data.list[lastOneIndex].step;
    const initSteps = 18007,
        notifyContents = `原始数据为：${steps}`;
    if (~~steps < initSteps) {
        steps = initSteps + Math.ceil(Math.random() * 4000);
        data.list[lastOneIndex].step = steps.toString();
        data.list[lastOneIndex].calories = (steps * 0.0325).toString();
        data.list[lastOneIndex].distance = (Math.ceil((steps * 0.7484).toFixed(1))).toString();
    }
    $hammer.alert(`🐢 健康上传步数：${steps}`, notifyContents);
    return JSON.stringify(data);
}

$hammer.done({ body: hackingRequestBody($request.body) });