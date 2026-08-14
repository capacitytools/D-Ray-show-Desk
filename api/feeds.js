// D-Ray Show — server-side news relay (Vercel serverless function)
const FEEDS=[
{region:'world',flag:'🌍',name:'World',goog:1,cap:12,url:'https://news.google.com/rss/search?q=breaking+news&hl=en-US&gl=US&ceid=US:en'},
{region:'africa',flag:'🌍',name:'Africa',goog:1,cap:12,url:'https://news.google.com/rss/search?q=breaking+news+africa&hl=en-US&gl=US&ceid=US:en'},
{region:'nigeria',flag:'🇳',name:'Nigeria',goog:1,cap:12,url:'https://news.google.com/rss/search?q=breaking+news+nigeria&hl=en-US&gl=US&ceid=US:en'},
{region:'world',flag:'🇬🇧',name:'BBC World',src:'BBC',country:'UK',cap:8,url:'https://feeds.bbci.co.uk/news/world/rss.xml'},
{region:'world',flag:'🇶🇦',name:'Al Jazeera',src:'Al Jazeera',country:'Qatar',cap:8,url:'https://www.aljazeera.com/xml/rss/all.xml'},
{region:'nigeria',flag:'🇳🇬',name:'Channels TV',src:'Channels Television',country:'Nigeria',cap:8,url:'https://www.channelstv.com/feed/'},
{region:'nigeria',flag:'🇳',name:'Punch',src:'Punch',country:'Nigeria',cap:8,url:'https://punchng.com/feed/'},
{region:'nigeria',flag:'🇳🇬',name:'Premium Times',src:'Premium Times',country:'Nigeria',cap:8,url:'https://www.premiumtimesng.com/feed'},
{region:'africa',flag:'🇿🇦',name:'SABC News',src:'SABC News',country:'South Africa',cap:8,url:'https://www.sabcnews.com/sabcnews/feed/'},
{region:'africa',flag:'🇰🇪',name:'Daily Nation',src:'Daily Nation',country:'Kenya',cap:8,url:'https://nation.africa/kenya/rss'}];
const dec=s=>String(s).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'").replace(/&quot;/g,'"').trim();
function grab(b,t){const r=new RegExp('<'+t+'[^>]*>([\\s\\S]*?)</'+t+'>').exec(b);return r?dec(r[1]):''}
function parse(xml){
 const items=[];let m;const re=/<item[\s\S]*?<\/item>/g;
 while((m=re.exec(xml))){const b=m[0];const link=grab(b,'link');if(link)items.push({title:grab(b,'title'),link,pub:grab(b,'pubDate')})}
 if(!items.length){const re2=/<entry[\s\S]*?<\/entry>/g;
  while((m=re2.exec(xml))){const b=m[0];const l=(/<link[^>]*href="([^"]+)"/.exec(b)||[])[1]||'';if(l)items.push({title:grab(b,'title'),link:l,pub:grab(b,'published')||grab(b,'updated')})}}
 return items;
}
module.exports=async function handler(req,res){
 const out=[];
 await Promise.all(FEEDS.map(async f=>{
  try{
   const c=new AbortController();const t=setTimeout(()=>c.abort(),8000);
   const r=await fetch(f.url,{signal:c.signal,headers:{'User-Agent':'Mozilla/5.0 (D-RayShowDesk)'}});
   clearTimeout(t);
   const items=parse(await r.text()).slice(0,f.cap||10);
   for(const i of items)out.push({title:i.title,link:i.link,pub:i.pub,region:f.region,flag:f.flag,country:f.country||f.name,src:f.src||null,goog:!!f.goog});
  }catch(e){}
 }));
 res.setHeader('Cache-Control','s-maxage=60, stale-while-revalidate=120');
 res.status(200).json({ok:true,items:out});
};