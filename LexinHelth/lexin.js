/*
「乐心健康」修改运动步数
By: iepngs
*/

/**
{
"timestamp": "1590202486957",
"list": [{
"id": "1234ac1f5b67890edca164bea36c9e9db3",
"calories": "43.7125",
"deviceId": "M_12CE3FCEFBCCC45C6C78909DFA8E7F6543B21EC0",
"type": "0",
"dataSource": "3",
"userId": "43211234",
"priority": "0",
"step": "1345",
"created": "2020-05-23 10:54:46",
"distance": "1007",
"measurementTime": "2020-05-23 10:00:00"
}]
}
**/

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

let body = $request.body;
let steps = 18007;

$hammer.log("乐心健康上传数据("+ typeof(body) + "):", body);

function resetUploadSteps(data) {
    if (typeof data != "string") {
        return data;
    }

    try {
        data = JSON.parse(data);
    } catch (e) {
        return data;
    }

    let lastOneIndex = data.list.length - 1;
    if (lastOneIndex < 0) {
        $hammer.log("LexinHelth upload data error:", data);
        return JSON.stringify(data);
    }

    if (data.list[lastOneIndex].step >= steps) {
        return JSON.stringify(data);
    }

    steps += Math.ceil(Math.random() * 4000);
    data.list[lastOneIndex].step        = steps;
    data.list[lastOneIndex].calories    = steps * 0.0325;
    data.list[lastOneIndex].distance    = Math.ceil((steps * 0.7484).toFixed(1));

    return JSON.stringify(data);
}

// body = resetUploadSteps(body);

$hammer.alert(`🐢 当前上传步数: ${steps}`);

$hammer.done({ body });
