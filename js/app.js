(function () {
  var SIZE = 65;
  var GAP = 5;
  var BAG_LIMIT = 999;
  var items = [];
  var focusId = 0;
  var logs = [];
  var born = 0;
  var app = null;
  var board = null;
  var texCache = {};

  var TIER_INK = {
    1: "#f4f4f4",
    2: "#6ed98a",
    3: "#8eb6ff",
    4: "#d2a6ff",
    5: "#ffb45a"
  };

  PetSim.selfTest();

  var boardHost = document.getElementById("board");
  var emptyEl = document.getElementById("empty");
  var detailEl = document.getElementById("detail");
  var statusEl = document.getElementById("status");
  var countEl = document.getElementById("count");
  var logEl = document.getElementById("log");
  var bornEl = document.getElementById("born-num");
  var genButtons = [
    document.getElementById("gen1"),
    document.getElementById("gen10"),
    document.getElementById("gen100")
  ];
  var sparkIds = {};
  var SPARK = { 3: 0x6aa6ff, 4: 0xd2a6ff, 5: 0xffb45a };

  function setStatus(text) {
    statusEl.textContent = text || "";
  }

  function pushLog(line) {
    logs.unshift(line);
    if (logs.length > 16) logs.length = 16;
    logEl.textContent = logs.join("\n");
  }

  function bumpBorn() {
    bornEl.textContent = String(born);
    bornEl.classList.remove("bump");
    void bornEl.offsetWidth;
    bornEl.classList.add("bump");
  }

  function byId(id) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id) return items[i];
    }
    return null;
  }

  function sortedItems() {
    return items.slice().sort(function (a, b) {
      return b.score - a.score || b.level - a.level || a.id - b.id;
    });
  }

  function pickPart() {
    return 1 + Math.floor(Math.random() * 4);
  }

  function bagFull() {
    return items.length > BAG_LIMIT;
  }

  function markSpark(item) {
    if (item.level >= 3) sparkIds[item.id] = item.level;
  }

  function generate(n) {
    if (bagFull()) {
      setStatus("背包已超过 999 件，不能再生成");
      return;
    }
    for (var i = 0; i < n; i++) items.push(PetSim.roll(pickPart(), 1));
    born += n;
    bumpBorn();
    pushLog("生成 " + n + " 件 1 级装备");
    setStatus(bagFull() ? "背包已超过 999 件，不能再生成" : "已生成 " + n + " 件 1 级装备");
    render();
  }

  function craftEverything() {
    var result = PetSim.craftAll(items);
    items = result.items;
    if (result.made) {
      for (var n = 0; n < result.made.length; n++) markSpark(result.made[n]);
    }
    if (focusId && !byId(focusId)) focusId = 0;
    pushLog("一键合成：成功 " + result.success + "，失败 " + result.fail);
    setStatus("一键合成结束。成功 " + result.success + "，失败 " + result.fail);
    render();
  }

  function onTile(item) {
    focusId = item.id;
    render();
  }

  function closeTip() {
    focusId = 0;
    render();
  }

  function gradeOf(score, expected) {
    var ratio = expected > 0 ? score / expected : 1;
    if (ratio >= 2) return { name: "极品", cls: "grade-legend" };
    if (ratio >= 1.45) return { name: "优秀", cls: "grade-great" };
    if (ratio >= 1.05) return { name: "良好", cls: "grade-good" };
    if (ratio >= 0.75) return { name: "普通", cls: "grade-ok" };
    return { name: "偏低", cls: "grade-low" };
  }

  function clampPct(value, lo, hi) {
    if (hi <= lo) return 100;
    return Math.max(0, Math.min(100, ((value - lo) / (hi - lo)) * 100));
  }

  function linePct(line) {
    if (line.max <= line.min) return 1;
    var ratio = 30 + Math.floor((70 * (line.value - line.min)) / (line.max - line.min));
    return ratio / 100;
  }

  function barColor(p) {
    if (p >= 0.85) return "#ffd76a";
    if (p >= 0.55) return "#8fd18a";
    if (p >= 0.3) return "#7eb0ff";
    return "#8b93a3";
  }

  function hex(n) {
    var s = n.toString(16);
    while (s.length < 6) s = "0" + s;
    return "#" + s;
  }

  function renderDetail() {
    var tip = document.getElementById("tip");
    var item = focusId ? byId(focusId) : null;
    if (!item) {
      tip.hidden = true;
      detailEl.innerHTML = "";
      return;
    }
    tip.hidden = false;
    var tier = PetSim.tier(item.level);
    var expected = PetSim.expected(item.part, item.level);
    var span = PetSim.scoreSpan(item.level);
    var grade = gradeOf(item.score, expected);
    var ratio = expected > 0 ? item.score / expected : 1;
    var lines = item.lines.slice().sort(function (a, b) { return b.score - a.score; });
    var ink = TIER_INK[item.level];
    var html = "";
    html += "<article class=\"item-card\" style=\"--tier:" + hex(tier.fill) + ";--tier-ink:" + ink + "\">";
    html += "<div class=\"card-head\">";
    html += "<img class=\"card-icon\" alt=\"\" src=\"" + PetIcons.url(item.part, item.level) + "\">";
    html += "<div><h2 class=\"card-name\">" + PetSim.itemName(item.part, item.level) + "</h2>";
    html += "<p class=\"meta\">" + item.level + " 级 · " + PetSim.partName(item.part) + " · " + tier.name + "装</p></div>";
    html += "</div>";
    html += "<div class=\"score-block\">";
    html += "<p class=\"score-kicker\">评分</p>";
    html += "<p class=\"score-num\">" + item.score + "</p>";
    html += "<span class=\"grade " + grade.cls + "\">" + grade.name + "</span>";
    html += "<p class=\"score-expect\">期望 " + expected.toFixed(1) + " · 本件 " + ratio.toFixed(2) + " 倍</p>";
    html += "<div class=\"meter\"><div class=\"meter-fill\" style=\"width:" + clampPct(item.score, span[0], span[1]).toFixed(1) + "%\"></div>";
    html += "<i class=\"meter-expect\" style=\"left:" + clampPct(expected, span[0], span[1]).toFixed(1) + "%\"></i></div>";
    html += "<div class=\"meter-scale\"><span>" + span[0] + "</span><span>白线是期望</span><span>" + span[1] + "</span></div>";
    html += "</div><ul class=\"affixes\">";
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var p = linePct(line);
      var full = line.value >= line.max;
      html += "<li class=\"affix\"><div class=\"affix-top\"><b class=\"affix-name\">" + line.name + "</b>";
      html += "<span class=\"affix-val" + (full ? " is-max" : "") + "\">+" + line.value + "</span>";
      if (full) html += "<span class=\"affix-tag\">满</span>";
      html += "<span class=\"affix-score\">" + line.score + " 分</span></div>";
      html += "<div class=\"affix-bar\"><span style=\"width:" + Math.round(p * 100) + "%;background:" + barColor(p) + "\"></span></div>";
      html += "<div class=\"affix-range\">" + line.min + " – " + line.max + " · 评分 " + Math.round(p * 100) + "%</div></li>";
    }
    html += "</ul>";
    html += "<p class=\"sum\">" + lines.map(function (line) { return line.score; }).join(" + ") + " = " + item.score + "</p>";
    html += "</article>";
    detailEl.innerHTML = html;
  }

  function renderCount() {
    var tally = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (var i = 0; i < items.length; i++) tally[items[i].level]++;
    var bits = ["共 " + items.length + " 件"];
    for (var level = 1; level <= 5; level++) {
      if (!tally[level]) continue;
      bits.push(PetSim.tier(level).name + " " + tally[level]);
    }
    countEl.textContent = bits.join("  ·  ");
    var blocked = bagFull();
    for (var b = 0; b < genButtons.length; b++) genButtons[b].disabled = blocked;
  }

  function textStyle(size, fill, weight) {
    return new PIXI.TextStyle({
      fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
      fontSize: size,
      fontWeight: weight || "600",
      fill: fill,
      align: "center"
    });
  }

  function iconTexture(part, level) {
    var key = part + ":" + level;
    if (!texCache[key]) texCache[key] = PIXI.Texture.from(PetIcons.url(part, level));
    return texCache[key];
  }

  function placeIcon(sprite, max, top) {
    var frame = sprite.texture.frame;
    var w = frame.width;
    var h = frame.height;
    if (!w || !h || !sprite.texture.baseTexture.valid) {
      sprite.width = 0;
      sprite.height = 0;
      return;
    }
    var scale = Math.min(max / w, max / h);
    sprite.width = Math.round(w * scale);
    sprite.height = Math.round(h * scale);
    sprite.x = (SIZE - sprite.width) / 2;
    sprite.y = top + Math.round((max - sprite.height) / 2);
  }

  function makeTile(item) {
    var tier = PetSim.tier(item.level);
    var tile = new PIXI.Container();
    tile.eventMode = "static";
    tile.cursor = "pointer";
    var focused = item.id === focusId;
    var g = new PIXI.Graphics();
    var stroke = focused ? 0xfff1c2 : tier.stroke;
    var strokeWidth = 2;
    g.lineStyle(strokeWidth, stroke, 1);
    g.beginFill(0x161b26);
    g.drawRoundedRect(strokeWidth / 2, strokeWidth / 2, SIZE - strokeWidth, SIZE - strokeWidth, 8);
    g.endFill();
    g.lineStyle(0);
    g.beginFill(tier.fill);
    g.drawRoundedRect(7, 4, SIZE - 14, 2, 1);
    g.endFill();
    tile.addChild(g);

    var iconMax = 36;
    var icon = new PIXI.Sprite(iconTexture(item.part, item.level));
    placeIcon(icon, iconMax, 3);
    if (!icon.texture.baseTexture.valid) {
      icon.texture.baseTexture.once("loaded", function () {
        if (!icon.destroyed) placeIcon(icon, iconMax, 3);
      });
    }
    tile.addChild(icon);

    var name = new PIXI.Text(PetSim.itemName(item.part, item.level), textStyle(8, 0xf4f1ea, "700"));
    name.anchor.set(0.5, 0);
    name.x = SIZE / 2;
    name.y = 41;
    tile.addChild(name);

    var scorePlate = new PIXI.Graphics();
    scorePlate.beginFill(0x10131a, 0.72);
    scorePlate.drawRoundedRect(10, 51, SIZE - 20, 11, 4);
    scorePlate.endFill();
    tile.addChild(scorePlate);

    var score = new PIXI.Text(String(item.score), textStyle(8, 0xffd76a, "800"));
    score.anchor.set(0.5, 0);
    score.x = SIZE / 2;
    score.y = 51;
    tile.addChild(score);

    var levelPlate = new PIXI.Graphics();
    levelPlate.beginFill(tier.fill);
    levelPlate.drawRoundedRect(3, 3, 12, 10, 3);
    levelPlate.endFill();
    tile.addChild(levelPlate);
    var levelText = new PIXI.Text(String(item.level), textStyle(7, tier.text, "800"));
    levelText.anchor.set(0.5);
    levelText.x = 9;
    levelText.y = 8;
    tile.addChild(levelText);

    tile.on("pointertap", function () { onTile(item); });
    if (sparkIds[item.id]) {
      playBirth(tile, sparkIds[item.id]);
      delete sparkIds[item.id];
    }
    return tile;
  }

  function playBirth(tile, level) {
    var color = SPARK[level] || 0x6aa6ff;
    var fx = new PIXI.Graphics();
    tile.addChild(fx);
    var bornAt = performance.now();
    var sparks = [];
    for (var i = 0; i < 10; i++) {
      sparks.push({
        ang: Math.random() * Math.PI * 2,
        dist: 18 + Math.random() * 28,
        size: 1.5 + Math.random() * 1.8
      });
    }
    function tick() {
      if (tile.destroyed) {
        app.ticker.remove(tick);
        return;
      }
      var t = (performance.now() - bornAt) / 800;
      fx.clear();
      if (t >= 1) {
        app.ticker.remove(tick);
        if (!fx.destroyed) {
          tile.removeChild(fx);
          fx.destroy();
        }
        return;
      }
      var fade = 1 - t;
      var cx = SIZE / 2;
      var cy = 22;
      fx.lineStyle(4 * fade, color, fade);
      fx.drawCircle(cx, cy, 14 + t * 38);
      fx.lineStyle(2 * fade, 0xfff6c8, fade * 0.85);
      fx.drawCircle(cx, cy, 8 + t * 20);
      for (var s = 0; s < sparks.length; s++) {
        var sp = sparks[s];
        fx.beginFill(t < 0.4 ? 0xffffff : color, fade);
        fx.drawCircle(cx + Math.cos(sp.ang) * sp.dist * t, cy + Math.sin(sp.ang) * sp.dist * t, sp.size);
        fx.endFill();
      }
    }
    app.ticker.add(tick);
  }

  function renderBoard() {
    if (!app) return;
    var width = Math.max(320, boardHost.clientWidth);
    var list = sortedItems();
    emptyEl.hidden = list.length > 0;
    board.removeChildren().forEach(function (child) {
      child.destroy({ children: true });
    });
    if (!list.length) {
      app.renderer.resize(width, 180);
      return;
    }
    var cols = Math.max(1, Math.floor((width + GAP) / (SIZE + GAP)));
    for (var i = 0; i < list.length; i++) {
      var tile = makeTile(list[i]);
      tile.x = (i % cols) * (SIZE + GAP);
      tile.y = Math.floor(i / cols) * (SIZE + GAP);
      board.addChild(tile);
    }
    var rows = Math.ceil(list.length / cols);
    app.renderer.resize(width, rows * (SIZE + GAP) - GAP);
  }

  function render() {
    renderCount();
    renderDetail();
    renderBoard();
  }

  function boot() {
    app = new PIXI.Application({
      width: 640,
      height: 180,
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true
    });
    boardHost.appendChild(app.view);
    board = new PIXI.Container();
    app.stage.addChild(board);
    render();
  }

  document.getElementById("tip-backdrop").onclick = closeTip;
  document.getElementById("tip-close").onclick = closeTip;

  document.getElementById("gen1").onclick = function () { generate(1); };
  document.getElementById("gen10").onclick = function () { generate(10); };
  document.getElementById("gen100").onclick = function () { generate(100); };
  document.getElementById("craft-all").onclick = craftEverything;
  document.getElementById("clear-all").onclick = function () {
    if (!items.length) return;
    if (!window.confirm("清空当前全部装备？")) return;
    items = [];
    focusId = 0;
    pushLog("已清空");
    setStatus("已清空");
    render();
  };

  window.addEventListener("resize", function () { renderBoard(); });
  boot();
})();
