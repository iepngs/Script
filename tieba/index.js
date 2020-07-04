
//来源：https://github.com/sazs34/TaskConfig

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

    const useParallel = 0; //0自动切换,1串行,2并行(当贴吧数量大于30个以后,并行可能会导致QX崩溃,所以您可以自动切换)
    const singleNotifyCount = 20; //想签到几个汇总到一个通知里,这里就填几个(比如我有13个要签到的,这里填了5,就会分三次消息通知过去)
    let process = {
        total: 0,
        result: [
            // {
            //     bar:'',
            //     level:0,
            //     exp:0,
            //     errorCode:0,
            //     errorMsg:''
            // }
        ]
    };
    const host = "https://tieba.baidu.com";
    let url_fetch_sign = {
        url: `${host}/mo/q/newmoindex`,
        headers: {
            "Content-Type": "application/octet-stream",
            Referer: `${host}/index/tbwise/forum`,
            Cookie: cookieVal,
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16A366"
        }
    },
    url_fetch_add = {
        url: `${host}/sign/add`,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Cookie: cookieVal,
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 10_1_1 like Mac OS X; zh-CN) AppleWebKit/537.51.1 (KHTML, like Gecko) Mobile/14B100 UCBrowser/10.7.5.650 Mobile"
        },
        body: ""
    };
    
    const signBar = (bar, tbs) => {
        if (bar.is_sign == 1) { //已签到的,直接不请求接口了
            process.result.push({
                bar: `${bar.forum_name}`,
                level: bar.user_level,
                exp: bar.user_exp,
                errorCode: 9999,
                errorMsg: "已签到"
            });
            return checkIsAllProcessed();
        }
        url_fetch_add.body = `tbs=${tbs}&kw=${bar.forum_name}&ie=utf-8`;
        $hammer.request('post', url_fetch_add, (error,response,resp) => {
            if(error){
                $hammer.log('signBar error:', error);
                process.result.push({
                    bar: bar.forum_name,
                    errorCode: 999,
                    errorMsg: '接口错误'
                });
                return checkIsAllProcessed();
            }
            try {
                const result = JSON.parse(response);
                if (result.no == 0) {
                    process.result.push({
                        bar: bar.forum_name,
                        errorCode: 0,
                        errorMsg: `获得${result.data.uinfo.cont_sign_num}积分,第${result.data.uinfo.user_sign_rank}个签到`
                    });
                } else {
                    process.result.push({
                        bar: bar.forum_name,
                        errorCode: result.no,
                        errorMsg: result.error
                    });
                }
            } catch (e) {
                $hammer.alert(Protagonist, "贴吧签到数据处理异常", JSON.stringify(e));
            }
            checkIsAllProcessed();
        });
    };
    
    const signBars = (bars, tbs, index) => {
        //$notify(Protagonist, `进度${index}/${bars.length}`, "");
        if (index >= bars.length) {
            //$notify(Protagonist, "签到已满", `${process.result.length}`);
            return checkIsAllProcessed();
        }
        var bar = bars[index];
        if (bar.is_sign == 1) { //已签到的,直接不请求接口了
            process.result.push({
                bar: `${bar.forum_name}`,
                level: bar.user_level,
                exp: bar.user_exp,
                errorCode: 9999,
                errorMsg: "已签到"
            });
            return signBars(bars, tbs, ++index);
        }
        url_fetch_add.body = `tbs=${tbs}&kw=${bar.forum_name}&ie=utf-8`;
        $hammer.resquest('post', url_fetch_add, (error, response, resp) => {
            if (error) {
                $hammer.log('signBar error:', error);
                process.result.push({
                    bar: bar.forum_name,
                    errorCode: 999,
                    errorMsg: '接口错误'
                });
                return signBars(bars, tbs, ++index);
            }
            try {
                const result = JSON.parse(response);
                if (result.no == 0) {
                    process.result.push({
                        bar: bar.forum_name,
                        errorCode: 0,
                        errorMsg: `获得${result.data.uinfo.cont_sign_num}积分,第${result.data.uinfo.user_sign_rank}个签到`
                    });
                } else {
                    process.result.push({
                        bar: bar.forum_name,
                        errorCode: result.no,
                        errorMsg: result.error
                    });
                }
            } catch (e) {
                $hammer.alert(Protagonist, "贴吧签到数据处理异常", JSON.stringify(e));
            }
            signBars(bars, tbs, ++index)
        });
    };
    
    const checkIsAllProcessed = () => {
        //$hammer.log(Protagonist, `最终进度${process.result.length}/${process.total}`, "");
        if (process.result.length != process.total) return;
        for (var i = 0; i < Math.ceil(process.total / singleNotifyCount); i++) {
            let notify = "";
            const spliceArr = process.result.splice(0, singleNotifyCount);
            let notifySuccessCount = 0;
            for (const res of spliceArr) {
                if (res.errorCode == 0 || res.errorCode == 9999) {
                    notifySuccessCount++;
                }
                if (res.errorCode == 9999) {
                    notify += `【${res.bar}】已经签到，当前等级${res.level},经验${res.exp}`;
                } else {
                    notify += `【${res.bar}】${res.errorCode==0?'签到成功':'签到失败'}，${res.errorCode==0?res.errorMsg:('原因：'+res.errorMsg)}`;
                }
            }
            $hammer.alert(Protagonist, `签到${spliceArr.length}个,成功${notifySuccessCount}个`, notify);
        }
    };

    const startSignin = () => {
        $hammer.request('get', url_fetch_sign, (error, response, resp) => {
            if(error){
                return $hammer.alert(Protagonist, "签到失败", "未获取到签到列表");
            }
            const body = JSON.parse(response);
            const isSuccessResponse = body && body.no == 0 && body.error == "success" && body.data.tbs;
            if (!isSuccessResponse) {
                return $hammer.alert(Protagonist, "签到失败", (body && body.error) ? body.error : "接口数据获取失败");
            }
            const forums = body.data.like_forum;
            process.total = forums.length;
            if(~~process.total < 1){
                return $hammer.alert(Protagonist, "签到失败", "请确认您有关注的贴吧");
            }
            let list = "";
            for(let i in forums){
                const item = forums['i'];
                list += `吧名:${item.forum_name}, 等级:${item.user_level}\n`;
            }
            $hammer.log(`已关注贴吧列表:\n${list}`);
            if (useParallel == 1 || (useParallel == 0 && process.total >= 30)) {
                return signBars(forums, body.data.tbs, 0);
            }
            for (const bar of forums) {
                signBar(bar, body.data.tbs);
            }
        });
    };
    startSignin();
};


$hammer.isRequest ? flushCookie() : main();