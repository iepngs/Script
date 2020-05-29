let body = $request.body;
let headers = $request.headers;

function init(){
    console.log("------body---------");
    console.log(typeof body)
    console.log("================")
    console.log(body)
    console.log("------headers---------");
    console.log(typeof headers)
    console.log("================")
    console.log(headers)
    if(/.*101$/.test($request.url)){
        // 单独重置body
        body = "101";
        return $done({body});
    }
    if(/.*102$/.test($request.url)){
        // 单独重置header
        headers['Custom'] = 'custom'
        return $done({headers});
    }
    if(/.*103$/.test($request.url)){
        // 同时重置header和body
        headers['Custom'] = 'custom'
        body = "103";
        return $done({headers, body});
    }
    if(/.*104$/.test($request.url)){
        // 同时重置header和body
        headers['Custom'] = 'custom'
        body = "104";
        return $done({headers:headers, body:body});
    }
    if(/.*105$/.test($request.url)){
        // 传空对象
        return $done({});
    }
    // 不传值
    return $done();
}

init();