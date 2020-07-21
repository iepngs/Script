const $hammer = (() => { const isRequest = "undefined" != typeof $request, isSurge = "undefined" != typeof $httpClient, isQuanX = "undefined" != typeof $task; const log = (...n) => { for (let i in n) console.log(n[i]) }; const alert = (title, body = "", subtitle = "", options = {}) => { let link = null; switch (typeof options) { case "string": link = isQuanX ? { "open-url": options } : options; break; case "object": if (["null", "{}"].indexOf(JSON.stringify(options)) == -1) { link = isQuanX ? options : options["open-url"]; break } default: link = isQuanX ? {} : "" }if (isSurge) return $notification.post(title, subtitle, body, link); if (isQuanX) return $notify(title, subtitle, body, link); log("==============📣系统通知📣=============="); log("title:", title, "subtitle:", subtitle, "body:", body, "link:", link) }; const read = key => { if (isSurge) return $persistentStore.read(key); if (isQuanX) return $prefs.valueForKey(key) }; const write = (val, key) => { if (isSurge) return $persistentStore.write(val, key); if (isQuanX) return $prefs.setValueForKey(val, key) }; const request = (method, params, callback) => { let options = {}; if (typeof params == "string") { options.url = params } else { options.url = params.url; if (typeof params == "object") { params.headers && (options.headers = params.headers); params.body && (options.body = params.body) } } method = method.toUpperCase(); const writeRequestErrorLog = function (m, u) { return err => { log(`\n===request error-s--\n`); log(`${m} ${u}`, err); log(`\n===request error-e--\n`) } }(method, options.url); if (isSurge) { const _runner = method == "GET" ? $httpClient.get : $httpClient.post; return _runner(options, (error, response, body) => { if (error == null || error == "") { response.body = body; callback("", body, response) } else { writeRequestErrorLog(error); callback(error, "", response) } }) } if (isQuanX) { options.method = method; $task.fetch(options).then(response => { response.status = response.statusCode; delete response.statusCode; callback("", response.body, response) }, reason => { writeRequestErrorLog(reason.error); response.status = response.statusCode; delete response.statusCode; callback(reason.error, "", response) }) } }; const done = (value = {}) => { if (isQuanX) return isRequest ? $done(value) : null; if (isSurge) return isRequest ? $done(value) : $done() }; return { isRequest, isSurge, isQuanX, log, alert, read, write, request, done } })();
function http_build_query(obj) { let s = []; for (const key in obj) { s.push(`${key}=${encodeURIComponent(obj[key])}`); } return s.join("&"); }

const Protagonist = "每日资讯简报";

const dateObj = new Date();
function day() { return ["一", "二", "三", "四", "五", "六", "七"][dateObj.getDay() - 1]; }
const date = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
const week = `星期${day()}`;
let globalOptions = {};

function buildRequestOption(link) {
    return {
        url: link,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36",
        }
    };
}

function spider() {
    return new Promise(resolve => {
        const host = "https://weixin.sogou.com";
        const query = http_build_query({ query: `【${Protagonist}】${date} ${week}`, type: 2, ie: "utf8" });
        globalOptions = buildRequestOption(`${host}/weixin?${query}`);

        $hammer.request("get", globalOptions, (error, response, data) => {
            if (error) {
                $hammer.log(`${Protagonist} request error:`, data);
                return resolve(false);
            }
            let pattern = /<div class="mun">找到约(\d+)条结果/;
            let matcher = pattern.exec(response);
            matcher = matcher ? ~~matcher[1] : 0;
            if (matcher < 1) {
                return resolve(false);
            }

            matcher = /href="(.*)" id=".*" uigs="article_title_0"/.exec(response);
            matcher = matcher ? `${host}${matcher[1]}` : "";
            if (!matcher) {
                return resolve(false);
            }
            matcher = matcher.replace(/&amp;/g, "&").replace(/\s/g, "%20");
            $hammer.log(`${Protagonist} response matcher:`, matcher);
            $hammer.alert(Protagonist, `${date} ${week}`, "", matcher);
            setTimeout(()=>{
                resolve(matcher);
            }, 1500);
        })
    })
};

function getContent(link) {
    return new Promise(resolve => {
        globalOptions.url = link;
        $hammer.log("options.url:", globalOptions.url)
        $hammer.request("get", globalOptions, (error, response, data) => {
            if (error) {
                $hammer.log(`${Protagonist} link error:`, error, globalOptions, data);
                return resolve(false);
            }
            $hammer.log(`${Protagonist} link response:`, response);

            let prelink = /src = '(.*)';/.exec(response);
            prelink = prelink ? prelink[1].replace(/'\s\+\s'/g, "") : "";
            if(!prelink){
                $hammer.log(`${Protagonist} match prelink error`);
                return resolve(false);
            }
            globalOptions.url = prelink;
            globalOptions.headers["Referer"] = link;
            $hammer.request('get', globalOptions, () =>{
                resolve(response);
            })
        })
    })
}

function resource(response){
    return new Promise(resolve => {
        const re = /url \+= '(.*)';/,
        reg = /url \+= '(.*)';/g;
        let data = [];
        while (true) {
            const temp = reg.exec(response);
            if(temp == null){
                break;
            }
            data.push(temp[1]);
        }
        const finalLink = data.join("").replace("@", "");
        $hammer.log(`${Protagonist} finalLink: \n${finalLink}`);

        globalOptions.url = finalLink;
        $hammer.request('get', globalOptions, (error, response, data) => {
            if (error) {
                $hammer.log(`${Protagonist} finalLink error:`, error, globalOptions, data);
                return resolve(false);
            }
            $hammer.log(`${Protagonist} finalLink response:`, response);
            $hammer.alert(`${Protagonist}`, response);
            resolve(true);
        })
    })
}

(async () => {
    try {
        const target = await spider();
        if (target) {
            const resp = await getContent(target);
            await resource(resp);
        }
    } catch (error) {
        $hammer.log(error.message);
    }
    $hammer.done();
})();
