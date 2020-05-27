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
        body += 101;
        return $done({body});
    }
    if(/.*102$/.test($request.url)){
        headers['custom'] = 'custom'
        body += 102;
        return $done({headers});
    }
    if(/.*103$/.test($request.url)){
        headers['custom'] = 'custom'
        body += 103;
        return $done({headers, body});
    }
    if(/.*104$/.test($request.url)){
        headers['custom'] = 'custom'
        body += 104;
        return $done({header:headers, body:body});
    }
    if(/.*105$/.test($request.url)){
        return $done({});
    }
    return $done();
}

init();