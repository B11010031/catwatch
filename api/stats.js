// api/stats.js
// Vercel Serverless Function
// 呼叫方式：GET /api/stats
// 回傳：各區回報統計 + 明信片組合

const NOTION_TOKEN   = process.env.NOTION_TOKEN;
const REPORTS_DB     = process.env.NOTION_REPORTS_DB;

// ── 地標對照 ─────────────────────────────────────────────
const LANDMARKS = {
  '大安區': '永康街老公寓巷弄',   '信義區': '信義商圈旁靜巷',
  '士林區': '士林夜市攤販街',     '中山區': '林森北路老眷村巷弄',
  '松山區': '饒河夜市入口',       '大同區': '大稻埕碼頭老洋樓',
  '中正區': '師大夜市附近巷弄',   '萬華區': '龍山寺旁香火廣場',
  '文山區': '木柵貓空茶山梯田',   '南港區': '南港舊工廠紅磚牆',
  '內湖區': '大湖公園荷花步道',   '北投區': '北投溫泉旁小橋',
  '板橋區': '府中路老街廟宇群',   '三重區': '三重廟街熱鬧市集',
  '中和區': '南勢角市場老街',     '永和區': '永和豆漿大王旁巷弄',
  '新莊區': '新莊廟街傳統建築',   '新店區': '碧潭吊橋旁河岸',
  '樹林區': '樹林火車站旁老街',   '鶯歌區': '鶯歌陶瓷老街',
  '三峽區': '三峽老街紅磚拱廊',   '淡水區': '淡水老街夕照河岸',
  '汐止區': '汐止火車站旁小巷',   '瑞芳區': '九份山城老街石階',
  '土城區': '土城桐花公園步道',   '蘆洲區': '蘆洲老街廟埕廣場',
  '五股區': '五股溼地水鳥保護區', '林口區': '林口台地竹林步道',
  '深坑區': '深坑老街臭豆腐名店', '三芝區': '三芝海岸老街風車',
  '石門區': '石門海蝕洞岩岸',     '八里區': '八里渡船頭河岸',
  '平溪區': '平溪老街天燈節',     '金山區': '金山老街磺港漁村',
  '萬里區': '萬里野柳奇岩海岸',   '烏來區': '烏來老街溫泉瀑布',
};

const COLOR_ZH = {
  black:'黑貓', tabby:'虎斑貓', calico:'三花貓',
  orange:'橘貓', white:'白貓', tuxedo:'賓士貓',
};

const POSE_DESC = {
  '蜷縮睡覺': '蜷縮在造型特製的貓咪午休榻上深深入睡',
  '坐著發呆': '悠閒端坐，眼神放空望向遠方',
  '走路':     '優雅踱步，尾巴高高翹起',
};

// ── Notion query ─────────────────────────────────────────
async function notionQuery(dbId) {
  const results = [];
  let cursor;
  do {
    const body = JSON.stringify(cursor ? { start_cursor: cursor } : {});
    const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body,
    });
    const data = await res.json();
    if (!data.results) break;
    results.push(...data.results);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return results;
}

function getProp(page, key) {
  const p = page.properties?.[key];
  if (!p) return null;
  if (p.type === 'title')        return p.title?.[0]?.plain_text ?? null;
  if (p.type === 'rich_text')    return p.rich_text?.[0]?.plain_text ?? null;
  if (p.type === 'select')       return p.select?.name ?? null;
  if (p.type === 'multi_select') return p.multi_select?.map(s => s.name) ?? [];
  if (p.type === 'number')       return p.number ?? null;
  return null;
}

// ── 分析統計 ─────────────────────────────────────────────
function analyze(reports) {
  const byDist = {};
  reports.forEach(r => {
    const m = r.location?.match(/([^\s市縣]+[區鄉鎮市])/);
    if (!m) return;
    const dist = m[1].replace(/臺/g, '台');
    if (!byDist[dist]) byDist[dist] = [];
    byDist[dist].push(r);
  });

  const stats = {};
  Object.entries(byDist).forEach(([dist, rows]) => {
    const colorCnt = {}, poseCnt = {}, envCnt = {};
    rows.forEach(r => {
      if (r.color) colorCnt[r.color] = (colorCnt[r.color] || 0) + 1;
      if (r.pose)  poseCnt[r.pose]   = (poseCnt[r.pose]  || 0) + 1;
      if (r.env)   envCnt[r.env]     = (envCnt[r.env]    || 0) + 1;
    });
    const top = obj => Object.entries(obj).sort((a, b) => b[1] - a[1])[0]?.[0];
    stats[dist] = {
      count:    rows.length,
      colorCnt, poseCnt, envCnt,
      topColor: top(colorCnt),
      topPose:  top(poseCnt),
      topEnv:   top(envCnt),
      landmark: LANDMARKS[dist] || `${dist}的街道`,
    };
  });
  return stats;
}

// 明信片矩陣：顏色 × 環境 → 哪個區回報最多
function buildPostcards(reports) {
  const matrix = {};
  reports.forEach(r => {
    const m = r.location?.match(/([^\s市縣]+[區鄉鎮市])/);
    if (!m || !r.color || !r.env) return;
    const dist = m[1].replace(/臺/g, '台');
    if (!matrix[r.color]) matrix[r.color] = {};
    if (!matrix[r.color][r.env]) matrix[r.color][r.env] = {};
    matrix[r.color][r.env][dist] = (matrix[r.color][r.env][dist] || 0) + 1;
  });

  const cards = [];
  Object.entries(matrix).forEach(([color, envs]) => {
    Object.entries(envs).forEach(([env, dists]) => {
      const [topDist, cnt] = Object.entries(dists).sort((a, b) => b[1] - a[1])[0] || [];
      if (!topDist) return;
      const colorZh = COLOR_ZH[color] || color;
      const landmark = LANDMARKS[topDist] || topDist;
      const ENV_DESC = {
        '巷弄':'台灣老巷弄磚牆邊', '店面':'傳統自助餐店門口',
        '公園':'公園綠蔭草地',     '市場':'傳統市場攤位旁',
      };
      cards.push({
        color, colorZh, env, district: topDist, count: cnt,
        prompt: `台北市${topDist}，一隻${colorZh}悠閒坐著，場景是${ENV_DESC[env]||env}，背景是${landmark}台灣老街建築，日系可愛水彩插畫，色調明亮溫暖，明信片3:2比例，貓步漫遊App插圖風格`,
      });
    });
  });
  return cards;
}

// ── Handler ──────────────────────────────────────────────
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  // Cache 5 分鐘（避免每次重新載入都打 Notion API）
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  if (!NOTION_TOKEN || !REPORTS_DB) {
    return res.status(500).json({ error: '缺少環境變數 NOTION_TOKEN 或 NOTION_REPORTS_DB' });
  }

  try {
    // 拉 Reports
    const pages = await notionQuery(REPORTS_DB);
    const reports = pages.map(p => ({
      user:     getProp(p, 'user_nickname'),
      color:    getProp(p, 'color_key'),
      pose:     getProp(p, 'pose'),
      env:      getProp(p, 'environment'),
      location: getProp(p, 'Location'),
      xp:       getProp(p, 'xp_earned'),
    })).filter(r => r.location);

    const stats    = analyze(reports);
    const postcards = buildPostcards(reports);
    const total    = reports.length;

    return res.status(200).json({
      ok: true,
      total,
      generatedAt: new Date().toISOString(),
      districts: stats,
      postcards,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
