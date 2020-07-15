/*
我的邀请码
1996253918

2020.7.9发布今日头条激素版签到脚本
公众号iosrule by红鲤鱼与绿鲤鱼与驴 2020.7.5
功能，签到，宝箱，睡觉，阅读明天加。不要外传
共计两个文件jrtt_cookie.js,jrtt_task.js
*/

// ====================================
// #今日头条签到获取ck loon
// http-request ^https:\/\/i-lq\.snssdk\.com\/score_task\/v1\/sleep\/done_task script-path=https://raw.githubusercontent.com/iepngs/Script/master/jrtt/index.js,requires-body=true,tag=今日头条极速版
// ====================================
// #今日头条定时任务 loon
// cron "*/6 7-18 * * *" script-path=https://raw.githubusercontent.com/iepngs/Script/master/jrtt/index.js,tag=今日头条极速版
// ====================================
// MITM=i-lq.snssdk.com
// ====================================


//以上是配置说明
const $iosrule = iosrule();//声明必须
//====================================
const log = 1;//开启日志
//++++++++++++++++++++++++++++++++-
const jrttid = "A";
const Protagonist = "今日头条激素版";
const jrtt_sleepurlckname = "jrtt_sleepurlckname" + jrttid;
const jrtt_sleepckname = "jrtt_sleepckname" + jrttid;
const jrtt_sleepbdname = "jrtt_sleepbdname" + jrttid;
const jrtt_sleepurlck = $iosrule.read(jrtt_sleepurlckname);
const jrtt_sleepck = $iosrule.read(jrtt_sleepckname);
const jrtt_sleepbd = $iosrule.read(jrtt_sleepbdname);
//++++++++++++++++++++++++++++++++
$iosrule.isRequest ? GetCookie() : main();
//++++++++++++++++++++++++++++++++

function GetCookie() {
    var md_header = $request.headers;
    if(!md_header){
        $iosrule.end();
    }
    var md_bd = $request.body;
    var urlval = $request.url;
    var jrtt_sleepurlck = urlval.substring(urlval.indexOf("done_task/") + 10, urlval.length);
    var jrtthok1 = $iosrule.write(jrtt_sleepurlck, jrtt_sleepurlckname);
    var jrtthok2 = $iosrule.write(md_header["x-Tt-Token"], jrtt_sleepckname);
    var jrtthok3 = $iosrule.write(md_bd, jrtt_sleepbdname);
    if (jrtthok1 && jrtthok2 && jrtthok3)
        papa("[睡觉💤ck]", "写入睡觉数据成功");
    $iosrule.end();
}

//++++++++++++++++++++++++++++++++
function main() {
    for (var i = 0; i < 5; i++) {
        (function (i) {
            setTimeout(function () {
                if (i == 0) jrtt_sign();
                else if (i == 1) jrtt_openbox();
                else if (i == 2) jrtt_sleep_mm();
            }, (i + 1) * 1000);
        })(i);
    }
}

//++++++++++++++++++++++++++++++++++++
//今日头条

function jrtt_openbox() {
    var result1 = ""; var result2 = "";
    const llUrl1 = { url: "https://is-lq.snssdk.com/score_task/v1/task/open_treasure_box/" + jrtt_sleepurlck, headers: { "sdk-version": 2, "x-Tt-Token": jrtt_sleepck } };
    $iosrule.post(llUrl1, function (error, response, data) {
        var obj = JSON.parse(data)
        if (log == 1) console.log("今日头条开宝箱data:" + data);
        if (obj.err_no == 0) {
            var tmm = obj.data.next_treasure_time - obj.data.current_time;
            result2 = "[金币]" + obj.data.score_amount + "[距下次开宝箱时间]" + formatSeconds(tmm);
            papa("[开宝箱奖励]", result2);
        }else {
            result2 = "还不到时间";
            jrtt_matchbox(result2);
        }
    })
}


function jrtt_matchbox(ssr) {
    var result1 = ""; 
    var result2 = "";
    const llUrl1 = { url: "https://is-lq.snssdk.com/score_task/v1/tips/get_data/?" + jrtt_sleepurlck, headers: { "sdk-version": 2, "x-Tt-Token": jrtt_sleepck } };
    $iosrule.get(llUrl1, function (error, response, data) {
        var obj = JSON.parse(data)
        if (log == 1) console.log("今日头条开宝箱data:" + data);
        if (obj.err_no == 0) {
            var tmm = obj.data.next_treasure_time - obj.data.current_time;
            result2 = "[距下次开宝箱时间]" + formatSeconds(tmm);
        }
        else
            result2 += ssr + result2;
        papa("[开宝箱奖励]", result2);
    })
}

function jrtt_sleep_history(res) {
    var result1 = ""; var result2 = "";
    const llUrl1 = { url: "https://i-lq.snssdk.com/score_task/v1/sleep/history/" + jrtt_sleepurlck, headers: { "sdk-version": 2, "x-Tt-Token": jrtt_sleepck } };
    $iosrule.get(llUrl1, function (error, response, data) {
        var obj = JSON.parse(data)
        if (log == 1) console.log("今日头条碎觉查询data:" + data);
        if (obj.err_no == 0) {
            result2 = "[总金币]" + obj.data[0].sleep_score_amount + "-" + obj.data[0].date + res;
            papa("[睡觉💤奖励]", result2);
        }
    })
}

function jrtt_sleep_done() {
    var result1 = ""; var result2 = "";
    const llUrl1 = { url: "https://i-lq.snssdk.com/score_task/v1/sleep/done_task/" + jrtt_sleepurlck, headers: { "sdk-version": 2, "Content-Type": "application/json; encoding=utf-8", "x-Tt-Token": jrtt_sleepck }, body: jrtt_sleepbd };
    $iosrule.post(llUrl1, function (error, response, data) {
        var obj = JSON.parse(data)
        if (log == 1) console.log("今日头条睡觉收割金币data:" + data);
        if (obj.err_no == 0)
            result2 = "[睡觉剩下]" + formatSeconds(obj.data.sleep_last_time);
        else
            result2 = "  💤收割金币❌" + obj.err_tips;
        jrtt_sleep_history(result2);
    })
}

function jrtt_sleep_mm() {
    var result1 = ""; 
    var result2 = "";
    const llUrl1 = { url: "https://i-lq.snssdk.com/score_task/v1/sleep/status/" + jrtt_sleepurlck, headers: { "sdk-version": 2, "x-Tt-Token": jrtt_sleepck } };

    $iosrule.get(llUrl1, function (error, response, data) {
        var obj = JSON.parse(data)
        if (log == 1) console.log("今日头条睡觉状态查询data:" + data);
        if (obj.err_no == 0) {
            result2 = "[睡觉🉑收货金币]" + obj.data.sleep_unexchanged_score + "\n" + "[上次睡觉时间]" + formatSeconds(obj.data.sleep_last_time);

            if (time_range("00:00", "2:00") || time_range("20:00", "23:59")) {
                if (obj.data.sleeping == false)
                    jrtt_sleep_begin();
            }else {
                if (obj.data.sleeping == true) {
                    if (obj.data.sleep_unexchanged_score > 0)
                        jrtt_sleep_done();
                }
            }
        } else
            result2 = "获取睡觉数据错误❌"

        papa("[睡觉💤奖励]", result2);
    })
}

function jrtt_sleep_begin() {
    var result1 = "[开始睡觉💤]"; var result2 = "";
    const llUrl1 = { url: "https://i-lq.snssdk.com/score_task/v1/sleep/start/?" + jrtt_sleepurlck, headers: { "sdk-version": 2, "x-Tt-Token": jrtt_sleepck }, body: jrtt_sleepbd };

    $iosrule.post(llUrl1, function (error, response, data) {
        var obj = JSON.parse(data)
        if (log == 1) console.log("今日头条开始睡觉data:" + data);
        if (obj.err_no == 0)
            result2 = "开始睡觉。。";
        else if (obj.err_no == 1052)
            result2 = obj.err_tips;
        else result2 = "开始睡觉数据错误❌";
        if (log == 1) console.log(result2);
        papa(result1, result2);
    })
}

function jrtt_sign() {
    var result1 = ""; var result2 = "";
    const llUrl1 = { url: "https://is-lq.snssdk.com/score_task/v1/task/sign_in/" + jrtt_sleepurlck, headers: { "sdk-version": 2, "x-Tt-Token": jrtt_sleepck } };
    const llUrl2 = { url: "https://is-lq.snssdk.com/score_task/v1/task/sign_in/detail/" + jrtt_sleepurlck, headers: { "sdk-version": 2, "x-Tt-Token": jrtt_sleepck } };

    $iosrule.post(llUrl1, function (error, response, data) {
        var obj = JSON.parse(data)
        if (log == 1) console.log("今日头条签到data:" + data);
        if (obj.err_no == 0)
            result2 = "金币" + obj.data.score_amount;
        else if (obj.err_no == 1025)
            result2 = "重复签到."
        $iosrule.post(llUrl2, function (error, response, data) {
            var obj = JSON.parse(data)
            if (obj.err_no == 0) {
                result2 += "  连续签到天数:" + obj.data.days;
            }
            papa("[日签到]", result2);
        })
    })
}

//++++++++++++++++++++++++++++++++++++

function formatSeconds(value) {
    let result = parseInt(value)
    let h = Math.floor(result / 3600) < 10 ? '0' + Math.floor(result / 3600) : Math.floor(result / 3600);
    let m = Math.floor((result / 60 % 60)) < 10 ? '0' + Math.floor((result / 60 % 60)) : Math.floor((result / 60 % 60));
    let s = Math.floor((result % 60)) < 10 ? '0' + Math.floor((result % 60)) : Math.floor((result % 60));

    let res = '';
    if (h !== '00') res += `${h}小时`;
    if (m !== '00') res += `${m}分`;
    res += `${s}秒`;
    return res;
}

function cotime(timestamp) {
    const date = new Date(timestamp * 1000)
    const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
    const D = (date.getDate() + 1 < 10 ? '0' + date.getDate() : date.getDate()) + ' '
    const h = date.getHours() + ':'
    const m = (date.getMinutes() + 1 < 10 ? '0' + (date.getMinutes() + 1) : date.getMinutes() + 1) + ''
    return M + D + h + m
}

function papa(y, z) {
    $iosrule.notify(Protagonist, y, z);
}

var time_range = function (beginTime, endTime) {
    var strb = beginTime.split(":");
    if (strb.length != 2) {
        return false;
    }

    var stre = endTime.split(":");
    if (stre.length != 2) {
        return false;
    }

    var b = new Date();
    var e = new Date();
    var n = new Date();

    b.setHours(strb[0]);
    b.setMinutes(strb[1]);
    e.setHours(stre[0]);
    e.setMinutes(stre[1]);

    if (n.getTime() - b.getTime() > 0 && n.getTime() - e.getTime() < 0) {
        return true;
    } else {
        return false;
    }
}

function iosrule() {
    const isRequest = typeof $request != "undefined"
    const isSurge = typeof $httpClient != "undefined"
    const isQuanX = typeof $task != "undefined"
    const notify = (title, subtitle, message) => {
        if (isQuanX) $notify(title, subtitle, message)
        if (isSurge) $notification.post(title, subtitle, message)
    }
    const write = (value, key) => {
        if (isQuanX) return $prefs.setValueForKey(value, key)
        if (isSurge) return $persistentStore.write(value, key)
    }
    const read = (key) => {
        if (isQuanX) return $prefs.valueForKey(key)
        if (isSurge) return $persistentStore.read(key)
    }
    const get = (options, callback) => {
        if (isQuanX) {
            if (typeof options == "string") options = { url: options }
            options["method"] = "GET"
            $task.fetch(options).then(response => {
                response["status"] = response.statusCode
                callback(null, response, response.body)
            }, reason => callback(reason.error, null, null))
        }
        if (isSurge) $httpClient.get(options, callback)
    }
    const post = (options, callback) => {
        if (isQuanX) {
            if (typeof options == "string") options = { url: options }
            options["method"] = "POST"
            $task.fetch(options).then(response => {
                response["status"] = response.statusCode
                callback(null, response, response.body)
            }, reason => callback(reason.error, null, null))
        }
        if (isSurge) $httpClient.post(options, callback)
    }
    const end = () => {
        if (isQuanX) isRequest ? $done({}) : ""
        if (isSurge) isRequest ? $done({}) : $done()
    }
    return { isRequest, isQuanX, isSurge, notify, write, read, get, post, end }
};