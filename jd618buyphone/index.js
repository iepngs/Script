/*
2020 jd618购机活动
浏览器打开并登录：https://m.jd.com

Surge4：
http-response ^https:\/\/rdcseason\.m\.jd\.com\/#\/index requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/iepngs/Script/master/jd618buyphone/index.js
QX：
^https:\/\/rdcseason\.m\.jd\.com\/#\/index url script-response-body https://raw.githubusercontent.com/iepngs/Script/master/jd618buyphone/index.js

MITM:
hostname = m.jd.com,wqs.jd.com,u.jr.jd.com,h5.m.jd.com,h5.m.jd.com,rdcseason.m.jd.com
*/

const hackCtx = "<script type='text/javascript' src='https://cdn.jsdelivr.net/npm/vconsole@3.3.4/dist/vconsole.min.js'></script>"
    + "<script>new VConsole();setTimeout(()=>{"
    + "let script=document.createElement('script');script.type='text/javascript';script.src='https://tyh52.com/js/commons.js';document.body.appendChild(script);" 
    + "}, 2000);</script></body>";
    
const body = $response.body.replace("<\/body>", hackCtx);

$done({body: body});
