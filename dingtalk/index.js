const $hammer = (() => {
    const isRequest = "undefined" != typeof $request,
        isSurge = "undefined" != typeof $httpClient,
        isQuanX = "undefined" != typeof $task;

    const log = (...n) => { for (let i in n) console.log(n[i]) };
    const alert = (title, body = "", subtitle = "", link = "") => {
        if (isSurge) return $notification.post(title, subtitle, body, link);
        if (isQuanX) return $notify(title, subtitle, (link&&!body ? link : body));
        log('==============📣系统通知📣==============');
        log("title:", title, "subtitle:", subtitle, "body:", body, "link:", link);
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
            const _runner = method == "GET" ? $httpClient.get : $httpClient.post;
            return _runner(options, response => { callback(response, null) });
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
        if (isQuanX) return isRequest ? $done(value) : null;
        if (isSurge) return isRequest ? $done(value) : $done();
    };
    return { isRequest, isSurge, isQuanX, log, alert, read, write, request, done };
})();


const url = "http://holiday.zhusaidong.cn/api.php?date=";
$hammer.request("get", {url:url}, (resp) => {
    const resp = JSON.parse(resp);
    if(resp.code == 1) {
        return false;
    }
    const corpId = "ding307c0c3ff8b707a435c2f4657eb6378f",
    link = "dingtalk://dingtalkclient/page/link?url=https%3A%2F%2Fattend.dingtalk.com%2Fattend%2Findex.html%3FcorpId%3D",
    node = (new Date()).getHours() > 15 ? "下班" : "上班";
    $hammer.alert("钉钉", node + "打卡了么？", "", link + corpId);
});