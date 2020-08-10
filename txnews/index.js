/*
更新时间: 2020-07-03 00:05
腾讯新闻签到修改版，可以自动阅读文章获取红包，该活动为瓜分百万阅读红包挑战赛，针对幸运用户参与
获取Cookie方法:
1.把以下配置复制到响应配置下
2.打开腾讯新闻app，阅读几篇文章，倒计时结束后即可获取阅读Cookie;
3.脚本运行一次阅读一篇文章，请不要连续运行，防止封号，可设置每几分钟运行一次
4.可能腾讯有某些限制，有些号码无法领取红包，手动阅读几篇，能领取红包，一般情况下都是正常的，
5.此脚本根据阅读篇数开启通知，默认20篇，此版本和另一版本相同
6.版本更新日志:
1.01 获取金币专用，阅读和视频次数有间隔，自己设定运行时间，大概5-8分钟一次，增加获取视频地址，看一圈视频即可获取，修改重写为请求body‼️

---------------------
Loon 2.1.0+
[Script]
# 本地脚本
cron "04 00 * * *" script-path=https://raw.staticdn.net/iepngs/Scripts/master/txnews/index.js, enabled=true, tag=腾讯新闻

http-request https:\/\/api\.inews\.qq\.com\/event\/v1\/user\/event\/report\? script-path=index.js, requires-body=true

-----------------
QX 1.0.7+ :
 [task_local]
0 9 * * * txnews.js, tag=腾讯新闻
 [rewrite_local]
https:\/\/api\.inews\.qq\.com\/event\/v1\/user\/event\/report\? url script-request-body index.js

~~~~~~~~~~~~~~~~~~
 [MITM]
hostname = api.inews.qq.com

---------------------------

Cookie获取后，请注释掉Cookie地址。

*/


const $hammer = (() => {
    const isRequest = "undefined" != typeof $request,
        isSurge = "undefined" != typeof $httpClient,
        isQuanX = "undefined" != typeof $task;

    const log = (...n) => {
        for (let i in n) console.log(n[i])
    };
    const alert = (title, body = "", subtitle = "", options = {}) => {
        // option(<object>|<string>): {open-url: <string>, media-url: <string>}
        let link = null;
        switch (typeof options) {
            case "string":
                link = isQuanX ? {
                    "open-url": options
                } : options;
                break;
            case "object":
                if (["null", "{}"].indexOf(JSON.stringify(options)) == -1) {
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
    return {
        isRequest, isSurge, isQuanX, log, alert, read, write, request, done
    };
})();

// ----------------------------------------------------
const notifyInterval = 3 //视频红包间隔通知开为1，常关为0
const showlog = 1; // 日志开关，0为关，1为开
const cookieName = '腾讯新闻';
const signurlVal = $hammer.read('sy_signurl_txnews');
const cookieVal = $hammer.read('sy_cookie_txnews');
const videoVal = $hammer.read('video_txnews');

// ----------------------------------------------------
let signinfo = '',
    Dictum = '',
    readnum = '',
    readtitle = '',
    openreadred = '',
    readredtotal = '',
    videonum = '',
    videotitle = '',
    openvideored = '',
    videoredtotal = '',
    readcoins = '',
    // videocoins = '',
    getreadred = '',
    redpackres = '',
    subTile = '',
    ID = signurlVal.match(/devid=[a-zA-Z0-9_-]+/g);

async function main() {
    await getsign();
    await toRead();
    await Tasklist();
    await lookVideo();
    await openApp();
    await StepsTotal();
    await Redpack();
    await videoPack();
    await getTotal();
    await showmsg();
}

//签到
function getsign() {
    return new Promise((resolve, reject) => {
        const options = {
            url: `https://api.inews.qq.com/task/v1/user/signin/add?`,
            headers: {
                Cookie: cookieVal
            },
        };
        $hammer.request('post', options, (error, response, data) => {
            if (error) {
                return $hammer.log(`${cookieName} 签到 - getsign error:`, error);
            }
            showlog && $hammer.log(`${cookieName}签到 - getsign: ${response}`);
            const obj = JSON.parse(response);
            if (obj.info == "success") {
                const next = obj.data.next_points;
                const tip = obj.data.share_tip;
                Dictum = tip.replace(/[\<|\.|\>|br]/g, "") + "" + obj.data.author.replace(/[\<|\.|\>|br|图|腾讯网友]/g, "");
                signinfo = '【签到信息】连续签到' + obj.data.signin_days + '天 明日+' + next + '金币 成功🎉\n';
                return resolve();
            }
            $hammer.alert('签到失败，🉐登录腾讯新闻app获取cookie');
            $hammer.log('签到失败，🉐登录腾讯新闻app获取cookie:', data);
        })
    })
}


//阅读阶梯
function toRead() {
    return new Promise((resolve, reject) => {
        const options = {
            url: signurlVal,
            headers: {
                Cookie: cookieVal
            },
            body: 'event=article_read'
        };
        $hammer.request('post', options, (error, response, data) => {
            if (error) {
                return $hammer.log(`${cookieName} - 阅读文章 getsign error:`, error);
            }
            showlog && $hammer.log(`${cookieName}阅读文章 - data: ${response}`);
            const toread = JSON.parse(response);
            try {
                if (toread.info == 'success' && toread.data.activity.id) {
                    //RedID = toread.data.activity.id
                    readcoins = toread.data.countdown_timer.countdown_tips;
                }
            } catch (error) {
                return $hammer.alert(cookieName, error.message, '无法获取活动ID');
            }
            resolve();
        })
    })
}

function lookVideo() {
    return new Promise((resolve, reject) => {
        const options = {
            url: videoVal,
            headers: {
                Cookie: cookieVal
            },
            body: 'event=video_read'
        };
        $hammer.request('post', options, (error, response, data) => {
            if (error) {
                $hammer.alert(cookieName, '观看视频:' + error);
            } else {
                showlog && $hammer.log(`${cookieName}观看视频 - data: ${response}`);
                tolookresult = JSON.parse(response)
                if (tolookresult.info == 'success') {
                    //RedID = tolookresult.data.activity.id
                    // videocoins = tolookresult.data.countdown_timer.countdown_tips;
                }
            }
            resolve();
        })
    })
}

function runtask(task, delay) {
    return new Promise(resolve => {
        const options = {
            url: `http://4ul.cn/${task}`,
            headers: {
                Cookie: cookieVal
            },
        };
        $hammer.request('post', options, (error, response, data) => {
            if(error){
                $hammer.log(`tasks.runtask error(${data.status}):`, options, data);
            }else{
                try {
                    const taskresult = JSON.parse(response);
                    if (taskresult.info == 'success') {
                        showlog && $hammer.log(`任务成功,总金币: ${taskresult.data.points}\n${data}`);
                    } else {
                        showlog && $hammer.log(`${cookieName}每日任务 - data: ${response}`);
                    }
                } catch (error) {
                    if(data && data.status == 200){
                        let refreshurl = /<meta .* content="0; url=(.*)"><\/head>/.exec(response);
                        refreshurl = refreshurl ? refreshurl[1] : false;
                        $hammer.log(`response request refresh url: ${refreshurl}`);
                        //$hammer.request('get', refreshurl, (error,response)=>{})
                    }
                    showlog && $hammer.log(`${cookieName}每日任务 - data: ${error.message}, detail:`, data);
                    data = {status: 403};
                }
            }
            setTimeout(()=>{
                resolve(data);
            }, delay);
        });
    });
}

function tasks() {
    return new Promise(async (resolve, reject) => {
        const tasklist = ['9w6zkk', 'kl5p8h', 'erq8vx', 'aqyd3z', 'jslzr5', 'l7glnd', 'o96j0h', 'mide1n', 'u8z8vk'];
        for (i = 0; i < tasklist.length; i++) {
            const resp = await runtask(tasklist[i], (i + 1) * 500);
            if(resp.status == 403 || resp.status == 404){
                break;
            }
        }
        resolve();
    })
}

function Tasklist() {
    return new Promise((resolve, reject) => {
        const token = signurlVal.split('?')[1];
        const options = {
            url: `https://api.inews.qq.com/task/v1/usermergetask/list?${token}`,
            headers: {
                Cookie: cookieVal
            },
        }
        $hammer.request('get', options, async (error, response, data) => {
            showlog && $hammer.log(`${cookieName}- Tasklist.data: ${response}`);
            tasklist = JSON.parse(response);
            tasklist = tasklist.data.task_list;
            for (const item of tasklist) {
                if (item.task_quota != item.task_rate){
                    await tasks();
                    break;
                }
            }
            resolve();
        })
    })
}

//阅读文章统计
function StepsTotal() {
    return new Promise((resolve, reject) => {
        const options = {
            url: `https://api.inews.qq.com/activity/v1/activity/info/get?activity_id=readtask_welfare_lowactive&${ID}`,
            headers: {
                Cookie: cookieVal
            },
        };
        $hammer.request('get', options, (error, response, data) => {
            showlog && $hammer.log(`${cookieName}统计- data: ${response}`)
            const totalred = JSON.parse(response);
            if (totalred.ret == 0) {
                for (i = 0; i < totalred.data.award.length; i++) {
                    if (totalred.data.award[i].type == 'article') {
                        readredtotal = totalred.data.award[i].total;
                        readtitle = totalred.data.award[i].title.split("，")[0].replace(/[\u4e00-\u9fa5]/g, ``);
                        getreadred = totalred.data.award[i].can_get;
                        openreadred = totalred.data.award[i].opened;
                        readnum = totalred.data.award[i].event_num;
                    }
                    if (totalred.data.award[i].type == 'video') {
                        videoredtotal = totalred.data.award[i].total;
                        videotitle = totalred.data.award[i].title.split("，")[0].replace(/[\u4e00-\u9fa5]/g, ``);
                        getreadred = totalred.data.award[i].can_get;
                        openvideored = totalred.data.award[i].opened;
                        videonum = totalred.data.award[i].event_num / 2;
                    }
                }
            }
            resolve();
        })
    })
}

function openApp() {
    return new Promise((resolve, reject) => {
        const options = {
            url: `https://api.inews.qq.com/activity/v1/activity/redpack/get?isJailbreak=0&${ID}`,
            headers: {
                Cookie: cookieVal
            },
            body: `redpack_type=free_redpack&activity_id=readtask_welfare_lowactive`
        }
        $hammer.request('post', options, (error, response, data) => {
            showlog && $hammer.log(`${cookieName}每日开启- data: ${response}`);
            let opcash = JSON.parse(response);
            if (opcash.data.award.num) {
                redpackres = `【每日开启】到账` + opcash.data.award.num / 100 + ` 元 🌷\n`;
            }
        })
        resolve();
    })
}

//阶梯红包到账
function Redpack() {
    return new Promise((resolve, reject) => {
        const options = {
            url: `https://api.inews.qq.com/activity/v1/activity/redpack/get?isJailbreak=0&${ID}`,
            headers: {
                Cookie: cookieVal
            },
            body: `redpack_type=article&activity_id=readtask_welfare_lowactive`
        }
        $hammer.request('post', options, (error, response, data) => {
            showlog && $hammer.log(`${cookieName}阅读红包- data: ${response}`);
            let rcash = JSON.parse(response);
            try {
                readredpack = Number();
                if (rcash.ret == 0) {
                    for (i = 0; i < rcash.data.award.length; i++) {
                        readredpack += rcash.data.award[i].num / 100;
                    }
                    if (readredpack != 0) {
                        redpackres += `【阅读红包】到账` + readredpack + ` 元 🌷\n`;
                    }
                }
            } catch (e) {
                $hammer.log(`阅读文章error:` + e.message);
            }
            resolve()
        })
    })
}

function videoPack() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const options = {
                url: `https://api.inews.qq.com/activity/v1/activity/redpack/get?isJailbreak=0&${ID}`,
                headers: {
                    Cookie: cookieVal
                },
                body: `redpack_type=video&activity_id=readtask_welfare_lowactive`
            };
            $hammer.request('post', options, (error, response, data) => {
                showlog && $hammer.log(`${cookieName}视频红包-data:${response}`);
                let vcash = JSON.parse(response);
                let videoredpack = Number();
                if (vcash.ret == 0) {
                    for (i = 0; i < vcash.data.award.length; i++) {
                        videoredpack += vcash.data.award[i].num / 100;
                    }
                    if (videoredpack != 0) {
                        redpackres += `【视频红包】到账` + videoredpack + ` 元 🌷\n`
                    }
                }
                resolve();
            })
        }, 100);
    });
}

//收益总计
function getTotal() {
    return new Promise((resolve, reject) => {
        const options = {
            url: `https://api.inews.qq.com/activity/v1/usercenter/activity/list?isJailbreak`,
            headers: {
                Cookie: cookieVal
            }
        };
        $hammer.request('post', options, function (error, response, data) {
            if (error) {
                $hammer.alert("获取收益信息失败‼️", '', error);
            } else {
                showlog && $hammer.log("获取收益信息:", response)
                const obj = JSON.parse(response)
                subTile = '【收益总计】' + obj.data.wealth[0].title + '金币  ' + "现金: " + obj.data.wealth[1].title + '元';
            }
            resolve();
        })
    })
}

function showmsg() {
    return new Promise((resolve, reject) => {
        const detail = signinfo + `` + `【文章阅读】已读/再读: ` + readnum + `/` + readtitle + ` 篇\n` + `【阅读红包】已开/总计: ` + openreadred + `/` + readredtotal + ` 个🧧\n` + `【观看视频】已看/再看: ` + videonum + `/` + videotitle + ` 分钟\n` + `【视频红包】已开/总计: ` + openvideored + `/` + videoredtotal + ` 个🧧\n【每日一句】` + Dictum + `\n`
        $hammer.log(subTile + `\n` + detail);
        if (notifyInterval == 1) {
            $hammer.alert(cookieName, detail, subTile);
        } else if (openreadred == readredtotal && openvideored != videoredtotal) {
            $hammer.alert(cookieName + ` 阅读任务已完成✅`, detail, subTile);
        } else if (openreadred == readredtotal && openvideored == videoredtotal) {
            $hammer.alert(cookieName + ` 今日任务已完成✅`, detail, subTile);
        } else if (openreadred % notifyInterval == 0 && readcoins == "红包+1") {
            $hammer.alert(cookieName, detail, subTile);
        }
        resolve();
    })
}

function flushCookie() {
    const requrl =  $request.url;
    if ($request.body.indexOf("article_read") > 0) {
        const cookieVal = $request.headers.Cookie;
        $hammer.log(`txnews signurlVal:${requrl}`);
        $hammer.log(`txnews cookieVal:${cookieVal}`);
        $hammer.write(requrl, 'sy_signurl_txnews');
        $hammer.write(cookieVal,  'sy_cookie_txnews');
        $hammer.alert(cookieName, `获取Cookie: 成功🎉`, ``);
    }
    if ($request.body.indexOf("video_read") > 0 ) {
        $hammer.log(`txnews videoVal:${requrl}`);
        $hammer.write(requrl, 'video_txnews');
        $hammer.alert(cookieName, `获取视频地址: 成功🎉`);
    }
}

$hammer.isRequest ? flushCookie() : main();