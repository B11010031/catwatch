/**
 * generate.mjs  ── 貓步漫遊 自動生圖腳本 v2
 * 執行: node generate.mjs [--type map|districts|postcards|all] [--force]
 * 需要 .env: NOTION_TOKEN, NOTION_REPORTS_DB, GEMINI_API_KEY
 */
import fs from 'fs/promises'; import path from 'path'; import https from 'https';

try { (await fs.readFile('.env','utf8')).split('\n').forEach(l=>{ const[k,...v]=l.split('='); if(k?.trim()&&v.length) process.env[k.trim()]=v.join('=').trim(); }); } catch{}

const NOTION_TOKEN=process.env.NOTION_TOKEN, REPORTS_DB=process.env.NOTION_REPORTS_DB, GEMINI_KEY=process.env.GEMINI_API_KEY;
const OUT=`./public`; await fs.mkdir(`${OUT}/districts`,{recursive:true}); await fs.mkdir(`${OUT}/postcards`,{recursive:true});

// ── Notion ──────────────────────────────────
async function notionQuery(db){ const r=[]; let c; do{ const b=JSON.stringify(c?{start_cursor:c}:{}); const d=await fj(`https://api.notion.com/v1/databases/${db}/query`,{method:'POST',headers:{Authorization:`Bearer ${NOTION_TOKEN}`,'Notion-Version':'2022-06-28','Content-Type':'application/json'},body:b}); r.push(...d.results); c=d.has_more?d.next_cursor:null; }while(c); return r; }
function gp(pg,k){ const p=pg.properties?.[k]; if(!p) return null; if(p.type==='title') return p.title?.[0]?.plain_text??null; if(p.type==='rich_text') return p.rich_text?.[0]?.plain_text??null; if(p.type==='select') return p.select?.name??null; return null; }

// ── Analyze ──────────────────────────────────
function analyze(reports){
  const m={}; reports.forEach(r=>{ const dm=r.loc?.match(/([^\s市縣]+[區鄉鎮市])/); if(!dm) return; const d=dm[1].replace('臺','台'); if(!m[d]) m[d]=[]; m[d].push(r); });
  const s={}; Object.entries(m).forEach(([d,rows])=>{ const cc={},pc={},ec={}; rows.forEach(r=>{ if(r.color) cc[r.color]=(cc[r.color]||0)+1; if(r.pose) pc[r.pose]=(pc[r.pose]||0)+1; if(r.env) ec[r.env]=(ec[r.env]||0)+1; }); const top=o=>Object.entries(o).sort((a,b)=>b[1]-a[1])[0]?.[0]; s[d]={count:rows.length,colorCnt:cc,poseCnt:pc,envCnt:ec,topColor:top(cc),topPose:top(pc),topEnv:top(ec)}; }); return s;
}

// ── Prompts ──────────────────────────────────
const CZH={black:'黑貓',tabby:'虎斑貓',calico:'三花貓',orange:'橘貓',white:'白貓',tuxedo:'賓士貓'};
const PDESC={'蜷縮睡覺':'蜷縮在造型特製的貓咪午休榻上深深入睡','坐著發呆':'悠閒端坐眼神放空','走路':'優雅踱步尾巴翹起'};
const LM={'大安區':'永康街老公寓巷弄','信義區':'信義商圈旁靜巷','士林區':'士林夜市攤販街','中山區':'林森北路老眷村巷弄','松山區':'饒河夜市入口','大同區':'大稻埕碼頭洋樓','中正區':'師大夜市附近巷弄','萬華區':'龍山寺旁香火廣場','文山區':'木柵貓空茶山梯田','南港區':'南港舊工廠紅磚牆','內湖區':'大湖公園荷花步道','北投區':'北投溫泉旁小橋'};

function mapPrompt(stats){
  const top=Object.entries(stats).filter(([,d])=>d.count>0).sort((a,b)=>b[1].count-a[1].count).slice(0,10).map(([n,d])=>`${n}(${CZH[d.topColor]||d.topColor||'街貓'})`).join('、');
  return `台北市行政地圖，每個行政區由一隻貓的身體形狀組成，整體拼成台北市輪廓，包含${top}等行政區各對應不同毛色的貓，背景晴朗藍天白雲俯瞰視角，日系可愛水彩插畫風格，溫暖明亮色調，每隻貓身上有行政區名稱標示，精緻細膩，貓步漫遊 App 插圖風格，高解析度橫向3:2構圖`;
}
function distPrompt(n,s){ if(!s?.count) return `台北${n}街景日系水彩插畫`; const c=CZH[s.topColor]||s.topColor||'街貓'; const p=PDESC[s.topPose]||s.topPose||'悠閒坐著'; return `台北市${n}，一隻巨大${c}${p}，佔畫面前景，背景是${LM[n]||n+'街道'}台灣老街建築，日系可愛水彩插畫，溫暖色調，貓步漫遊 App 插圖風格，正方形構圖`; }
function pcPrompt(spec){ const c=CZH[spec.color]||spec.color; const p=PDESC[spec.pose]||spec.pose||'悠閒坐著'; const EDESC={'巷弄':'台灣老巷弄磚牆邊','店面':'傳統自助餐店門口','公園':'公園綠蔭草地','市場':'傳統市場攤位旁','廟口':'廟宇香爐旁石階','屋頂':'台灣老舊鐵皮屋頂'}; return `台北市${spec.district}，一隻${c}${p}，場景是${EDESC[spec.env]||spec.env}，背景是${LM[spec.district]||spec.district+'街道'}台灣老街建築，日系可愛水彩插畫，色調明亮溫暖，明信片橫向3:2比例，貓步漫遊 App 插圖風格`; }

// ── Gemini Imagen ─────────────────────────────
async function genImg(prompt, outPath, ar='1:1'){
  console.log(`  🎨 ${path.basename(outPath)}`);
  try{
    const res=await fj(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_KEY}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({instances:[{prompt}],parameters:{sampleCount:1,aspectRatio:ar}})});
    const b64=res?.predictions?.[0]?.bytesBase64Encoded;
    if(!b64){ console.warn(`  ⚠️ 未取得圖片`); return null; }
    await fs.writeFile(outPath,Buffer.from(b64,'base64'));
    console.log(`  ✅ saved`);
    return outPath;
  }catch(e){ console.error(`  ❌ ${e.message}`); return null; }
}

const FORCE=process.argv.includes('--force');
async function maybe(outPath, fn){ if(!FORCE){ try{ await fs.access(outPath); console.log(`  ♻️ 已存在: ${path.basename(outPath)}`); return outPath; }catch{} } return fn(); }

// ── Main tasks ────────────────────────────────
const TYPE=process.argv[process.argv.indexOf('--type')+1]||'all';
console.log('🐾 貓步漫遊生圖腳本 v2  type='+TYPE);
if(!NOTION_TOKEN||!GEMINI_KEY){ console.error('❌ 請設定 .env'); process.exit(1); }

const pages=await notionQuery(REPORTS_DB);
const reports=pages.map(p=>({color:gp(p,'color_key'),pose:gp(p,'pose'),env:gp(p,'environment'),loc:gp(p,'Location')})).filter(r=>r.loc);
console.log(`  取得 ${reports.length} 筆回報`);
const stats=analyze(reports);
console.log('  地區統計:', Object.entries(stats).filter(([,d])=>d.count>0).map(([k,d])=>`${k}(${d.count})`).join(', '));

// 1. 整張地圖
let mapImg=null;
if(TYPE==='all'||TYPE==='map'){
  console.log('\n🗺️  生成台北貓版圖...');
  mapImg = await maybe(`${OUT}/cat_map.jpg`, ()=>genImg(mapPrompt(stats),`${OUT}/cat_map.jpg`,'3:2'));
}

// 2. 各區插圖
const distImgs={};
if(TYPE==='all'||TYPE==='districts'){
  console.log('\n📍 生成各區插圖...');
  for(const[name,s] of Object.entries(stats)){
    if(!s.count) continue;
    const safe=name.replace(/[^\w\u4e00-\u9fa5]/g,'_');
    const op=`${OUT}/districts/${safe}.jpg`;
    const r=await maybe(op,()=>genImg(distPrompt(name,s),op,'1:1'));
    if(r) distImgs[name]=op;
    await new Promise(r=>setTimeout(r,1200));
  }
}

// 3. 明信片
const postcardRes=[];
if(TYPE==='all'||TYPE==='postcards'){
  console.log('\n🖼️  生成明信片...');
  const m={}; reports.forEach(r=>{ const dm=r.loc?.match(/([^\s市縣]+[區鄉鎮市])/); if(!dm||!r.color||!r.env) return; const d=dm[1].replace('臺','台'); if(!m[r.color]) m[r.color]={}; if(!m[r.color][r.env]) m[r.color][r.env]={}; m[r.color][r.env][d]=(m[r.color][r.env][d]||0)+1; });
  for(const[color,envs] of Object.entries(m)){
    for(const[env,dists] of Object.entries(envs)){
      const[topDist,cnt]=Object.entries(dists).sort((a,b)=>b[1]-a[1])[0]||[null,0];
      if(!topDist) continue;
      const spec={color,env,district:topDist,count:cnt,pose:stats[topDist]?.topPose||'坐著發呆'};
      const fn=`${color.replace(/\W/g,'_')}_${env}_${topDist}.jpg`;
      const op=`${OUT}/postcards/${fn}`;
      const r=await maybe(op,()=>genImg(pcPrompt(spec),op,'4:3'));
      if(r) postcardRes.push({...spec,img:op,filename:fn});
      await new Promise(r=>setTimeout(r,1200));
    }
  }
}

// 4. manifest.json
const manifest={
  generatedAt:new Date().toISOString(),
  catMap: mapImg?'/cat_map.jpg':null,
  districts: Object.entries(stats).map(([name,s])=>({name,count:s.count,topColor:s.topColor,topPose:s.topPose,topEnv:s.topEnv,colorCnt:s.colorCnt,poseCnt:s.poseCnt,envCnt:s.envCnt,img:distImgs[name]?`/districts/${path.basename(distImgs[name])}`:null,prompt:s.count?distPrompt(name,s):null})),
  postcards: postcardRes.map(p=>({color:p.color,colorZh:CZH[p.color]||p.color,env:p.env,district:p.district,count:p.count,img:`/postcards/${p.filename}`,prompt:pcPrompt(p)})),
};
await fs.writeFile(`${OUT}/manifest.json`,JSON.stringify(manifest,null,2));
console.log(`\n🎉 完成！地圖:${manifest.catMap||'無'} 各區:${Object.keys(distImgs).length}張 明信片:${postcardRes.length}張`);
console.log('   git add public/ && git push → Vercel 自動部署');

// util
function fj(url,opts={}){ return new Promise((res,rej)=>{ const u=new URL(url); const req=https.request({hostname:u.hostname,path:u.pathname+u.search,method:opts.method||'GET',headers:opts.headers||{}},r=>{ let d=''; r.on('data',c=>d+=c); r.on('end',()=>{ try{res(JSON.parse(d))}catch{rej(new Error(d.slice(0,300)))} }); }); req.on('error',rej); if(opts.body) req.write(opts.body); req.end(); }); }
