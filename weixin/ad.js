let resp = $response.body;
try {
    resp = JSON.parse(resp);
    resp.advertisement_num=0;
    resp.advertisement_info=[];
    delete resp.appid;
    resp = JSON.stringify(resp);
} catch (e) {
    console.log(`weixin ad error:\n${e.message}`);
}

$done({body: resp});