
// 来源：
// https://raw.githubusercontent.com/photonmang/quantumultX/master/xxysrw.js

const $ = hammer('小小影视', 3);
const CookieKey = 'py_signheader_xxys';
let CookieVal = '';
const host = 'https://uv4tq1fvpg5gy5r5lkq9.hnhx360.com';
let message = '';

function GetCookie() {
    CookieVal = JSON.stringify($request.headers);
    $.log(CookieVal);
    $.write(CookieVal, 'py_signheader_xxys');
    $.alert(CookieVal, "获取Cookie成功");
    $.done();
}

function nowTs(){
    return (+new Date()).toString();
}

function buildRequestOptions(uri, body = ''){
    return options = {
        url: `${host}/${uri}`,
        headers: JSON.parse(CookieVal),
        body: body
    };
}

function sign() {
    return new Promise(resolve => {
        const options = buildRequestOptions('ucp/task/sign');
        $.request('post', options, (error, response, data) => {
            if(error){
                $.log(`sign request error:\n ${error}`);
                return resolve();
            }
            $.log(`sign response:\n ${response}`);
            const result = JSON.parse(response);
            if (result.retcode == 0) {
                message += `签到结果: ${result.retcode ? response : '成功'}\n`;
            }
            resolve();
        })
    })
}

function pl() {
    return new Promise(resolve => {
        const body = '{_t=' + nowTs() + '&content=%E6%B5%8B%E8%AF%95%E4%B8%80%E4%B8%8B&parentid=0&pid=&s_device_id=2D1749C8-38B2-4859-A2FC-4BF783C533A3&s_os_version=13.3&s_platform=ios&vodid=62894}'
        const options = buildRequestOptions('comment/post', body);
        $.request('post', options, (error, response, data) => {
            if(error){
                $.log(`pl request error:\n ${error}`);
                return resolve();
            }
            $.log(`pl response:\n ${response}`);
            const result = JSON.parse(response);
            message += `评论结果: ${result.retcode ? response : '成功'}\n`;
            resolve();
        })
    })
}

function ad() {
    return new Promise(resolve => {
        const options = buildRequestOptions('ucp/task/adviewClick?');
        $.request('post', options, (error, response, data) => {
            if(error){
                $.log(`ad request error:\n ${error}`);
                return resolve();
            }
            $.log(`ad response:\n ${response}`);
            const result = JSON.parse(response);
            message += `广告结果: ${result.retcode ? response : '成功'}\n`;
            resolve();
        })
    })
}

function fx() {
    return new Promise(resolve => {
        const url = `ucp/task/share?_t=${nowTs()}&pid=&s_device_id=2D1749C8-38B2-4859-A2FC-4BF783C533A3&s_os_version=13.3&s_platform=ios&vodid=62935`;
        const options = buildRequestOptions(url);
        $.request('post', options, (error, response, data) => {
            if(error){
                $.log(`fx request error:\n ${error}`);
                return resolve();
            }
            $.log(`fx response:\n ${response}`);
            const result = JSON.parse(response);
            message += `分享结果: ${result.retcode ? response : '成功'}\n`;
            resolve();
        })
    })
}

function sc1() {
    return new Promise(resolve => {
        const ID = Math.floor(Math.random() * 60000 + 10);
        const body = '_t='+nowTs()+'&pid=&s_device_id=2D1749C8-38B2-4859-A2FC-4BF783C533A3&s_os_version=13.3&s_platform=ios&vodid=' + ID
        const options = buildRequestOptions(`favorite/add`, body);
        $.request('post', options, (error, response, data) => {
            if(error){
                $.log(`sc1 request error:\n ${error}`);
                return resolve();
            }
            $.log(`sc1 response:\n ${response}`);
            const result = JSON.parse(response);
            message += `收藏结果: ${result.retcode ? response : '成功'}\n`;
            resolve();
        })
    })
}

function scRequest(index){
    return new Promise(resolve => {
        const ID = Math.floor(Math.random() * 60000 + 10);
        const body = '_t='+nowTs()+'&pid=&s_device_id=2D1749C8-38B2-4859-A2FC-4BF783C533A3&s_os_version=13.3&s_platform=ios&vodid=' + ID
        const options = buildRequestOptions(`favorite/add`, body);
        $.request('post', options, (error, response, data) => {
            if(error){
                $.log(`sc request error:\n ${error}`);
                return resolve(0);
            }
            $.log(`sc response:\n ${response}`);
            const result = JSON.parse(response);
            message += `第${index}次收藏结果: ${result.retcode ? response : '成功'}\n`;
            if(result.retcode == -1){
                return resolve(1);
            }
            setTimeout(()=>{
                resolve(2);
            }, 2000);
        })
    })
}

function sc() {
    return new Promise(async resolve => {
        let runTimes = 0;
        let success = 0;
        while (true) {
            if(success > 5 || runTimes > 12){
                break;
            }
            if((await scRequest(runTimes++)) == 1){
                continue;
            }
            success++;
        }
        resolve();
    })
}
function boxall() {
    return new Promise(async resolve => {
        await box();
        if ((new Date()).getDay() == 6) {
            await box6();
        }
        resolve();
    })
}

function box6() {
    return new Promise(resolve => {
        const options = buildRequestOptions(`ucp/taskbox/taskboxopen?taskid=1622`);
        $.request('post', options, (error, response, data) => {
            if(error){
                $.log(`box6 request error:\n ${error}`);
                return resolve(0);
            }
            $.log(`box6 response:\n ${response}`);
            const result = JSON.parse(response);
            message += `周六宝箱: ${result.retcode ? response : '成功'}\n`;
            if(result.retcode == -1){
                return resolve(1);
            }
            resolve(2);
        })
    })
}

function box() {
    return new Promise(resolve => {
        const options = buildRequestOptions(`ucp/taskbox/taskboxopen?taskid=1022`);
        $.request('post', options, (error, response, data) => {
            if(error){
                $.log(`box request error:\n ${error}`);
                return resolve(0);
            }
            $.log(`box response:\n ${response}`);
            const result = JSON.parse(response);
            message += `每日宝箱: ${result.retcode ? response : '成功'}\n`;
            resolve(result.retcode == -1 ? 1 : 2);
        })
    })
}

function reqplay(index) {
    return new Promise(resolve => {
        const num = Math.floor(Math.random() * 60000 + 10);
        const url = "vod/reqplay/" + num + "?_t="+nowTs()+"&pid=&playindex=1";
        const options = buildRequestOptions(url);
        $.request('post', options, (error, response, data) => {
            if(error){
                $.log(`reqplay request error:\n ${error}`);
                return resolve();
            }
            $.log(`reqplay response:\n ${response}`);
            const result = JSON.parse(response);
            message += `第${index}次收藏结果: ${result.retcode ? response : '成功'}\n`;
            let ret = 0;
            switch (result.retcode) {
                case 0:
                    // 成功
                    ret = 0;
                    break;
                case 3:
                    // 今日观看次数已看完
                    ret = 3;
                    break;
                default:
                    ret = 1;
                    break;
            }
            setTimeout(() => {
                resolve(ret);
            }, Math.ceil(Math.random()*10000));
        })
    })
}

function ten() {
    return new Promise(async resolve => {
        let runTimes = 0;
        let success = 0;
        while (true) {
            if(success > 5 || runTimes > 12){
                break;
            }
            const ret = await reqplay(runTimes++);
            if(ret == 3){
                break;
            }
            if(!ret){
                success++;
            }
        }
        resolve();
    })
}

function play() {
    return new Promise(resolve => {
        const options = buildRequestOptions("vod/playhb/53376?");
        $.request('post', options, (error, response, data) => {
            if(error){
                $.log(`play request error:\n ${error}`);
                return resolve();
            }
            $.log(`play response:\n ${response}`);
            resolve();
        })
    })
}

async function main() {
    CookieVal = $.read(CookieKey);
    if(!CookieVal){
        $.log("Cookie不存在，中止运行.");
        return $.done();
    }
    const date  = new Date();
    const hour  = date.getHours();
    const min   = date.getMinutes();
    const s     = date.getSeconds();
    if (hour == 22 && min == 0 && s == 10) {
        await boxall()//开启宝箱
    }else if (hour == 9 && min == 0 && s == 10) {
        await sign()  //签到
        await pl()    //评论
        await ad()    //广告
        await fx()    //分享
        await sc()    //收藏
        await ten()   //10次观影
    }else if (hour == 9 && min <= 30) {
        await play()  //30分钟观影
    }
    $.done();
}

$.isRequest ? GetCookie() : main();

function hammer(t = "untitled", l = 3) { return new class { constructor(t, l) { this.name = t, this.logLevel = l, this.isRequest = ("object" == typeof $request) && $request.method != "OPTIONS", this.isSurge = "undefined" != typeof $httpClient, this.isQuanX = "undefined" != typeof $task, this.isNode = "function" == typeof require, this.node = (() => { if (!this.isNode) { return null } const file = "localstorage.yml"; let f, y, r; try { f = require('fs'); y = require('js-yaml'); r = require('request'); f.appendFile(file, "", function (err) { if (err) throw err; }) } catch (e) { console.log("install unrequired module by: yarn add module_name"); console.log(e.message); return {} } return { file: file, fs: f, yaml: y, request: r, } })() } log(...n) { if (l < 2) { return null } console.log(`\n***********${this.name}***********`); for (let i in n) console.log(n[i]) } alert(body = "", subtitle = "", options = {}) { if (l == 2 || l == 0) { return null } if (typeof options == "string") { options = { "open-url": options } } let link = null; if (Object.keys(options).length) { link = this.isQuanX ? options : { openUrl: options["open-url"], mediaUrl: options["media-url"] } } if (this.isSurge) return $notification.post(this.name, subtitle, body, link); if (this.isQuanX) return $notify(this.name, subtitle, body, link); console.log(`系统通知📣\ntitle:${this.name}\nsubtitle:${subtitle}\nbody:${body}\nlink:${link}`) } request(method, params, callback) { let options = {}; if (typeof params == "string") { options.url = params } else { options.url = params.url; if (typeof params == "object") { params.headers && (options.headers = params.headers); params.body && (options.body = params.body) } } method = method.toUpperCase(); const writeRequestErrorLog = function (m, u) { return err => console.log(`${this.name}request error:\n${m}${u}`, err) }(method, options.url); if (this.isSurge) { const _runner = method == "GET" ? $httpClient.get : $httpClient.post; return _runner(options, (error, response, body) => { if (error == null || error == "") { response.body = body; callback("", body, response) } else { writeRequestErrorLog(error); callback(error, "", response) } }) } options.method = method; if (this.isQuanX) { $task.fetch(options).then(response => { response.status = response.statusCode; delete response.statusCode; callback("", response.body, response) }, reason => { writeRequestErrorLog(reason.error); response.status = response.statusCode; delete response.statusCode; callback(reason.error, "", response) }) } if (this.isNode) { if (options.method == "POST" && options.body) { try { options.body = JSON.parse(options.body); options.json = true } catch (e) { console.log(e.message) } } this.node.request(options, (error, response, body) => { if (typeof body == "object") { body = JSON.stringify(body) } if (typeof response == 'object' && response) { response.status = response.statusCode; delete response.statusCode } callback(error, body, response) }) } } read(key) { if (this.isSurge) return $persistentStore.read(key); if (this.isQuanX) return $prefs.valueForKey(key); if (this.isNode) { let val = ""; try { const fileContents = this.node.fs.readFileSync(this.node.file, "utf8"); const data = this.node.yaml.safeLoad(fileContents); val = (typeof (data) == "object" && data[key]) ? data[key] : "" } catch (e) { console.log(`读取文件时错误:\n${e.message}`); return "" } return val } } write(val, key) { if (this.isSurge) return $persistentStore.write(val, key); if (this.isQuanX) return $prefs.setValueForKey(val, key); if (this.isNode) { try { const fileContents = this.node.fs.readFileSync(this.node.file, "utf8"); let data = this.node.yaml.safeLoad(fileContents); data = typeof data == "object" ? data : {}; data[key] = val; val = this.node.yaml.safeDump(data); this.node.fs.writeFileSync(this.node.file, val, 'utf8') } catch (e) { console.log(e.message); return false } return true } } delete(key) { if (this.isNode) { try { const fileContents = this.node.fs.readFileSync(this.node.file, "utf8"); let data = this.node.yaml.safeLoad(fileContents); data = typeof data == "object" ? data : {}; if (!data.hasOwnProperty(key)) { return true } delete data[key]; const val = this.node.yaml.safeDump(data); this.node.fs.writeFileSync(this.node.file, val, 'utf8') } catch (e) { console.log(e.message); return false } return true } } done(value = {}) { if (this.isQuanX) return this.isRequest ? $done(value) : null; if (this.isSurge) return this.isRequest ? $done(value) : $done() } pad(s = false, c = "*", l = 15) { return s ? this.log(c.padEnd(l, c)) : `\n${c.padEnd(l, c)}\n` } }(t, l) }
