/**
ikuuu签到脚本

说明：
手动登录 https://ikuuu.co 点击进入“我的信息”页面 如通知成功获取cookie, 则可以使用此签到脚本.
获取Cookie后, 请将Cookie脚本禁用并移除主机名，以免产生不必要的MITM.
脚本将在每天上午9点执行。 可以修改执行时间。

************************
Surge 4.2.0+ 脚本配置:
************************

[Script]
ikuuu签到 = type=cron,cronexp=0 9 * * *,script-path=https://raw.githubusercontent.com/iepngs/Script/master/ikuuu/index.js

ikuuu获取Cookie = type=http-request,pattern=https:\/\/ikuuu\.co\/user\/profile,script-path=https://raw.githubusercontent.com/iepngs/Script/master/ikuuu/index.js

[MITM] 
hostname = ikuuu.co

************************
QuantumultX 本地脚本配置:
************************

[task_local]
# ikuuu签到
0 9 * * * iepngs/Script/ikuuu/index.js

[rewrite_local]
# 获取Cookie
https:\/\/ikuuu\.co\/user\/profile url script-request-header iepngs/Script/ikuuu/index.js

[mitm] 
hostname = ikuuu.co

************************
Loon 2.1.0+ 脚本配置:
************************

[Script]
# ikuuu签到
cron "0 9 * * *" script-path=https://raw.githubusercontent.com/iepngs/Script/master/ikuuu/index.js

# 获取Cookie 网站登录后点击我的信息页面
http-request https:\/\/ikuuu\.co\/user\/profile script-path=https://raw.githubusercontent.com/iepngs/Script/master/ikuuu/index.js

[Mitm]
hostname = ikuuu.co
**/

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
            if (isSurge) return $persistentStore.write(key, val);
            if (isQuanX) return $prefs.setValueForKey(key, val);
        };
    const request = (method, params, callback) => {
        /**
         * 
         * params(<object>): {url: <string>, headers: <object>, body: <string>} | <url string>
         * 
         * callback(
         *      error, 
         *      {status: <int>, headers: <object>, body: <string>} | ""
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
                    callback("", response);
                } else {
                    writeRequestErrorLog(error);
                    callback(error, "");
                }
            });
        }
        if (isQuanX) {
            options.method = method;
            $task.fetch(options).then(
                response => {
                    response.status = response.statusCode;
                    delete response.statusCode;
                    callback("", response);
                },
                reason => {
                    writeRequestErrorLog(reason.error);
                    callback(reason.error, "");
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

const CookieKey = "CookieIKUUU";

function GetCookie() {
    const CookieName = "IKUUU的Cookie";
    try {
        if ($request.headers) {
            const CookieValue = $request.headers['Cookie'];
            const cachedCookie = $hammer.read(CookieKey);
            const dynamic = cachedCookie ? (cachedCookie == CookieValue ? "" : "更新") : "写入";
            if(dynamic){
                const result = $hammer.write(CookieKey, CookieValue);
                $hammer.alert(CookieName, dynamic + (result ? "成功🎉" : "失败"));
            }
        } else {
            $hammer.alert(CookieName, "请检查匹配URL或配置内脚本类型", "写入失败");
        }
    } catch (error) {
        $hammer.alert(CookieName, "写入失败: 未知错误")
        $hammer.log(error)
    }
    $hammer.done();
}

function checkin() {
    let options = {
        url: "https://ikuuu.co/user/checkin",
        headers: {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "origin": "https://ikuuu.co",
            "referer": "https://ikuuu.co/user",
            "cookie": $hammer.read(CookieKey),
            "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
        },
        body: ""
    }
    $hammer.request("post", options, (error, response) => {
        if (error) {
            $hammer.alert("IKUUU签到", error, "签到请求失败");
            return $hammer.done();
        }
        $hammer.log("IKUUU签到结果：", response);
        data = JSON.parse(response.body);
        $hammer.alert("IKUUU签到", data.msg);
        $hammer.done();
    })
}

$hammer.isRequest ? GetCookie() : checkin();
