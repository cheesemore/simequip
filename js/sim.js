(function (root) {
  var DATA = root.PET_DATA;
  var nextId = 1;

  function randInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function lineScore(affix, level, value) {
    var bounds = affix.range[level];
    var pair = affix.score[level];
    var min = bounds[0];
    var max = bounds[1];
    var span = max - min;
    var pct = span <= 0 ? 100 : 30 + Math.floor((70 * (value - min)) / span);
    return pair[0] + Math.floor((pair[1] * pct) / 100);
  }

  function roll(part, level) {
    var pool = DATA.affixes.filter(function (affix) {
      return affix.parts.indexOf(part) >= 0;
    });
    var count = pick(DATA.lineChoices[level]);
    var chosen = shuffle(pool).slice(0, count);
    var lines = chosen.map(function (affix) {
      var bounds = affix.range[level];
      var value = randInt(bounds[0], bounds[1]);
      return {
        type: affix.id,
        name: affix.name,
        value: value,
        min: bounds[0],
        max: bounds[1],
        score: lineScore(affix, level, value)
      };
    });
    var score = 0;
    for (var i = 0; i < lines.length; i++) score += lines[i].score;
    return {
      id: nextId++,
      part: part,
      level: level,
      lines: lines,
      score: score
    };
  }

  function signature(item) {
    var parts = [];
    for (var i = 0; i < item.lines.length; i++) {
      parts.push(item.lines[i].type + ":" + item.lines[i].value);
    }
    parts.sort();
    return parts.join("|");
  }

  function rollFresh(part, level, avoid) {
    var banned = {};
    if (avoid) {
      for (var i = 0; i < avoid.length; i++) banned[signature(avoid[i])] = true;
    }
    var made = roll(part, level);
    for (var n = 0; n < 12 && banned[signature(made)]; n++) made = roll(part, level);
    return made;
  }

  function craftAll(items) {
    var groups = {};
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (item.level >= 5) continue;
      var key = item.level + ":" + item.part;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    var used = {};
    var made = [];
    var success = 0;
    var fail = 0;
    for (var key in groups) {
      var pool = shuffle(groups[key]);
      var level = pool[0].level;
      var part = pool[0].part;
      while (pool.length >= 3) {
        var mats = pool.splice(0, 3);
        for (var m = 0; m < mats.length; m++) used[mats[m].id] = true;
        if (Math.random() < DATA.craftRate[level]) {
          made.push(roll(part, level + 1));
          success++;
        } else {
          made.push(rollFresh(part, level, mats));
          fail++;
        }
      }
    }
    var list = [];
    for (var j = 0; j < items.length; j++) {
      if (!used[items[j].id]) list.push(items[j]);
    }
    for (var k = 0; k < made.length; k++) list.push(made[k]);
    return { items: list, success: success, fail: fail, made: made };
  }

  function selfTest() {
    var byName = {};
    DATA.affixes.forEach(function (affix) { byName[affix.name] = affix; });
    var magic = lineScore(byName["魔法抗性"], 2, 2);
    var counter = lineScore(byName["反击"], 2, 3);
    var crit = lineScore(byName["必杀"], 2, 4);
    if (magic !== 6 || counter !== 36 || crit !== 43 || magic + counter + crit !== 85) {
      throw new Error("分数自检失败 " + magic + "+" + counter + "+" + crit);
    }
    if (lineScore(byName["魔法抗性"], 1, 1) !== 3) {
      throw new Error("1级魔法抗性下限应为 3");
    }
    if (lineScore(byName["命中"], 1, 3) !== 30) {
      throw new Error("1级命中顶满应为 30");
    }
  }

  root.PetSim = {
    roll: roll,
    rollFresh: rollFresh,
    craftAll: craftAll,
    selfTest: selfTest,
    itemName: function (part, level) { return DATA.names[part][level]; },
    partName: function (part) { return DATA.parts[part]; },
    tier: function (level) { return DATA.tiers[level]; },
    craftRate: function (level) { return DATA.craftRate[level] || 0; },
    expected: function (part, level) { return DATA.expected[level][part]; },
    scoreSpan: function (level) { return DATA.scoreSpan[level]; }
  };
})(typeof window !== "undefined" ? window : globalThis);
