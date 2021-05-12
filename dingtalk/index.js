// 数据来源：
// http://www.apihubs.cn/#/holidays
// https://segmentfault.com/a/1190000038961352

const node = (new Date()).getHours() > 12 ? "下班" : "上班";
const $ = hammer(`钉钉${node}打卡`, 3);

function initDate(){
    const ds = (d, s='') => {
        const year = dateObj.getFullYear();
        let month = dateObj.getMonth()+1;
        if(month<10){
            month = `0${month}`;
        }
        let day = dateObj.getDate();
        if(day<10){
            day = `0${day}`;
        }
        const a = [year, month, day].join(s);
        return s ? a : +a;
    };
    let dateObj = new Date();
    const today = ds(dateObj);
    const todayDate = ds(dateObj, "-");
    dateObj.setDate(dateObj.getDate() + 1);
    return {
        today: today,
        tomorrow: ds(dateObj),
        todayDate: todayDate,
    }
}

function alertOptions() {
    const corpId = "ding307c0c3ff8b707a435c2f4657eb6378f",
    const link = "dingtalk://dingtalkclient/page/link?url=https%3A%2F%2Fattend.dingtalk.com%2Fattend%2Findex.html%3FcorpId%3D";
    return {"open-url": `${link}${corpId}`};
}

(() => {
    const {today, tomorrow, todayDate} = initDate();
    const options = {
        url: `https://api.apihubs.cn/holiday/get?field=date,week,workday,holiday_overtime&date=${today},${tomorrow}&order_by=1&cn=1&size=2`,
        headers: {},
    }
    $.request('get', options, (error, response) => {
        let errMsg = `工作日检测异常`;
        if(error){
            $.log(error);
            $.alert(errMsg);
            return $.done();
        }
        if(response.data.list.length != 2){
            $.log(response);
            $.alert(errMsg, `返回数据解析错误`);
            return $.done();
        }
        let row = response.data.list[0];
        const onWorking = row.workday == 2;
        const title = `${todayDate} ${row.week_cn}`;
        const row = response.data.list[1];
        // 明天上班
        if(row.workday == 1){
            // 明天上班
            if(row.week > 5){
                // 周末的补班
                let contents = `明天${row.holiday_overtime_cn}要搬砖,开起床闹钟`;
                if(onWorking){
                    // 今天上班明天也上班
                    $.alert(contents, title, alertOptions());
                    return $.done();
                }
                // 今天不上班明天补班
                $.alert(contents, title);
                return $.done();
            }
            //周内的正常工作日
            if(onWorking){
                $.alert(`明天继续搬砖`, title, alertOptions());
            }
        }else{
            // 明天不上班
            if(onWorking){
                // 今天上班,明天不上班
                $.alert(`明儿可以休息了`, title, alertOptions());
            }
            // 今明都不上班不提醒
        }
        return $.done();
    })
})()

function hammer(t="untitled",l=3){return new class{constructor(t,l){this.name=t,this.logLevel=l,this.isRequest=("object"==typeof $request)&&$request.method!="OPTIONS",this.isSurge="undefined"!=typeof $httpClient,this.isQuanX="undefined"!=typeof $task,this.isNode="function"==typeof require,this.node=(()=>{if(!this.isNode){return null}const file="localstorage.yml";let f,y,r;try{f=require('fs');y=require('js-yaml');r=require('needle');f.appendFile(file,"",function(err){if(err)throw err;})}catch(e){console.log("install unrequired module by: yarn add module_name");console.log("example: yarn add js-yaml needle");console.log(e.message);return{}}return{file:file,fs:f,yaml:y,request:r,}})()}log(...n){if(l<2){return null}console.log(`\n***********${this.name}***********`);for(let i in n)console.log(typeof n[i]=="object"?JSON.stringify(n[i]):n[i])}alert(body="",subtitle="",options={}){if(l==2||l==0){return null}if(typeof options=="string"){options={"open-url":options}}let link=null;if(Object.keys(options).length){link=this.isQuanX?options:{openUrl:options["open-url"],mediaUrl:options["media-url"]}}if(this.isSurge)return $notification.post(this.name,subtitle,body,link);if(this.isQuanX)return $notify(this.name,subtitle,body,link);console.log(`系统通知📣\ntitle:${this.name}\nsubtitle:${subtitle}\nbody:${body}\nlink:${link}`)}request(method,params,callback){let options={};if(typeof params=="string"){options.url=params}else{options.url=params.url;if(typeof params=="object"){params.headers&&(options.headers=params.headers);params.body&&(options.body=params.body)}}method=method.toUpperCase();const writeRequestErrorLog=function(n,m,u){return err=>console.log(`${n}request error:\n${m}${u}\n${err}`)}(this.name,method,options.url);if(this.isSurge){const _runner=method=="GET"?$httpClient.get:$httpClient.post;return _runner(options,(error,response,body)=>{if(error==null||error==""){response.body=body;callback("",body,response)}else{writeRequestErrorLog(error);callback(error,"",response)}})}options.method=method;if(this.isQuanX){$task.fetch(options).then(response=>{response.status=response.statusCode;delete response.statusCode;callback("",response.body,response)},reason=>{writeRequestErrorLog(reason.error);response.status=response.statusCode;delete response.statusCode;callback(reason.error,"",response)})}if(this.isNode){if(options.method=="POST"&&options.body){try{options.body=JSON.parse(options.body)}catch(e){}}method=options.method.toLowerCase();const link=options.url;delete options.url;this.node.request(method,link,options,(error,response)=>{let body=response.body;if(typeof body=="object"){body=JSON.stringify(body)}if(typeof response=='object'&&response){response.status=response.statusCode;delete response.statusCode}callback(error,body,response)})}}read(key){if(this.isSurge)return $persistentStore.read(key);if(this.isQuanX)return $prefs.valueForKey(key);if(this.isNode){let val="";try{const fileContents=this.node.fs.readFileSync(this.node.file,"utf8");const data=this.node.yaml.safeLoad(fileContents);val=(typeof(data)=="object"&&data[key])?data[key]:""}catch(e){console.log(`读取文件时错误:\n${e.message}`);return""}return val}}write(val,key){if(this.isSurge)return $persistentStore.write(val,key);if(this.isQuanX)return $prefs.setValueForKey(val,key);if(this.isNode){try{const fileContents=this.node.fs.readFileSync(this.node.file,"utf8");let data=this.node.yaml.safeLoad(fileContents);data=typeof data=="object"?data:{};data[key]=val;val=this.node.yaml.safeDump(data);this.node.fs.writeFileSync(this.node.file,val,'utf8')}catch(e){console.log(e.message);return false}return true}}delete(key){if(this.isSurge)return $persistentStore.remove(key);if(this.isQuanX)return $prefs.removeValueForKey(key);if(this.isNode){try{const fileContents=this.node.fs.readFileSync(this.node.file,"utf8");let data=this.node.yaml.safeLoad(fileContents);data=typeof data=="object"?data:{};if(!data.hasOwnProperty(key)){return true}delete data[key];const val=this.node.yaml.safeDump(data);this.node.fs.writeFileSync(this.node.file,val,'utf8')}catch(e){console.log(e.message);return false}return true}}done(value={}){if(this.isQuanX)return $done(value);if(this.isSurge)return this.isRequest?$done(value):$done()}pad(s=false,c="*",l=15){return s?this.log(c.padEnd(l,c)):`\n${c.padEnd(l,c)}\n`}}(t,l)}