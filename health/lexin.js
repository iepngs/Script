/*

//desc: 步数上传
//author: iepngs

[Script]
// *Loon
http-request ^https:\/\/sports\.lifesense\.com\/sport_service\/sport\/sport\/uploadMobileStepV2 requires-body=true,timeout=10,script-path=https://raw.githubusercontent.com/iepngs/Script/master/LXHealth/lexin.js,tag=lx健康

// *QX
^https:\/\/sports\.lifesense\.com\/sport_service\/sport\/sport\/uploadMobileStepV2 url script-request-body iepngs/Script/health/lexin.js,tag=lx健康

[MitM] 
hostname = sports.lifesense.com

*/

const $hammer = (() => {
    const isRequest = "undefined" != typeof $request,
        isSurge = "undefined" != typeof $httpClient,
        isQuanX = "undefined" != typeof $task;

    const log = (...n) => { try { console.log(...n) } catch (t) { } };
    const alert = (title, body = "", subtitle = "") => {
        if (isSurge) return $notification.post(title, subtitle, body);
        if (isQuanX) return $notify(title, subtitle, body);
        log("\ntitle:" + title + "\nsubtitle:" + subtitle + "\nbody:" + body);
    };
    const read = key => {
        if (isSurge) return $persistentStore.read(key);
        if (isQuanX) return $prefs.valueForKey(key);
    },
        write = (key, val) => {
            if (isSurge) return $persistentStore.write(key, val);
            if (isQuanX) return $prefs.setValueForKey(key, val);
        };
    const request = (method, params, callback) => {
        if (typeof params == "string") {
            params = { url: params };
        }
        const options = {
            url: params.url,
            body: params.data
        };
        method = method.toUpperCase();
        if (isSurge) {
            if (params.header) {
                options.header = params.header;
            }
            return method == "GET"
                ? $httpClient.get(options, response => { callback(response, null) })
                : $httpClient.post(options, response => { callback(response, null) });
        }
        if (isQuanX) {
            options.method = method;
            if (params.header) {
                options.headers = params.header;
            }
            if (options.method == "GET" && typeof options == "string") {
                options = {
                    url: options
                };
            }
            $task.fetch(options).then(response => {
                callback(response, null)
            }, reason => {
                callback(null, reason.error)
            });
        }
    };
    const done = (value = {}) => {
        if (isQuanX) isRequest ? $done(value) : null;
        if (isSurge) isRequest ? $done(value) : $done();
    };
    return { isRequest, isSurge, isQuanX, log, alert, read, write, request, done };
})();

function hackingRequestBody(data) {
    try {
        data = JSON.parse(data);
    } catch (e) {
        return data;
    }
    const lastOneIndex  = data.list.length - 1;
    let steps           = data.list[lastOneIndex].step;
    const initSteps     = 18007,
        notifyContents  = `原始数据为：${steps}`;
    if (~~steps < initSteps) {
        steps   = initSteps + Math.ceil(Math.random() * 4000);
        data.list[lastOneIndex].step        = steps.toString();
        data.list[lastOneIndex].calories    = (steps * 0.0325).toString();
        data.list[lastOneIndex].distance    = (Math.ceil((steps * 0.7484).toFixed(1))).toString();
    }
    $hammer.alert(`🐢 健康上传步数：${steps}`, notifyContents);
    return JSON.stringify(data);
}

$hammer.done({ body: hackingRequestBody($request.body) });