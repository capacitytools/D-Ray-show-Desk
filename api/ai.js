let K={};try{K=require('./keys.js')}catch(e){}
const KEY=process.env.AI_KEY||(K.AI_B64?Buffer.from(K.AI_B64,'base64').toString('utf8'):'');
async function models(p){try{const r=await fetch(p.url.replace('/chat/completions','/models'),{headers:{Authorization:'Bearer '+KEY}});if(!r.ok)return[];const d=await r.json();return (d.data||[]).map(function(x){return x.id})}catch(e){return[]}}
module.exports=async function handler(req,res){
if(!KEY)return res.status(500).json({error:'no_keys'});
var b=req.body||{};
var p=KEY.indexOf('gsk_')===0?{url:'https://api.groq.com/openai/v1/chat/completions',pref:['llama-3.3-70b-versatile','meta-llama/llama-4-scout-17b-16e-instruct','openai/gpt-oss-120b','openai/gpt-oss-20b','llama-3.1-8b-instant']}:{url:'https://api.x.ai/v1/chat/completions',pref:['grok-3-mini','grok-3','grok-4','grok-2-latest']};
var avail=await models(p);
var list=p.pref.filter(function(m){return avail.indexOf(m)>-1}).concat(avail.filter(function(id){return p.pref.indexOf(id)<0&&!/whisper|tts|embed|guard|moderat|transcrib/i.test(id)}));
if(!list.length)list=p.pref;
var last='';
for(var i=0;i<list.length;i++){
 try{
  var r=await fetch(p.url,{method:'POST',headers:{Authorization:'Bearer '+KEY,'Content-Type':'application/json'},body:JSON.stringify({model:list[i],temperature:0.5,messages:[{role:'system',content:b.system||''},{role:'user',content:b.user||''}]})});
  if(r.ok){var d=await r.json();return res.status(200).json({text:d.choices[0].message.content,model:list[i]})}
  last='HTTP '+r.status;
 }catch(e){last=String(e).slice(0,80)}
}
res.status(500).json({error:last||'all models failed'});
};
