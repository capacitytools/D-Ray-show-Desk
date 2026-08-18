// D-Ray Show — server-side news relay (Vercel serverless function)
const FEEDS=[
{region:'world',flag:'🌍',name:'World',goog:1,cap:12,url:'https://news.google.com/rss/search?q=breaking+news&hl=en-US&gl=US&ceid=US:en'},
{region:'africa',flag:'🌍',name:'Africa',goog:1,cap:12,url:'https://news.google.com/rss/search?q=breaking+news+africa&hl=en-US&gl=US&ceid=US:en'},
{region:'nigeria',flag:'🇳🇬',name:'Nigeria',goog:1,cap:12,url:'https://news.google.com/rss/search?q=breaking+news+nigeria&hl=en-US&gl=US&ceid=US:en'},
{region:'world',flag:'🇬🇧',name:'BBC World',src:'BBC',country:'UK',cap:8,url:'https://feeds.bbci.co.uk/news/world/rss.xml'},
{region:'world',flag:'🇶',name:'Al Jazeera',src:'Al Jazeera',country:'Qatar',cap:8,url:'https://www.aljazeera.com/xml/rss/all.xml'},
{region:'nigeria',flag:'🇳',name:'Channels TV',src:'Channels Television',country:'Nigeria',cap:8,url:'https://www.channelstv.com/feed/'},
{region:'nigeria',flag:'🇳🇬',name:'Punch',src:'Punch',country:'Nigeria',cap:8,url:'https://punchng.com/feed/'},
{region:'nigeria',flag:'🇳🇬',name:'Premium Times',src:'Premium Times',country:'Nigeria',cap:8,url:'https://www.premiumtimesng.com/feed'},
{region:'africa',flag:'🇿🇦',name:'SABC News',src:'SABC News',country:'South Africa',cap:8,url:'https://www.sabcnews.com/sabcnews/feed/'},
{region:'africa',flag:'🇰🇪',name:'Daily Nation',src:'Daily Nation',country:'Kenya',cap:8,url:'https://nation.africa/kenya/rss'}];
const dec=function(s){return String(s).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&/g,'&').replace(/</g,'<').replace(/>/g,'>').replace(/'/g,"'").replace(/"/g,'"').trim()};
function grab(b,t){var r=new RegExp('<'+t+'[^>]*>([\\s\\S]*?)</'+t+'>').exec(b);return r?dec(r[1]):''}
function parse(xml){
 var items=[];var m;var re=/<item[\s\S]*?<\/item>/g;
 while((m=re.exec(xml))){var b=m[0];var link=grab(b,'link');if(link)items.push({title:grab(b,'title'),link:link,pub:grab(b,'pubDate')})}
 if(!items.length){var re2=/<entry[\s\S]*?<\/entry>/g;
  while((m=re2.exec(xml))){var b2=m[0];var l=(/<link[^>]*href="([^"]+)"/.exec(b2)||[])[1]||'';if(l)items.push({title:grab(b2,'title'),link:l,pub:grab(b2,'published')||grab(b2,'updated')})}}
 return items;
}
module.exports=async function handler(req,res){
 var out=[];
 await Promise.all(FEEDS.map(async function(f){
  try{
   var c=new AbortController();var t=setTimeout(function(){c.abort()},8000);
   var r=await fetch(f.url,{signal:c.signal,headers:{'User-Agent':'Mozilla/5.0 (D-RayShowDesk)'}});
   clearTimeout(t);
   var items=parse(await r.text()).slice(0,f.cap||10);
   for(var i=0;i<items.length;i++)out.push({title:items[i].title,link:items[i].link,pub:items[i].pub,region:f.region,flag:f.flag,country:f.country||f.name,src:f.src||null,goog:!!f.goog});
  }catch(e){}
 }));
 res.setHeader('Cache-Control','s-maxage=60, stale-while-revalidate=120');
 res.status(200).json({ok:true,items:out});
};
