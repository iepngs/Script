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
        // 只改body
        body = "101";
        return $done({request: {body: body}});
    }
    if(/.*102$/.test($request.url)){
        // 只改header
        headers['custom'] = 'custom'
        return $done({request: {header: headers}});
    }
    if(/.*103$/.test($request.url)){
        // 同时改body和header
        headers['custom'] = 'custom'
        body = "103";
        return $done({request: {headers: headers, body: body}});
    }
    if(/.*104$/.test($request.url)){
        // 同时改body和headers
        headers['custom'] = 'custom'
        body = "104";
        return $done({request: {header:headers, body:body}});
    }
    if(/.*105$/.test($request.url)){
        headers['custom'] = 'custom'
        body = "105";
        return $done({response: {header:headers, body:body}});
    }
    if(/.*106$/.test($request.url)){
        headers['custom'] = 'custom'
        body = "106";
        return $done({response: {headers:headers, body:body}});
    }
    return $done({});
}

init();