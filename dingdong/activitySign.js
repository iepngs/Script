// 叮咚网红打卡免费领
// 首页-网红打卡地-打卡免费领banner - 手动签到一次，次日起可用
// app下载⏬：

// ----------------------------------------------------------------------------

// QX
// [MITM]
// hostname=gw.api.ddxq.mobi

// [rewrite_local]
// ^https:\/\/gw\.api\.ddxq\.mobi\/promocore-service\/client\/maicai\/mcActivityTrigger\/v1\/trigger url script-request-body https://raw.githubusercontent.com/iepngs/Script/master/dingdong/activitySign.js

// [local_tasK]
// 7 0 * * * https://raw.githubusercontent.com/iepngs/Script/master/dingdong/activitySign.js, tag=叮咚网红打卡

// ----------------------------------------------------------------------------
// Loon

// [MITM]
// hostname=gw.api.ddxq.mobi

// [Script]
// http-request ^https:\/\/gw\.api\.ddxq\.mobi\/promocore-service\/client\/maicai\/mcActivityTrigger\/v1\/trigger script-path=https://raw.githubusercontent.com/iepngs/Script/master/dingdong/activitySign.js, requires-body=true, timeout=10, tag=叮咚网红打卡Cookie
// cron "7 0 * * *" script-path=https://raw.githubusercontent.com/iepngs/Script/master/dingdong/activitySign.js,tag=叮咚网红打卡

// ----------------------------------------------------------------------------

const $ = hammer("叮咚网红打卡");
const CookieKey = "CookieDDXQSign";

function GetCookie() {
    const CookieVal = JSON.stringify({
        c: $request.headers.Cookie,
        u: $request.headers['User-Agent'],
        b: $request.body,
    });
    $.log(`cookie:\n ${CookieVal}`);
    $.write(CookieVal, CookieKey);
    $.alert('签到Cookie写入成功');
    $.done();
}

async function main() {
    let CookieVal = $.read(CookieKey);
    CookieVal = CookieVal ? JSON.parse(CookieVal) : "";
    if(!CookieVal){
        $.log("Cookie不存在，中止运行.");
        return $.done();
    }
    const options = {
        url: "https://gw.api.ddxq.mobi/promocore-service/client/maicai/mcActivityTrigger/v1/trigger",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Cookie": CookieVal.c,
            "User-Agent": CookieVal.u
        },
        body: CookieVal.b.replace(/&bizNo=\d+/, "&bizNo=" + (+new Date()).toString())
    };
    $.request('post', options, (error, response, data) => {
        if(error){
            $.log(`sign request error: \n${error}`);
            return resolve();
        }
        $.log(`sign response: \n${response}`);
        response = JSON.parse(response);
        if (response.msg == "请求成功" && !response.code) {
            $.alert('今日打卡成功');
            return resolve();
        }
        $.alert(response.msg);
        $.done();
    })
}

$.isRequest ? GetCookie() : main();

function hammer(t = "untitled", l = 1) { return new class { constructor(t, l) { this.name = t, this.logLevel = l, this.isRequest = "undefined" != typeof $request, this.isSurge = "undefined" != typeof $httpClient, this.isQuanX = "undefined" != typeof $task, this.isNode = "function" == typeof require, this.node = (() => { if (!this.isNode) { return null } const file = "localstorage.yml"; let f, y, r; try { f = require('fs'); y = require('js-yaml'); r = require('request'); f.appendFile(file, "", function (err) { if (err) throw err; }) } catch (e) { console.log("install unrequired module by: yarn add module_name"); console.log(e.message); return {} } return { file: file, fs: f, yaml: y, request: r, } })() } log(...n) { if (l < 2) { return null } console.log(`\n***********${this.name}***********`); for (let i in n) console.log(n[i]) } alert(body = "", subtitle = "", options = {}) { if (l == 2 || l == 0) { return null } if (typeof options == "string") { options = { "open-url": options } } let link = null; if (Object.keys(options).length) { link = this.isQuanX ? options : { openUrl: options["open-url"], mediaUrl: options["media-url"] } } if (this.isSurge) return $notification.post(this.name, subtitle, body, link); if (this.isQuanX) return $notify(this.name, subtitle, body, link); console.log(`系统通知📣\ntitle:${this.name}\nsubtitle:${subtitle}\nbody:${body}\nlink:${link}`) } request(method, params, callback) { let options = {}; if (typeof params == "string") { options.url = params } else { options.url = params.url; if (typeof params == "object") { params.headers && (options.headers = params.headers); params.body && (options.body = params.body) } } method = method.toUpperCase(); const writeRequestErrorLog = function (m, u) { return err => console.log(`${this.name}request error:\n${m}${u}`, err) }(method, options.url); if (this.isSurge) { const _runner = method == "GET" ? $httpClient.get : $httpClient.post; return _runner(options, (error, response, body) => { if (error == null || error == "") { response.body = body; callback("", body, response) } else { writeRequestErrorLog(error); callback(error, "", response) } }) } options.method = method; if (this.isQuanX) { $task.fetch(options).then(response => { response.status = response.statusCode; delete response.statusCode; callback("", response.body, response) }, reason => { writeRequestErrorLog(reason.error); response.status = response.statusCode; delete response.statusCode; callback(reason.error, "", response) }) } if (this.isNode) { if (options.method == "POST" && options.body) { try { options.body = JSON.parse(options.body); options.json = true } catch (e) { console.log(e.message) } } this.node.request(options, (error, response, body) => { if (typeof body == "object") { body = JSON.stringify(body) } if (typeof response == 'object' && response) { response.status = response.statusCode; delete response.statusCode } callback(error, body, response) }) } } read(key) { if (this.isSurge) return $persistentStore.read(key); if (this.isQuanX) return $prefs.valueForKey(key); if (this.isNode) { let val = ""; try { const fileContents = this.node.fs.readFileSync(this.node.file, "utf8"); const data = this.node.yaml.safeLoad(fileContents); val = (typeof (data) == "object" && data[key]) ? data[key] : "" } catch (e) { console.log(`读取文件时错误:\n${e.message}`); return "" } return val } } write(val, key) { if (this.isSurge) return $persistentStore.write(val, key); if (this.isQuanX) return $prefs.setValueForKey(val, key); if (this.isNode) { try { const fileContents = this.node.fs.readFileSync(this.node.file, "utf8"); let data = this.node.yaml.safeLoad(fileContents); data = typeof data == "object" ? data : {}; data[key] = val; val = this.node.yaml.safeDump(data); this.node.fs.writeFileSync(this.node.file, val, 'utf8') } catch (e) { console.log(e.message); return false } return true } } delete(key) { if (this.isNode) { try { const fileContents = this.node.fs.readFileSync(this.node.file, "utf8"); let data = this.node.yaml.safeLoad(fileContents); data = typeof data == "object" ? data : {}; if (!data.hasOwnProperty(key)) { return true } delete data[key]; const val = this.node.yaml.safeDump(data); this.node.fs.writeFileSync(this.node.file, val, 'utf8') } catch (e) { console.log(e.message); return false } return true } } done(value = {}) { if (this.isQuanX) return this.isRequest ? $done(value) : null; if (this.isSurge) return this.isRequest ? $done(value) : $done() } pad(s = false, c = "*", l = 15) { return s ? this.log(c.padEnd(l, c)) : `\n${c.padEnd(l, c)}\n` } }(t, l) }