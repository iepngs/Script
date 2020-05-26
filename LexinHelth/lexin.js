/*
「乐心健康」修改运动步数
By: iepngs
*/

/**
{
"timestamp": "1590202486957",
"list": [{
"id": "1234ac1f5b67890edca164bea36c9e9db3",
"calories": "43.7125",
"deviceId": "M_12CE3FCEFBCCC45C6C78909DFA8E7F6543B21EC0",
"type": "0",
"dataSource": "3",
"userId": "43211234",
"priority": "0",
"step": "1345",
"created": "2020-05-23 10:54:46",
"distance": "1007",
"measurementTime": "2020-05-23 10:00:00"
}]
}
**/

let body    = $request.body;
let steps   = 18007;

function init() {
    getdata = (key) => {
        return $prefs.valueForKey(key)
    }
    setdata = (key, val) => {
        return $prefs.setValueForKey(key, val)
    }
    msg = (title, subtitle, body) => {
        $notify(title, subtitle, body)
    }
    log = (message) => console.log(message)
    request = (req, cb) => {
        //"User-Agent": "MRSpeedNovel/0430.1512 CFNetwork/1125.2 Darwin/19.5.0",
        //"Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
        const data = {
            method: req.method,
            url: req.url,
            headers: req.headers,
            body: req.data,
        };
        $task.fetch(data).then((resp) => cb(null, resp, resp.body))
    }
    done = (value = {}) => {
        $done(value)
    }
    return {
        msg,
        log,
        getdata,
        setdata,
        request,
        done
    }
}

const hammer = init()

function resetUploadSteps(data){
    if(typeof data != "string"){
        return data;
    }

    try{
        data = JSON.parse(data);
    }catch(e){
        return data;
    }
   
    let breakpoint      = (new Date).getHours();
    let lastOneIndex    = data.list.length - 1;
    if(lastOneIndex < 0){
        hammer.log("LexinHelth upload data error:", data);
        return JSON.stringify(data);
    }
   
    if(data.list[lastOneIndex].step >= steps){
        return JSON.stringify(data);
    }
   
    steps += Math.ceil(Math.random()*4000);
    data.list[lastOneIndex].step        = steps;
    data.list[lastOneIndex].calories    = steps * 0.0325;
    data.list[lastOneIndex].distance    = Math.ceil((steps * 0.7484).toFixed(1));
   
    return JSON.stringify(data);
}

body = resetUploadSteps(body);

hammer.log(`🐢 LexinHelth upload step number is: ${steps}`);

const source = {
    method: $request.method,
url: $request.url,
headers: $request.headers,
data: body
};

hammer.request(source, (error, response, data) => {
    if(error){
        hammer.msg(`乐心上传失败`, "", `error: ${error}`)
        hammer.log(`❌ LexinHelth upload error: ${error}`)
        return true;
    }
    hammer.log(`🐢 LexinHelth upload response: ${response.statusCode} - ${JSON.stringify(data)}`)
})

