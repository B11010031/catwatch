/**
 * generate.mjs — 貓步漫遊生圖腳本 v4
 * 每種貓咪顏色生一張代表圖，共 11 張
 * 只需要 GEMINI_API_KEY
 * 用法：node generate.mjs
 */
import fs from 'fs/promises';
import path from 'path';
import https from 'https';

// 載入 .env
try {
  const env = await fs.readFile('.env', 'utf8');
  env.split('\n').forEach(l => {
    const [k, ...v] = l.split('=');
    if (k?.trim() && v.length) process.env[k.trim()] = v.join('=').trim();
  });
} catch {}

const GEMINI_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_KEY) {
  console.error('❌ 請設定 GEMINI_API_KEY');
  process.exit(1);
}

const OUT = './public/postcards';
await fs.mkdir(OUT, { recursive: true });

const FORCE = process.argv.includes('--force');

// ── 顏色設定 ──────────────────────────────────────────────
const COLOR_ZH = {
  black:        { zh:'黑貓',    district:'大安區', env:'巷弄',   landmark:'永康街老公寓巷弄' },
  tabby:        { zh:'虎斑貓',  district:'新店區', env:'其他',   landmark:'碧潭吊橋旁河岸' },
  calico:       { zh:'三花貓',  district:'安樂區', env:'巷弄',   landmark:'基隆安樂區老街巷弄' },
  orange:       { zh:'橘貓',    district:'安樂區', env:'巷弄',   landmark:'基隆安樂區老街巷弄' },
  white:        { zh:'白貓',    district:'中正區', env:'騎樓下', landmark:'師大夜市附近巷弄' },
  gray:         { zh:'灰貓',    district:'信義區', env:'巷弄',   landmark:'信義商圈旁靜巷' },
  orange_white: { zh:'橘白貓',  district:'新店區', env:'其他',   landmark:'碧潭吊橋旁河岸' },
  black_white:  { zh:'賓士貓',  district:'中和區', env:'公園',   landmark:'南勢角市場老街公園' },
  white_tabby:  { zh:'白底虎斑',district:'萬里區', env:'山區',   landmark:'萬里野柳奇岩海岸' },
  brown_white:  { zh:'棕白貓',  district:'萬里區', env:'山區',   landmark:'萬里野柳奇岩海岸' },
  tortoiseshell:{ zh:'玳瑁貓',  district:'連江縣', env:'巷弄',   landmark:'馬祖老街石屋' },
};

const ENV_DESC = {
  '巷弄':'台灣老巷弄磚牆邊', '店面':'傳統自助餐店門口',
  '公園':'公園綠蔭草地', '騎樓下':'台灣騎樓拱廊下',
  '矮牆/圍牆上':'矮牆圍牆上', '山區':'台灣山區步道旁', '其他':'台灣街頭',
};

// ── Gemini Imagen 4 ───────────────────────────────────────
async function genImg(prompt, outPath) {
  console.log(`  🎨 生成: ${path.basename(outPath)}`);
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${GEMINI_KEY}`;
    const data = await fj(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio: '4:3' },
      }),
    });
    const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) {
      console.warn(`  ⚠️  未取得圖片:`, JSON.stringify(data).slice(0, 150));
      return null;
    }
    await fs.writeFile(outPath, Buffer.from(b64, 'base64'));
    console.log(`  ✅ 完成`);
    return outPath;
  } catch (e) {
    console.error(`  ❌ ${e.message}`);
    return null;
  }
}

// ── MAIN ─────────────────────────────────────────────────
console.log('🐾 貓步漫遊生圖腳本 v4');
console.log(`   生成 ${Object.keys(COLOR_ZH).length} 種貓咪代表圖\n`);

const results = {};

for (const [colorKey, info] of Object.entries(COLOR_ZH)) {
  const outPath = `${OUT}/${colorKey}.jpg`;

  if (!FORCE) {
    try {
      await fs.access(outPath);
      console.log(`  ♻️  已存在: ${colorKey}.jpg`);
      results[colorKey] = `/postcards/${colorKey}.jpg`;
      continue;
    } catch {}
  }

  const envDesc = ENV_DESC[info.env] || info.env;
  const prompt = `台灣${info.district}，一隻巨大可愛的${info.zh}佔畫面前景，蜷縮在造型特製的貓咪午休榻上熟睡，場景是${envDesc}，背景是${info.landmark}台灣老街建築，日系可愛水彩插畫風格，色調明亮溫暖，筆觸細膩，貓咪表情慵懶可愛，貓步漫遊App插圖風格`;

  const r = await genImg(prompt, outPath);
  if (r) results[colorKey] = `/postcards/${colorKey}.jpg`;

  await sleep(1000);
}

// 更新 manifest.json
let manifest = {};
try {
  manifest = JSON.parse(await fs.readFile('./public/manifest.json', 'utf8'));
} catch {}

manifest.postcardImgs = results;
manifest.generatedAt  = new Date().toISOString();
await fs.writeFile('./public/manifest.json', JSON.stringify(manifest, null, 2));

console.log(`\n🎉 完成！生成 ${Object.keys(results).length} 張`);
console.log('   執行以下指令部署：');
console.log('   git add public/ && git commit -m "add cat images" && git push');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function fj(url, opts = {}) {
  return new Promise((res, rej) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname, path: u.pathname + u.search,
      method: opts.method || 'GET', headers: opts.headers || {}
    }, r => {
      let d = ''; r.on('data', c => d += c);
      r.on('end', () => { try { res(JSON.parse(d)); } catch { rej(new Error(d.slice(0, 300))); } });
    });
    req.on('error', rej);
    if (opts.body) req.write(opts.body);
    req.end();
  });
}
