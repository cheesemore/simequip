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

  function craftAll(items) {
    var list = items.slice();
    var success = 0;
    var fail = 0;
    for (var level = 1; level <= 4; level++) {
      while (true) {
        var groups = {};
        for (var i = 0; i < list.length; i++) {
          var item = list[i];
          if (item.level !== level) continue;
          if (!groups[item.part]) groups[item.part] = [];
          groups[item.part].push(item);
        }
        var ready = [];
        for (var key in groups) {
          if (groups[key].length >= 3) ready.push(Number(key));
        }
        if (!ready.length) break;
        var part = pick(ready);
        var mats = shuffle(groups[part]).slice(0, 3);
        var used = {};
        for (var m = 0; m < mats.length; m++) used[mats[m].id] = true;
        list = list.filter(function (it) { return !used[it.id]; });
        if (Math.random() < DATA.craftRate[level]) {
          list.push(roll(part, level + 1));
          success++;
        } else {
          fail++;
        }
      }
    }
    return { items: list, success: success, fail: fail };
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
