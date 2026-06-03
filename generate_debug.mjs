// 診斷腳本 — 先確認 Notion API 能正確回應
import https from 'https';

// 載入 .env
import fs from 'fs/promises';
try {
  const env = await fs.readFile('.env', 'utf8');
  env.split('\n').forEach(l => {
    const [k, ...v] = l.split('=');
    if (k?.trim() && v.length) process.env[k.trim()] = v.join('=').trim();
  });
} catch(e) { console.log('.env 載入失敗:', e.message); }

const TOKEN = process.env.NOTION_TOKEN;
const DB    = process.env.NOTION_REPORTS_DB;

console.log('NOTION_TOKEN:', TOKEN ? TOKEN.slice(0,12)+'...' : '❌ 未設定');
console.log('NOTION_REPORTS_DB:', DB ? DB : '❌ 未設定');

if (!TOKEN || !DB) { console.log('\n請確認 .env 檔案內容正確'); process.exit(1); }

// 測試 Notion API
function fetchJson(url, opts={}) {
  return new Promise((res, rej) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname, path: u.pathname + u.search,
      method: opts.method || 'GET', headers: opts.headers || {}
    }, r => {
      let d = ''; r.on('data', c => d += c);
      r.on('end', () => { try { res(JSON.parse(d)); } catch { rej(new Error(d.slice(0,300))); } });
    });
    req.on('error', rej);
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

console.log('\n正在測試 Notion API...');
try {
  const data = await fetchJson(`https://api.notion.com/v1/databases/${DB}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ page_size: 3 }),
  });

  if (data.results) {
    console.log('✅ Notion API 連接成功！');
    console.log('   取得', data.results.length, '筆（前3筆）');
    console.log('   第一筆欄位:', Object.keys(data.results[0]?.properties || {}));
  } else {
    console.log('❌ API 回傳錯誤:');
    console.log(JSON.stringify(data, null, 2));
  }
} catch(e) {
  console.log('❌ 連線失敗:', e.message);
}
