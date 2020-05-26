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
ikuuu签到 = type=cron,cronexp=0 9 * * *,script-path=https://raw.githubusercontent.com/iepngs/Script/master/ikuuu-DailyBonus/ikuuu.js

ikuuu获取Cookie = type=http-request,pattern=https:\/\/ikuuu\.co\/user\/profile,script-path=https://raw.githubusercontent.com/iepngs/Script/master/ikuuu-DailyBonus/ikuuu.js

[MITM] 
hostname = ikuuu.co

************************
QuantumultX 本地脚本配置:
************************

[task_local]
# ikuuu签到
0 9 * * * ikuuu.js

[rewrite_local]
# 获取Cookie
https:\/\/ikuuu\.co\/user\/profile url script-request-header iepngs/Script/ikuuu-DailyBonus/ikuuu.js

[mitm] 
hostname = ikuuu.co

************************
Loon 2.1.0+ 脚本配置:
************************

[Script]
# ikuuu签到
cron "0 9 * * *" script-path=https://raw.githubusercontent.com/iepngs/Script/master/ikuuu-DailyBonus/ikuuu.js

# 获取Cookie 网站登录后点击我的信息页面
http-request https:\/\/ikuuu\.co\/user\/profile script-path=https://raw.githubusercontent.com/iepngs/Script/master/ikuuu-DailyBonus/ikuuu.js

[Mitm]
hostname = ikuuu.co
**/

const $hammer = (() => {
    const isRequest = "undefined" != typeof $request,
        isSurge = "undefined" != typeof $httpClient,
        isQuanX = "undefined" != typeof $task;

    const log = (...n) => {try{console.log(...n)}catch(t){}};
    const alert = (title, body = "", subtitle = "") => {
        if (isSurge) return $notification.post(title, subtitle, body);
        if (isQuanX) return $notify(title, subtitle, body);
        log("title:" + title + "\nsubtitle:" + subtitle + "\nbody:" + body);
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
        if(typeof params == "string"){
            params = {url: params};
        }
        const options = {
            url: params.url,
            body: params.data
        };
        method = method.toUpperCase();
        if (isSurge) {
            if(params.header){
                options.header = params.header;
            }
            return method == "GET"
                ? $httpClient.get(options, response => {callback(response, null)})
                : $httpClient.post(options, response => {callback(response, null)});
        }
        if (isQuanX) {
            options.method = method;
            if(params.header){
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

const CookieKey = "CookieIKUUU";

function GetCookie() {
    const CookieName = "IKUUU的Cookie";
    try {
        if ($request.headers && $request.url.match(/ikuuu\.co\/user\/profile/)) {
            const CookieValue = $request.headers['Cookie'];
            if ($hammer.read(CookieKey)) {
                if ($hammer.read(CookieKey) != CookieValue) {
                    const cookie = $hammer.write(CookieValue, CookieKey);
                    $hammer.alert(CookieName, "更新" + (cookie ? "成功🎉" : "失败"));
                }
            } else {
                const cookie = $hammer.write(CookieValue, CookieKey);
                $hammer.alert(CookieName, "写入" + (cookie ? "成功🎉" : "失败"));
            }
        } else {
            $hammer.alert(CookieName, "请检查匹配URL或配置内脚本类型", "写入失败");
        }
    } catch (error) {
        $hammer.alert(CookieName, "未知错误", "写入失败")
        $hammer.log(error)
    }
    $hammer.done();
}

function checkin() {
    let options = {
        url: "https://ikuuu.co/user/checkin",
        header: {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "origin": "https://ikuuu.co",
            "referer": "https://ikuuu.co/user",
            "cookie": $hammer.read(CookieKey),
            "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
        },
        data: ""
    }
    $hammer.request("post", options, (response, error) => {
        if (error) {
            $hammer.alert("IKUUU签到", error, "签到请求失败");
            $hammer.done();
        }
        $hammer.log("IKUUU签到结果：", response);
        data = JSON.parse(response.body);
        $hammer.msg("IKUUU签到", data.msg);
        $hammer.done();
    })
}

$hammer.isRequest ? GetCookie() : checkin();
