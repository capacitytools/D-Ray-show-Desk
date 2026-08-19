let K={};try{K=require('./keys.js')}catch(e){}
function decKey(s){try{var a=String(s).split('.');var out='';for(var i=0;i<a.length;i++)out+=String.fromCharCode(parseInt(a[i],10));return out.split('').reverse().join('')}catch(e){return ''}}
const TOK=process.env.GH_TOKEN||(K.GH_E?decKey(K.GH_E):(K.GH_B64?Buffer.from(K.GH_B64,'base64').toString('utf8'):''));
const REPO=process.env.GH_REPO||K.GH_REPO||'';
module.exports=async function handler(req,res){
if(!TOK||!REPO)return res.status(500).json({error:'no_keys'});
var b=req.body||{};
var H={'Authorization':'token '+TOK,'Accept':'application/vnd.github+json','User-Agent':'dray-desk'};
try{
 if(b.get){  var g=await fetch('https://api.github.com/repos/'+REPO+'/contents/'+b.path,{headers:H});
  if(!g.ok)return res.status(200).json({exists:false});
  var m=await g.json();return res.status(200).json({exists:true,meta:{sha:m.sha,content:m.content}});
 }
 var sha;
 var g2=await fetch('https://api.github.com/repos/'+REPO+'/contents/'+b.path,{headers:H});
 if(g2.ok){var m2=await g2.json();sha=m2.sha}
 var body={message:b.message,content:b.content};if(sha)body.sha=sha;
 var r=await fetch('https://api.github.com/repos/'+REPO+'/contents/'+b.path,{method:'PUT',headers:{'Authorization':'token '+TOK,'Accept':'application/vnd.github+json','Content-Type':'application/json','User-Agent':'dray-desk'},body:JSON.stringify(body)});
 if(!r.ok){var t=await r.text();return res.status(500).json({error:'GitHub '+r.status+' '+t.slice(0,80)})}
 return res.status(200).json({ok:true});
}catch(e){return res.status(500).json({error:String(e).slice(0,120)})}
};
