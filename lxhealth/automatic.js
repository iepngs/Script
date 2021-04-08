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
                link = isQuanX ? { "open-url": options } : options;
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
    return { isRequest, isSurge, isQuanX, log, alert, read, write, request, done };
})();

//-----------------------------------------------------------------------------
function http_build_query(obj) { let s = []; for (const key in obj) { s.push(`${key}=${encodeURIComponent(obj[key])}`); } return s.join("&"); }
function md5(s, hexcase = 0) { var b64pad = ""; function hex_md5(s) { return rstr2hex(rstr_md5(str2rstr_utf8(s))) } function b64_md5(s) { return rstr2b64(rstr_md5(str2rstr_utf8(s))) } function any_md5(s, e) { return rstr2any(rstr_md5(str2rstr_utf8(s)), e) } function hex_hmac_md5(k, d) { return rstr2hex(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))) } function b64_hmac_md5(k, d) { return rstr2b64(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))) } function any_hmac_md5(k, d, e) { return rstr2any(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)), e) } function md5_vm_test() { return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72" } function rstr_md5(s) { return binl2rstr(binl_md5(rstr2binl(s), s.length * 8)) } function rstr_hmac_md5(key, data) { var bkey = rstr2binl(key); if (bkey.length > 16) bkey = binl_md5(bkey, key.length * 8); var ipad = Array(16), opad = Array(16); for (var i = 0; i < 16; i++) { ipad[i] = bkey[i] ^ 0x36363636; opad[i] = bkey[i] ^ 0x5C5C5C5C } var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8); return binl2rstr(binl_md5(opad.concat(hash), 512 + 128)) } function rstr2hex(input) { try { hexcase } catch (e) { hexcase = 0 } var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef"; var output = ""; var x; for (var i = 0; i < input.length; i++) { x = input.charCodeAt(i); output += hex_tab.charAt((x >>> 4) & 0x0F) + hex_tab.charAt(x & 0x0F) } return output } function rstr2b64(input) { try { b64pad } catch (e) { b64pad = '' } var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"; var output = ""; var len = input.length; for (var i = 0; i < len; i += 3) { var triplet = (input.charCodeAt(i) << 16) | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0) | (i + 2 < len ? input.charCodeAt(i + 2) : 0); for (var j = 0; j < 4; j++) { if (i * 8 + j * 6 > input.length * 8) output += b64pad; else output += tab.charAt((triplet >>> 6 * (3 - j)) & 0x3F) } } return output } function rstr2any(input, encoding) { var divisor = encoding.length; var i, j, q, x, quotient; var dividend = Array(Math.ceil(input.length / 2)); for (i = 0; i < dividend.length; i++) { dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1) } var full_length = Math.ceil(input.length * 8 / (Math.log(encoding.length) / Math.log(2))); var remainders = Array(full_length); for (j = 0; j < full_length; j++) { quotient = Array(); x = 0; for (i = 0; i < dividend.length; i++) { x = (x << 16) + dividend[i]; q = Math.floor(x / divisor); x -= q * divisor; if (quotient.length > 0 || q > 0) quotient[quotient.length] = q } remainders[j] = x; dividend = quotient } var output = ""; for (i = remainders.length - 1; i >= 0; i--)output += encoding.charAt(remainders[i]); return output } function str2rstr_utf8(input) { var output = ""; var i = -1; var x, y; while (++i < input.length) { x = input.charCodeAt(i); y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0; if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) { x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF); i++ } if (x <= 0x7F) output += String.fromCharCode(x); else if (x <= 0x7FF) output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F), 0x80 | (x & 0x3F)); else if (x <= 0xFFFF) output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F), 0x80 | ((x >>> 6) & 0x3F), 0x80 | (x & 0x3F)); else if (x <= 0x1FFFFF) output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07), 0x80 | ((x >>> 12) & 0x3F), 0x80 | ((x >>> 6) & 0x3F), 0x80 | (x & 0x3F)) } return output } function str2rstr_utf16le(input) { var output = ""; for (var i = 0; i < input.length; i++)output += String.fromCharCode(input.charCodeAt(i) & 0xFF, (input.charCodeAt(i) >>> 8) & 0xFF); return output } function str2rstr_utf16be(input) { var output = ""; for (var i = 0; i < input.length; i++)output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF, input.charCodeAt(i) & 0xFF); return output } function rstr2binl(input) { var output = Array(input.length >> 2); for (var i = 0; i < output.length; i++)output[i] = 0; for (var i = 0; i < input.length * 8; i += 8)output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32); return output } function binl2rstr(input) { var output = ""; for (var i = 0; i < input.length * 32; i += 8)output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF); return output } function binl_md5(x, len) { x[len >> 5] |= 0x80 << ((len) % 32); x[(((len + 64) >>> 9) << 4) + 14] = len; var a = 1732584193; var b = -271733879; var c = -1732584194; var d = 271733878; for (var i = 0; i < x.length; i += 16) { var olda = a; var oldb = b; var oldc = c; var oldd = d; a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936); d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586); c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819); b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330); a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897); d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426); c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341); b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983); a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416); d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417); c = md5_ff(c, d, a, b, x[i + 10], 17, -42063); b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162); a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682); d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101); c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290); b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329); a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510); d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632); c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713); b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302); a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691); d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083); c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335); b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848); a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438); d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690); c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961); b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501); a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467); d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784); c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473); b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734); a = md5_hh(a, b, c, d, x[i + 5], 4, -378558); d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463); c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562); b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556); a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060); d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353); c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632); b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640); a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174); d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222); c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979); b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189); a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487); d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835); c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520); b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651); a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844); d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415); c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905); b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055); a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571); d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606); c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523); b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799); a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359); d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744); c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380); b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649); a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070); d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379); c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259); b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551); a = safe_add(a, olda); b = safe_add(b, oldb); c = safe_add(c, oldc); d = safe_add(d, oldd) } return Array(a, b, c, d) } function md5_cmn(q, a, b, x, s, t) { return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b) } function md5_ff(a, b, c, d, x, s, t) { return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t) } function md5_gg(a, b, c, d, x, s, t) { return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t) } function md5_hh(a, b, c, d, x, s, t) { return md5_cmn(b ^ c ^ d, a, b, x, s, t) } function md5_ii(a, b, c, d, x, s, t) { return md5_cmn(c ^ (b | (~d)), a, b, x, s, t) } function safe_add(x, y) { var lsw = (x & 0xFFFF) + (y & 0xFFFF); var msw = (x >> 16) + (y >> 16) + (lsw >> 16); return (msw << 16) | (lsw & 0xFFFF) } function bit_rol(num, cnt) { return (num << cnt) | (num >>> (32 - cnt)) } return rstr2hex(rstr_md5(str2rstr_utf8(s))) }
function guid() { const S4 = () => { return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1); }; return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4()); }
function date(fmt, dateObject = '') { dateObject = dateObject ? (dateObject == "object" ? dateObject : (new Date(+dateObject.toString().padEnd(13, "0").substr(0, 13)))) : new Date(); let ret; const opt = { "Y": dateObject.getFullYear().toString(), "m": (dateObject.getMonth() + 1).toString(), "d": dateObject.getDate().toString(), "H": dateObject.getHours().toString(), "i": dateObject.getMinutes().toString(), "s": dateObject.getSeconds().toString() }; for (let k in opt) { ret = new RegExp("(" + k + ")").exec(fmt); if (ret) { fmt = fmt.replace(ret[1], ret[1].length == 1 ? opt[k].padStart(2, "0") : opt[k]) }; }; return fmt; }

//-----------------------------------------------------------------------------
const CatchCookie = () => {
    // https://xui.ptlogin2.qq.com/cgi-bin/xlogin?appid=716027609&pt_3rd_aid=1101774620&daid=381&pt_skey_valid=1&style=35&s_url=http%3A%2F%2Fconnect.qq.com&refer_cgi=m_authorize&ucheck=1&fall_to_wv=1&status_os=9.3.2&redirect_uri=auth%3A%2F%2Fwww.qq.com&client_id=1104904286&response_type=token&scope=all&sdkp=i&sdkv=2.9&state=test&status_machine=iPhone8%2C1&switch=1
    // 登录之后截取链接之中的openid和access_token

    // https://imgcache.qq.com/open/connect/widget/mobile/login/proxy.htm?#&t=1593399216#&openid=C70D207D632A18C188D2E1E6550F9296&appid=1104904286&access_token=E882FC5704C94EE4A6C82D5352191A0E&pay_token=5DB910AB8E125B17062E726D52235E8C&key=4f01c39d2e2953866be589897cd91f98&serial=&token_key=&browser=0&browser_error=0&status_os=9.3.2&sdkv=2.9&status_machine=iPhone8%2C1&update_auth=1&has_auth=1&auth_time=1593399200614&page_type=1&redirect_uri_key=BC1628272CA1881A9699787FA56112DD7179E3ADFFEAB8AA79ED3ECD90FCF9393
    const partten = /.*&openid=(\w+)&appid=1104904286&access_token=(\w+)&/;
    const matcher = partten.exec($request.url);
    $hammer.log(`${oauthCookieKey} matcher:`, matcher);
    if (matcher && matcher.length == 3) {
        const [, openId, openAccessToken] = matcher;
        $hammer.write(`${openId}#${openAccessToken}`, oauthCookieKey);
        $hammer.alert(Protagonist, "openauth已记录");
    }
    $hammer.done();
};

//-----------------------------------------------------------------------------
const appVersion = "4.3.2";
const Protagonist = "LIFESENSE";
const oauthCookieKey = `${Protagonist}OAUTH`;
const profileCookieKey = `${Protagonist}PROFILE`;

function getPhoneInfo() {
    return {
        model: 'iPhone XS',
        os: '13.4.1',
        channel: 'app_store',
        deviceId: '861578030028669',
    };
}

function loginBody(clientId, appId, appType, openAccountType, openId, openAccessToken) {
    return {
        clientId: clientId,
        appId: appId,
        appType: appType,
        openAccountType: openAccountType,
        openId: openId,
        openAccessToken: openAccessToken,
    }
}

function uploadBodyListBean(active, calories, created, dataSource, dayMeasurementTime, deviceId, distance, clientId
    , isUpload, measurementTime, priority, steps, type, updated, userId, DataSource, duration) {
    return {
        list: [
            {
                'active': active,
                'calories': calories,
                'created': created,
                'dataSource': dataSource,
                'dayMeasurementTime': dayMeasurementTime,
                'deviceId': deviceId,
                'distance': distance,
                'id': clientId,
                'isUpload': isUpload,
                'measurementTime': measurementTime,
                'priority': priority,
                'step': steps,
                'type': type,
                'updated': updated,
                'userId': userId,
                'DataSource': DataSource,
                'exerciseTime': duration,
            }
        ],
        timestamp: (Date.now() / 1000).toFixed(0),
    };
}

function makeClientId(a, b) {
    return md5(a + b);
}

function loginViaQQ(openId, openAccessToken) {
    return new Promise(resolve => {
        const clientId = makeClientId(openId, openAccessToken);
        let profile = $hammer.read(profileCookieKey);
        profile = profile ? JSON.parse(profile) : false;
        let logMsg = "无LifesenseProfile缓存，开始获取";
        if (profile) {
            if (profile.expireAt > Date.now()) {
                $hammer.log(`LifesenseProfile缓存已存在将直接使用。`)
                return resolve(profile);
            }
            logMsg = "LifesenseProfile缓存过期,开始重新获取";
        }
        $hammer.log(logMsg);
        const phoneInfo = getPhoneInfo();
        const params = {
            'city': '',
            'province': '',
            'devicemodel': phoneInfo.model,
            'areaCode': '',
            'osversion': phoneInfo.os,
            'screenHeight': 812,
            'provinceCode': '',
            'version': appVersion,
            'channel': phoneInfo.channel,
            'systemType': 1,
            'promotion_channel': phoneInfo.channel,
            'screenWidth': 375,
            'requestId': guid(),
            'longitude': '',
            'screenheight': '812',
            'os_country': 'CN',
            'timezone': 'Asia/Shanghai',
            'cityCode': '',
            'os_langs': 'zh',
            'platform': 'ios',
            'clientId': clientId,
            'openudid': '',
            'countryCode': '',
            'country': '',
            'screenwidth': '375',
            'network_type': 'wifi',
            'appType': 6,
            'area': 'CN',
            'latitude': '',
            'language': 'zh',
        };
        const options = {
            url: "https://sports.lifesense.com/sessions_service/loginByThirdParty?" + http_build_query(params),
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: loginBody(params.clientId, "1104904286", "6", "2", openId, openAccessToken),
        };
        $hammer.request('post', options, (error, response, result) => {
            if (error) {
                $hammer.log("请求profile异常：", error);
                $hammer.alert(Protagonist, "具体查看日志", "请求profile异常");
                return resolve(false);
            }
            response = JSON.parse(response);
            /**
                 * code : 200
                 * msg : 成功
                 * data : {"exist":true,"hasMobile":true,"userId":"26286614","accessToken":"e8a8d968f53c4b9b9e725a0d82864402","expireAt":1591357173154,"userType":99,"needInfo":false}
            */
            if (response.code != 200 || !response.data['exist']) {
                $hammer.alert(Protagonist, response.msg, "Profile响应异常");
                $hammer.log("Profile响应异常：", response.msg, result);
                return resolve(false);
            }
            profile = response.data;
            //每次登录成功lxaccesstoken有效期为1个月，因此此处做了缓存处理，不需要的可删除
            //$redis->set($clientId, json_encode($user), 30 * 24 * 3600 - 3600);
            $hammer.write(JSON.stringify(profile), profileCookieKey);
            resolve(profile);
        });
    })
}

async function upload(openId, openAccessToken, profile) {
    const clientId = makeClientId(openId, openAccessToken);
    const phoneInfo = getPhoneInfo();
    const params = {
        'city': '杭州',
        'province': '浙江省',
        'devicemodel': phoneInfo.model,
        'areaCode': '330110',
        'osversion': phoneInfo.os,
        'screenHeight': '812',
        'provinceCode': '330000',
        'version': appVersion,
        'channel': phoneInfo.channel,
        'systemType': 1,
        'promotion_channel': phoneInfo.channel,
        'screenWidth': 375,
        'requestId': guid(),
        'longitude': '120.0098063151042',
        'screenheight': 812,
        'os_country': 'CN',
        'timezone': 'Asia/Shanghai',
        'cityCode': '330100',
        'os_langs': 'zh',
        'platform': 'ios',
        'clientId': clientId,
        'countryCode': '中国',
        'country': '',
        'screenwidth': '375',
        'network_type': 'wifi',
        'appType': 6,
        'area': 'CN',
        'latitude': '30.28321126302083',
        'language': 'zh',
    };
    const url = "https://sports.lifesense.com/sport_service/sport/sport/uploadMobileStepV2?" + http_build_query(params);
    const baseCookie = {
        'accessToken2': profile.accessToken,
        'appType2': 6,
        'expireAt2': profile.expireAt,
        'gray2': false,
        'loginId2': profile.userId,
        'session': JSON.stringify({
            'accessToken': profile.accessToken,
            'appType': 6,
            'expireAt': profile.expireAt,
            'loginId': profile.userId,
            'userType': 99,
            'gray': false,
        }),
        'userType2': 99,
    };
    let Cookie = [];
    let i = 2;
    while (i > 0) {
        for (const k in baseCookie) {
            Cookie.push(`${k}=${baseCookie[k]}`);
        }
        i--;
        if (i == 1) {
            Cookie.push(`accessToken=${profile.accessToken}`);
        }
    }

    const headers = {
        "User-Agent": "LSWearable/4.6 (iPhone;iOS 13.4.1; Scale/3.00)",
        "Cookie": Cookie.join("; "),
    };

    const steps = 20007 + Math.ceil(Math.random() * 2000);
    const calories = (0.0325 * steps).toFixed(2);
    const distance = Math.ceil((0.7484 * steps).toFixed(1));
    const duration = ~~(0.85 * steps);
    const nowMTs = Date.now();
    const datetime = date("Y-m-d H:i:s", nowMTs);
    
    const body = uploadBodyListBean(
        1,
        calories,
        datetime,
        2,
        date("Y-m-d", nowMTs),
        "M_" + phoneInfo.deviceId,
        distance,
        clientId,
        0,
        datetime,
        0,
        steps,
        2,
        nowMTs,
        profile.userId,
        2,
        duration
    );

    const options = {
        url: url,
        headers: headers,
        body: body,
    }
    $hammer.log("upload...");
    $hammer.request('post', options, (error, response, result) => {
        if (error) {
            $hammer.log("error: ", error);
            return resolve(false);
        }
        $hammer.log("upload response:", response);
        const resp = JSON.parse(response);
        resolve(resp);
    });
}

//-----------------------------------------------------------------------------
const main = async () => {
    const oauth = $hammer.read(oauthCookieKey);
    if (oauth) {
        const [openId, accessToken] = oauth.split("#");
        const profile = await loginViaQQ(openId, accessToken);
        if (profile) {
            $hammer.log("we ready for upload...");
            await upload(openId, accessToken, profile);
            $hammer.log(`${Protagonist} process finished.`);
        }
    } else {
        const authLink = "https://xui.ptlogin2.qq.com/cgi-bin/xlogin?appid=716027609&pt_3rd_aid=1101774620&daid=381&pt_skey_valid=1&style=35&s_url=http%3A%2F%2Fconnect.qq.com&refer_cgi=m_authorize&ucheck=1&fall_to_wv=1&status_os=9.3.2&redirect_uri=auth%3A%2F%2Fwww.qq.com&client_id=1104904286&response_type=token&scope=all&sdkp=i&sdkv=2.9&state=test&status_machine=iPhone8%2C1&switch=1";
        $hammer.alert(Protagonist, "需要授权登录后重新执行", "", authLink);
    }
    $hammer.done();
};


// enterpoint.
$hammer.isRequest ? CatchCookie() : (() => {
    const randomNumber = (start, end, fixed = 0) => {
        const differ = end - start;
        const random = Math.random();
        return (start + differ * random).toFixed(fixed);
    };
    const waitSecond = randomNumber(0, 60);
    $hammer.log(`run main() delay ${waitSecond}s`);
    setTimeout(main, waitSecond * 1000);
})();