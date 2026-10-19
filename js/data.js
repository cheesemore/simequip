(function (root) {
  var SCORE_A = { 1: [10, 10], 2: [20, 20], 3: [30, 40], 4: [40, 60], 5: [60, 100] };
  var SCORE_B = { 1: [20, 10], 2: [30, 20], 3: [40, 40], 4: [60, 60], 5: [80, 100] };
  var SCORE_C = { 1: [0, 10], 2: [0, 20], 3: [0, 40], 4: [0, 60], 5: [0, 100] };

  function span(a, b, c, d, e, f, g, h, i, j) {
    return { 1: [a, b], 2: [c, d], 3: [e, f], 4: [g, h], 5: [i, j] };
  }

  var wide = span(22, 37, 35, 59, 53, 89, 79, 133, 119, 200);
  var atk = span(14, 22, 23, 36, 33, 52, 51, 80, 76, 120);
  var def = span(8, 14, 12, 22, 19, 34, 28, 50, 44, 80);
  var mid = span(3, 8, 5, 12, 8, 20, 11, 28, 16, 40);
  var loy = span(1, 2, 1, 3, 2, 5, 3, 7, 5, 10);
  var tiny = span(2, 3, 3, 5, 4, 8, 7, 13, 10, 20);
  var res = span(1, 2, 2, 3, 3, 5, 4, 7, 6, 10);
  var exp = span(1, 2, 1, 3, 2, 5, 3, 7, 5, 10);

  root.PET_DATA = {
    parts: { 1: "项圈", 2: "护甲", 3: "护符", 4: "饰物" },
    names: {
      1: { 1: "皮质项圈", 2: "铁制项圈", 3: "银质项圈", 4: "秘银项圈", 5: "龙魂项圈" },
      2: { 1: "轻皮护甲", 2: "铁制护甲", 3: "精钢护甲", 4: "秘银护甲", 5: "龙鳞护甲" },
      3: { 1: "骨制护符", 2: "铁制护符", 3: "银质护符", 4: "秘银护符", 5: "龙晶护符" },
      4: { 1: "小铜铃", 2: "铁铃", 3: "银铃", 4: "秘银铃", 5: "龙魂铃" }
    },
    tiers: {
      1: { name: "白", fill: 0xf4f4f4, text: 0x242424, stroke: 0xbdbdbd },
      2: { name: "绿", fill: 0x2f9e44, text: 0xffffff, stroke: 0x217536 },
      3: { name: "蓝", fill: 0x2f6fe0, text: 0xffffff, stroke: 0x1d4eaa },
      4: { name: "紫", fill: 0x8a45d6, text: 0xffffff, stroke: 0x6328a8 },
      5: { name: "橙", fill: 0xe07a1a, text: 0xffffff, stroke: 0xa85a10 }
    },
    // 允许条数里平均随机，不用配置权重。
    lineChoices: {
      1: [1, 2],
      2: [1, 2, 3],
      3: [1, 2, 3],
      4: [1, 2, 3, 4],
      5: [2, 3, 4]
    },
    craftRate: { 1: 0.2, 2: 0.2, 3: 0.15, 4: 0.15 },
    // 整件期望分，来自配置说明里的平均条数 × 一条平均分。
    expected: {
      1: { 1: 19.6, 2: 22.4, 3: 21.6, 4: 22.6 },
      2: { 1: 45.2, 2: 49.3, 3: 48.1, 4: 49.4 },
      3: { 1: 85.3, 2: 90.7, 3: 88.9, 4: 90.4 },
      4: { 1: 146.0, 2: 156.9, 3: 153.6, 4: 157.0 },
      5: { 1: 296.0, 2: 312.5, 3: 307.2, 4: 311.5 }
    },
    // 单件能落到的分数范围：最少条数 × 一条最低，到最多条数 × 一条最高。
    scoreSpan: {
      1: [3, 60],
      2: [6, 150],
      3: [12, 240],
      4: [18, 480],
      5: [60, 720]
    },
    affixes: [
      { id: 1, name: "生命", parts: [1, 2, 3, 4], score: SCORE_A, range: wide },
      { id: 2, name: "魔力", parts: [1, 2, 3, 4], score: SCORE_A, range: wide },
      { id: 3, name: "攻击", parts: [1, 2], score: SCORE_A, range: atk },
      { id: 4, name: "防御", parts: [1, 3], score: SCORE_A, range: def },
      { id: 5, name: "敏捷", parts: [2, 4], score: SCORE_A, range: mid },
      { id: 6, name: "精神", parts: [1, 3], score: SCORE_A, range: mid },
      { id: 7, name: "回复", parts: [2, 4], score: SCORE_B, range: mid },
      { id: 8, name: "忠诚", parts: [1, 2, 3, 4], score: SCORE_B, range: loy },
      { id: 9, name: "必杀", parts: [1, 3], score: SCORE_B, range: tiny },
      { id: 10, name: "反击", parts: [3, 4], score: SCORE_B, range: tiny },
      { id: 11, name: "闪避", parts: [2, 4], score: SCORE_B, range: tiny },
      { id: 12, name: "魔法抗性", parts: [1, 2, 3, 4], score: SCORE_C, range: res },
      { id: 13, name: "异常抗性", parts: [1, 2, 3, 4], score: SCORE_C, range: res },
      { id: 14, name: "经验加成", parts: [1, 2, 3, 4], score: SCORE_C, range: exp },
      { id: 15, name: "法术暴击", parts: [1, 4], score: SCORE_B, range: tiny },
      { id: 16, name: "法术穿透", parts: [2, 3], score: SCORE_B, range: tiny },
      { id: 17, name: "防御忽视", parts: [2, 4], score: SCORE_B, range: tiny },
      { id: 18, name: "命中", parts: [2, 3], score: SCORE_B, range: tiny }
    ]
  };
})(typeof window !== "undefined" ? window : globalThis);
