(function () {
  var SIZE = 136;
  var GAP = 12;
  var items = [];
  var selected = {};
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
  var craftBtn = document.getElementById("craft");
  var partSel = document.getElementById("part");

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

  function selectedItems() {
    var list = [];
    for (var id in selected) {
      var item = byId(Number(id));
      if (item) list.push(item);
    }
    return list;
  }

  function selectionIndex(id) {
    var n = 1;
    for (var key in selected) {
      if (Number(key) === id) return n;
      n++;
    }
    return 0;
  }

  function sortedItems() {
    return items.slice().sort(function (a, b) {
      return b.score - a.score || b.level - a.level || a.id - b.id;
    });
  }

  function pickPart() {
    var value = Number(partSel.value);
    if (value >= 1 && value <= 4) return value;
    return 1 + Math.floor(Math.random() * 4);
  }

  function bestOf(list) {
    var best = list[0];
    for (var i = 1; i < list.length; i++) {
      if (list[i].score > best.score) best = list[i];
    }
    return best;
  }

  function generate(n) {
    var batch = [];
    for (var i = 0; i < n; i++) {
      var item = PetSim.roll(pickPart(), 1);
      items.push(item);
      batch.push(item);
    }
    born += n;
    focusId = bestOf(batch).id;
    bumpBorn();
    pushLog("生成 " + n + " 件 1 级装备");
    setStatus("已生成 " + n + " 件 1 级装备");
    render();
  }

  function craftMessage(mats) {
    return "3 件 " + mats[0].level + " 级" + PetSim.partName(mats[0].part);
  }

  function craftSelected() {
    var mats = selectedItems();
    if (mats.length !== 3) {
      setStatus("请选择 3 件同等级、同部位的装备");
      return;
    }
    var part = mats[0].part;
    var level = mats[0].level;
    for (var i = 1; i < mats.length; i++) {
      if (mats[i].part !== part || mats[i].level !== level) {
        setStatus("这 3 件不是同等级、同部位");
        return;
      }
    }
    if (level >= 5) {
      setStatus("五级不能再合成升级");
      return;
    }
    var rate = PetSim.craftRate(level);
    var used = {};
    for (var j = 0; j < mats.length; j++) used[mats[j].id] = true;
    items = items.filter(function (it) { return !used[it.id]; });
    selected = {};
    var pct = Math.round(rate * 100);
    if (Math.random() < rate) {
      var made = PetSim.roll(part, level + 1);
      items.push(made);
      focusId = made.id;
      pushLog("合成成功（" + pct + "%）：" + craftMessage(mats) + " → " + PetSim.itemName(made.part, made.level) + " 评分 " + made.score);
      setStatus("合成成功，得到 " + PetSim.itemName(made.part, made.level) + "，评分 " + made.score);
    } else {
      if (used[focusId]) focusId = 0;
      pushLog("合成失败（" + pct + "%）：" + craftMessage(mats) + " 已消耗");
      setStatus("合成失败，3 件材料已消耗");
    }
    render();
  }

  function craftEverything() {
    var result = PetSim.craftAll(items);
    items = result.items;
    var still = {};
    for (var id in selected) {
      if (byId(Number(id))) still[id] = true;
    }
    selected = still;
    if (focusId && !byId(focusId)) focusId = 0;
    pushLog("一键合成：成功 " + result.success + "，失败 " + result.fail);
    setStatus("一键合成结束。成功 " + result.success + "，失败 " + result.fail);
    render();
  }

  function onTile(item) {
    focusId = item.id;
    if (selected[item.id]) {
      delete selected[item.id];
      setStatus("已取消选择");
      render();
      return;
    }
    var chosen = selectedItems();
    if (chosen.length >= 3) {
      setStatus("最多选择 3 件");
      render();
      return;
    }
    if (item.level >= 5) {
      setStatus("五级不能再合成升级，仍可查看属性");
      render();
      return;
    }
    if (chosen.length && (chosen[0].part !== item.part || chosen[0].level !== item.level)) {
      setStatus("要和已选装备同等级、同部位");
      render();
      return;
    }
    selected[item.id] = true;
    var n = chosen.length + 1;
    if (n === 3) {
      setStatus("已选 3 件 " + item.level + " 级" + PetSim.partName(item.part) + "，成功率 " + Math.round(PetSim.craftRate(item.level) * 100) + "%");
    } else {
      setStatus("已选 " + n + " / 3");
    }
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
    return (line.value - line.min) / (line.max - line.min);
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

  function emptyDetail() {
    detailEl.innerHTML = "<div class=\"item-card is-empty\"><p class=\"empty-copy\">点一件装备。<br>右边展开词条、区间和评分，方便直接截图。</p></div>";
  }

  function renderDetail() {
    var item = focusId ? byId(focusId) : null;
    if (!item) {
      emptyDetail();
      return;
    }
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
      html += "<div class=\"affix-range\">" + line.min + " – " + line.max + " · 词条 " + Math.round(p * 100) + "%</div></li>";
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
    var chosen = selectedItems();
    bits.push("已选 " + chosen.length + "/3");
    countEl.textContent = bits.join("  ·  ");
    var ready = chosen.length === 3 && chosen[0].level < 5;
    craftBtn.disabled = !ready;
    craftBtn.textContent = ready
      ? "合成选中（" + Math.round(PetSim.craftRate(chosen[0].level) * 100) + "%）"
      : "合成选中";
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
    if (!texCache[key]) texCache[key] = PIXI.Texture.from(PetIcons.canvas(part, level, 192));
    return texCache[key];
  }

  function makeTile(item) {
    var tier = PetSim.tier(item.level);
    var tile = new PIXI.Container();
    tile.eventMode = "static";
    tile.cursor = "pointer";
    var focused = item.id === focusId;
    var picked = !!selected[item.id];
    var g = new PIXI.Graphics();
    var stroke = picked ? 0xffd76a : (focused ? 0xfff1c2 : tier.stroke);
    var strokeWidth = picked ? 4 : 2;
    g.lineStyle(strokeWidth, stroke, 1);
    g.beginFill(0x161b26);
    g.drawRoundedRect(strokeWidth / 2, strokeWidth / 2, SIZE - strokeWidth, SIZE - strokeWidth, 14);
    g.endFill();
    g.lineStyle(0);
    g.beginFill(tier.fill);
    g.drawRoundedRect(12, 8, SIZE - 24, 4, 2);
    g.endFill();
    tile.addChild(g);

    var icon = new PIXI.Sprite(iconTexture(item.part, item.level));
    icon.width = 78;
    icon.height = 78;
    icon.x = (SIZE - 78) / 2;
    icon.y = 14;
    tile.addChild(icon);

    var name = new PIXI.Text(PetSim.itemName(item.part, item.level), textStyle(14, 0xf4f1ea, "700"));
    name.anchor.set(0.5, 0);
    name.x = SIZE / 2;
    name.y = 92;
    tile.addChild(name);

    var scorePlate = new PIXI.Graphics();
    scorePlate.beginFill(0x10131a, 0.72);
    scorePlate.drawRoundedRect(28, 112, SIZE - 56, 18, 8);
    scorePlate.endFill();
    tile.addChild(scorePlate);

    var score = new PIXI.Text(String(item.score), textStyle(15, 0xffd76a, "800"));
    score.anchor.set(0.5, 0);
    score.x = SIZE / 2;
    score.y = 112;
    tile.addChild(score);

    var levelPlate = new PIXI.Graphics();
    levelPlate.beginFill(tier.fill);
    levelPlate.drawRoundedRect(8, 16, 28, 16, 6);
    levelPlate.endFill();
    tile.addChild(levelPlate);
    var levelText = new PIXI.Text(String(item.level), textStyle(12, tier.text, "800"));
    levelText.anchor.set(0.5);
    levelText.x = 22;
    levelText.y = 24;
    tile.addChild(levelText);

    var order = selectionIndex(item.id);
    if (order) {
      var badge = new PIXI.Graphics();
      badge.beginFill(0xffd76a);
      badge.drawCircle(SIZE - 16, 20, 10);
      badge.endFill();
      tile.addChild(badge);
      var orderText = new PIXI.Text(String(order), textStyle(12, 0x2a220c, "800"));
      orderText.anchor.set(0.5);
      orderText.x = SIZE - 16;
      orderText.y = 20;
      tile.addChild(orderText);
    }

    tile.on("pointertap", function () { onTile(item); });
    return tile;
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
    emptyDetail();
    render();
  }

  document.getElementById("gen1").onclick = function () { generate(1); };
  document.getElementById("gen10").onclick = function () { generate(10); };
  document.getElementById("gen100").onclick = function () { generate(100); };
  craftBtn.onclick = craftSelected;
  document.getElementById("craft-all").onclick = craftEverything;
  document.getElementById("clear-select").onclick = function () {
    selected = {};
    setStatus("已取消选择");
    render();
  };
  document.getElementById("clear-all").onclick = function () {
    if (!items.length) return;
    if (!window.confirm("清空当前全部装备？")) return;
    items = [];
    selected = {};
    focusId = 0;
    pushLog("已清空");
    setStatus("已清空");
    render();
  };

  window.addEventListener("resize", function () { renderBoard(); });
  boot();
})();
