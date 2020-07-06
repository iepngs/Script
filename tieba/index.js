// cookie 获取：
// 网页打开tieba.baidu.com，登陆后从“我的”点击进入“账户安全”即可。

const $hammer = (() => {
    const isRequest = "undefined" != typeof $request,
        isSurge = "undefined" != typeof $httpClient,
        isQuanX = "undefined" != typeof $task;

    const log = (...n) => { for (let i in n) console.log(n[i]) };
    const alert = (title, body = "", subtitle = "", options = {}) => {
        // option(<object>|<string>): {open-url: <string>, media-url: <string>}
        let link = null;
        switch (typeof options) {
            case "string":
                link = isQuanX ? {"open-url": options} : options;
                break;
            case "object":
                if(["null", "{}"].indexOf(JSON.stringify(options)) == -1){
                    link = isQuanX ? options : options["open-url"];
                    break;
                }
            default:
                link = isQuanX ? {} : "";
        }
        if (isSurge) return $notification.post(title, subtitle, body, link);
        if (isQuanX) return $notify(title, subtitle, body, link);
        log("==============📣系统通知📣==============");
        log("title:", title, "subtitle:", subtitle, "body:", body, "link:", link);
    };
    const read = key => {
        if (isSurge) return $persistentStore.read(key);
        if (isQuanX) return $prefs.valueForKey(key);
    };
    const write = (val, key) => {
        if (isSurge) return $persistentStore.write(val, key);
        if (isQuanX) return $prefs.setValueForKey(val, key);
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
                log(`\n=== request error -s--\n`);
                log(`${m} ${u}`, err);
                log(`\n=== request error -e--\n`);
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
                    callback(error, "", response);
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
                    response.status = response.statusCode;
                    delete response.statusCode;
                    callback(reason.error, "", response);
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


const Protagonist = '贴吧签到';
const CookieKey = 'CookieTB';

const flushCookie = () => {
    const historyCookie = $hammer.read(CookieKey);
    const regex = /(^|)BDUSS=([^;]*)(;|$)/;
    const headerCookie = $request.headers["Cookie"].match(regex)[0];
    if(!headerCookie){
        return $hammer.done();
    }
    let contents = historyCookie ? (historyCookie == headerCookie ? "" : "已更新" ) : "已写入";
    if(contents){
        $hammer.write(headerCookie, CookieKey);
    }else{
        contents = '已存在相同cookie';
    }
    $hammer.alert(Protagonist, contents);
    $hammer.done();
};

const main = () => {
    const cookieVal = $hammer.read(CookieKey);
    if (!cookieVal) {
        return $hammer.alert(Protagonist, "签到失败", "未获取到cookie");
    }

    let successnum = 0;
    const host = "https://tieba.baidu.com";
    const ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16A366";
    const buildRequsetBody = body => {
        return {
            url: `${host}/sign/add`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Cookie: cookieVal,
                "User-Agent": ua
            },
            body: body
        };
    };
    const fetchMyLikedForums = () => {
        return new Promise(resolve => {
            const options = {
                url: `${host}/mo/q/newmoindex`,
                headers: {
                    "Content-Type": "application/octet-stream",
                    Referer: `${host}/index/tbwise/forum`,
                    Cookie: cookieVal,
                    "User-Agent": ua
                }
            };
            $hammer.request('get', options, (error, response, resp) => {
                if(error){
                    $hammer.alert(Protagonist, "未成功获取关注的贴吧列表", "签到失败");
                    return resolve(false);
                }
                const body = JSON.parse(response);
                const isSuccessResponse = body && body.no == 0 && body.error == "success" && body.data.tbs;
                if (!isSuccessResponse) {
                    $hammer.alert(Protagonist, (body && body.error) ? body.error : "接口数据获取失败", "签到失败");
                    return resolve(false);
                }
                resolve(body.data);
            });
        })
    };
    const signin = async (bar, tbs) => {
        return new Promise(resolve => {
            const body = `tbs=${tbs}&kw=${bar.forum_name}&ie=utf-8`;
            $hammer.request('post', buildRequsetBody(body), (error,response,resp) => {
                if(error){
                    $hammer.log(`${bar.forum_name} signin error:`, error);
                    return resolve(`网络请求异常`);
                }
                let res = "";
                try {
                    const result = JSON.parse(response);
                    $hammer.log(`${bar.forum_name}签到结果：\n${response}`);
                    if(result.no == 0){
                        successnum++;
                        const info = result.data.uinfo;
                        res = `✅获得${info.cont_sign_num}积分,第${info.user_sign_rank}个签到`;
                    }else{
                        res = `❎签到失败(${result.no}):${result.error}`;
                    }
                } catch (e) {
                    res = `❎签到异常:${e.message}`
                }
                setTimeout(() => {
                    resolve(res);
                }, Math.ceil(Math.random()*2000));
            });
        });
    };
    const startSignin = async () => {
        const resp = await fetchMyLikedForums();
        if(resp){
            const forums = resp.like_forum;
            const total = forums.length;
            if(total < 1){
                return $hammer.alert(Protagonist, "签到失败", "请确认您有关注的贴吧");
            }
            let result = `当前关注的贴吧有${total}个:\n`;
            for (const bar of forums) {
                result += `【${bar.forum_name}】`;
                if(bar.is_sign == 1){
                    successnum++;
                    result += `✅等级/经验:${bar.user_level}/${bar.user_exp}\n`;
                    continue;
                }
                result += await signin(bar, resp.tbs);
                result += "\n";
            }
            $hammer.alert(Protagonist, result, `今日已签:${successnum}/${total}`);
        }
        $hammer.done();
    };
    startSignin();
};

$hammer.isRequest ? flushCookie() : main();