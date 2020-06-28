let resp = $response.body;
try {
    resp = JSON.parse(resp);
    resp.advertisement_num=0;
    resp.advertisement_info=[];
    resp = JSON.stringify(resp);
} catch (e) {
    console.log(e.message);
}

$done({body: resp});