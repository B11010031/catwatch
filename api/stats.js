// api/stats.js — 去重版本
const DATA = {
  "ok": true,
  "total": 81,
  "totalCats": 86,
  "districts": {
    "新店區": {
      "count": 13,
      "colorCnt": {
        "橘白貓": 2,
        "虎斑貓": 3,
        "黑貓": 2,
        "灰貓": 1,
        "賓士貓": 1,
        "白貓": 3,
        "三花貓": 1
      },
      "poseCnt": {
        "蜷縮躺覺": 2,
        "other": 6,
        "坐著發呆": 1,
        "走動中": 3,
        "吃飯": 1
      },
      "envCnt": {
        "其他": 10,
        "店面": 1,
        "巷弄": 1
      },
      "topColor": "虎斑貓",
      "topPose": "other",
      "topEnv": "其他",
      "landmark": "碧潭吊橋旁河岸"
    },
    "安樂區": {
      "count": 5,
      "colorCnt": {
        "虎斑貓": 1,
        "三花貓": 1,
        "橘貓": 1,
        "灰貓": 2
      },
      "poseCnt": {
        "警覺站立": 1,
        "蜷縮躺覺": 2,
        "坐著發呆": 2
      },
      "envCnt": {
        "巷弄": 4,
        "其他": 1
      },
      "topColor": "灰貓",
      "topPose": "蜷縮躺覺",
      "topEnv": "巷弄",
      "landmark": "基隆安樂區老街巷弄"
    },
    "大安區": {
      "count": 14,
      "colorCnt": {
        "灰貓": 2,
        "玳瑁貓": 1,
        "橘貓": 3,
        "虎斑貓": 2,
        "黑貓": 3,
        "白貓": 1,
        "橘白貓": 2
      },
      "poseCnt": {
        "坐著發呆": 4,
        "走動中": 1,
        "蜷縮躺覺": 4,
        "曬太陽": 2,
        "警覺站立": 1,
        "吃飯": 2
      },
      "envCnt": {
        "騎樓下": 1,
        "店面": 1,
        "巷弄": 4,
        "其他": 2
      },
      "topColor": "橘貓",
      "topPose": "坐著發呆",
      "topEnv": "巷弄",
      "landmark": "永康街老公寓巷弄"
    },
    "中正區": {
      "count": 7,
      "colorCnt": {
        "白貓": 2,
        "灰貓": 2,
        "三花貓": 1,
        "白底虎斑": 1,
        "虎斑貓": 1
      },
      "poseCnt": {
        "蜷縮躺覺": 1,
        "曬太陽": 1,
        "坐著發呆": 2,
        "走動中": 1,
        "警覺站立": 2
      },
      "envCnt": {
        "騎樓下": 1,
        "其他": 2,
        "公園": 1,
        "山區": 1,
        "店面": 2
      },
      "topColor": "白貓",
      "topPose": "坐著發呆",
      "topEnv": "其他",
      "landmark": "師大夜市附近巷弄"
    },
    "桃園市": {
      "count": 17,
      "colorCnt": {
        "三花貓": 1,
        "賓士貓": 2,
        "虎斑貓": 3,
        "白貓": 4,
        "橘貓": 2,
        "玳瑁貓": 1,
        "黑貓": 1,
        "灰貓": 2,
        "棕白貓": 1
      },
      "poseCnt": {
        "走動中": 3,
        "蜷縮躺覺": 2,
        "警覺站立": 2,
        "坐著發呆": 5,
        "other": 3,
        "理毛": 2
      },
      "envCnt": {
        "其他": 6,
        "公園": 4,
        "巷弄": 4
      },
      "topColor": "白貓",
      "topPose": "坐著發呆",
      "topEnv": "其他",
      "landmark": "桃園市的街道"
    },
    "松山區": {
      "count": 3,
      "colorCnt": {
        "橘白貓": 1,
        "白貓": 2
      },
      "poseCnt": {
        "蜷縮躺覺": 1,
        "警覺站立": 2
      },
      "envCnt": {
        "其他": 2
      },
      "topColor": "白貓",
      "topPose": "警覺站立",
      "topEnv": "其他",
      "landmark": "饒河夜市入口"
    },
    "新莊區": {
      "count": 2,
      "colorCnt": {
        "虎斑貓": 2
      },
      "poseCnt": {
        "蜷縮躺覺": 2
      },
      "envCnt": {
        "其他": 1,
        "店面": 1
      },
      "topColor": "虎斑貓",
      "topPose": "蜷縮躺覺",
      "topEnv": "其他",
      "landmark": "新莊廟街傳統建築"
    },
    "中和區": {
      "count": 7,
      "colorCnt": {
        "黑貓": 1,
        "橘白貓": 1,
        "賓士貓": 1,
        "玳瑁貓": 1,
        "三花貓": 2,
        "虎斑貓": 1
      },
      "poseCnt": {
        "坐著發呆": 3,
        "蜷縮躺覺": 1,
        "other": 1,
        "曬太陽": 2
      },
      "envCnt": {
        "公園": 2,
        "巷弄": 2,
        "矮牆/圍牆上": 3
      },
      "topColor": "三花貓",
      "topPose": "坐著發呆",
      "topEnv": "矮牆/圍牆上",
      "landmark": "南勢角市場老街"
    },
    "連江縣": {
      "count": 2,
      "colorCnt": {
        "橘貓": 1,
        "玳瑁貓": 1
      },
      "poseCnt": {
        "坐著發呆": 1,
        "other": 1
      },
      "envCnt": {
        "店面": 1,
        "巷弄": 1
      },
      "topColor": "橘貓",
      "topPose": "坐著發呆",
      "topEnv": "店面",
      "landmark": "馬祖老街石屋"
    },
    "中山區": {
      "count": 1,
      "colorCnt": {
        "虎斑貓": 1
      },
      "poseCnt": {
        "警覺站立": 1
      },
      "envCnt": {
        "其他": 1
      },
      "topColor": "虎斑貓",
      "topPose": "警覺站立",
      "topEnv": "其他",
      "landmark": "林森北路老眷村巷弄"
    },
    "仁愛區": {
      "count": 3,
      "colorCnt": {
        "虎斑貓": 1,
        "白貓": 1,
        "黑貓": 1
      },
      "poseCnt": {
        "坐著發呆": 3
      },
      "envCnt": {
        "矮牆/圍牆上": 1
      },
      "topColor": "虎斑貓",
      "topPose": "坐著發呆",
      "topEnv": "矮牆/圍牆上",
      "landmark": "基隆仁愛區海港附近"
    },
    "信義區": {
      "count": 3,
      "colorCnt": {
        "灰貓": 3
      },
      "poseCnt": {
        "坐著發呆": 1,
        "走動中": 1,
        "other": 1
      },
      "envCnt": {
        "巷弄": 1,
        "其他": 1,
        "公園": 1
      },
      "topColor": "灰貓",
      "topPose": "坐著發呆",
      "topEnv": "巷弄",
      "landmark": "信義商圈旁靜巷"
    },
    "萬里區": {
      "count": 3,
      "colorCnt": {
        "白底虎斑": 2,
        "棕白貓": 1
      },
      "poseCnt": {
        "走動中": 2,
        "坐著發呆": 1
      },
      "envCnt": {
        "山區": 3
      },
      "topColor": "白底虎斑",
      "topPose": "走動中",
      "topEnv": "山區",
      "landmark": "萬里野柳奇岩海岸"
    },
    "大同區": {
      "count": 1,
      "colorCnt": {
        "黑貓": 1
      },
      "poseCnt": {
        "蜷縮躺覺": 1
      },
      "envCnt": {
        "矮牆/圍牆上": 1
      },
      "topColor": "黑貓",
      "topPose": "蜷縮躺覺",
      "topEnv": "矮牆/圍牆上",
      "landmark": "大稻埕碼頭老洋樓"
    }
  },
  "postcards": [
    {
      "color": "orange_white",
      "colorZh": "橘白貓",
      "district": "新店區",
      "count": 6,
      "img": "/public/postcards/orange_white.jpg",
      "prompt": "新店區，一隻巨大橘白貓，背景是碧潭吊橋旁河岸"
    },
    {
      "color": "tabby",
      "colorZh": "虎斑貓",
      "district": "新店區",
      "count": 15,
      "img": "/public/postcards/tabby.jpg",
      "prompt": "新店區，一隻巨大虎斑貓，背景是碧潭吊橋旁河岸"
    },
    {
      "color": "calico",
      "colorZh": "三花貓",
      "district": "中和區",
      "count": 6,
      "img": "/public/postcards/calico.jpg",
      "prompt": "中和區，一隻巨大三花貓，背景是南勢角市場老街"
    },
    {
      "color": "orange",
      "colorZh": "橘貓",
      "district": "大安區",
      "count": 7,
      "img": "/public/postcards/orange.jpg",
      "prompt": "大安區，一隻巨大橘貓，背景是永康街老公寓巷弄"
    },
    {
      "color": "gray",
      "colorZh": "灰貓",
      "district": "信義區",
      "count": 12,
      "img": "/public/postcards/gray.jpg",
      "prompt": "信義區，一隻巨大灰貓，背景是信義商圈旁靜巷"
    },
    {
      "color": "white",
      "colorZh": "白貓",
      "district": "桃園市",
      "count": 13,
      "img": "/public/postcards/white.jpg",
      "prompt": "桃園市，一隻巨大白貓，背景是桃園市街道"
    },
    {
      "color": "tortoiseshell",
      "colorZh": "玳瑁貓",
      "district": "大安區",
      "count": 4,
      "img": "/public/postcards/tortoiseshell.jpg",
      "prompt": "大安區，一隻巨大玳瑁貓，背景是永康街老公寓巷弄"
    },
    {
      "color": "black",
      "colorZh": "黑貓",
      "district": "大安區",
      "count": 9,
      "img": "/public/postcards/black.jpg",
      "prompt": "大安區，一隻巨大黑貓，背景是永康街老公寓巷弄"
    },
    {
      "color": "black_white",
      "colorZh": "賓士貓",
      "district": "桃園市",
      "count": 4,
      "img": "/public/postcards/black_white.jpg",
      "prompt": "桃園市，一隻巨大賓士貓，背景是桃園市街道"
    },
    {
      "color": "white_tabby",
      "colorZh": "白底虎斑",
      "district": "萬里區",
      "count": 3,
      "img": "/public/postcards/white_tabby.jpg",
      "prompt": "萬里區，一隻巨大白底虎斑，背景是萬里野柳奇岩海岸"
    },
    {
      "color": "brown_white",
      "colorZh": "棕白貓",
      "district": "萬里區",
      "count": 2,
      "img": "/public/postcards/brown_white.jpg",
      "prompt": "萬里區，一隻巨大棕白貓，背景是萬里野柳奇岩海岸"
    }
  ],
  "topUsers": [
    {
      "name": "555",
      "xp": 810
    },
    {
      "name": "Pei",
      "xp": 490
    },
    {
      "name": "nininana",
      "xp": 490
    },
    {
      "name": "666",
      "xp": 450
    },
    {
      "name": "555",
      "xp": 450
    },
    {
      "name": "Cynthia",
      "xp": 320
    },
    {
      "name": "pei",
      "xp": 200
    },
    {
      "name": "Pei",
      "xp": 200
    },
    {
      "name": "Xuan",
      "xp": 180
    },
    {
      "name": "yluo",
      "xp": 170
    }
  ]
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600');
  return res.status(200).json(DATA);
}
