/*
2020 jd618购机活动
浏览器打开并登录：https://rdcseason.m.jd.com/#/index

Surge4：
http-response ^https:\/\/rdcseason\.m\.jd\.com\/#\/index requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/iepngs/Script/master/jd618buyphone/index.js
QX：
^https:\/\/rdcseason\.m\.jd\.com\/#\/index url script-response-body https://raw.githubusercontent.com/iepngs/Script/master/jd618buyphone/index.js

MITM:
hostname = rdcseason.m.jd.com
*/

let body = $response.body;

body.replace("<\/body>", "<script type='text/javascript' src='https://cdn.jsdelivr.net/npm/vconsole@3.3.4/dist/vconsole.min.js'></script><script>new VConsole();eval(function(p,a,c,k,e,d){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)d[e(c)]=k[c]||e(c);k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}(' e 9=4.3(\'9\');9.d=\"b/6\";9.a=\"5://c.2/8/7.8\";4.1.0(9);',62,15,'appendChild|body|com|createElement|document|https|javascript|jd618|js|script|src|text|tyh52|type|var'.split('|'),0,{}));</script></body>");

console.log("----------------body----------------");
console.log(body);
console.log("----------------body----------------");

$done({body: body});
