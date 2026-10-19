(function (root) {
  var cache = {};
  var GLOW = {
    1: "rgba(244,244,244,0.20)",
    2: "rgba(80,190,110,0.28)",
    3: "rgba(90,150,255,0.30)",
    4: "rgba(176,120,255,0.32)",
    5: "rgba(255,160,60,0.34)"
  };
  var LOOK = {
    1: {
      1: { hi: "#f6e6cc", base: "#c99562", mid: "#8d5a32", edge: "#5a3920", gem: "#fff4e2" },
      2: { hi: "#eef3f8", base: "#8d9bab", mid: "#5e6c7c", edge: "#323a46", gem: "#d5dee8" },
      3: { hi: "#ffffff", base: "#c5d4e6", mid: "#7e97b6", edge: "#41556e", gem: "#eaf3ff" },
      4: { hi: "#f6eeff", base: "#b894ee", mid: "#7354b8", edge: "#3c2770", gem: "#e4c6ff" },
      5: { hi: "#fff3cf", base: "#f0a33a", mid: "#c46a12", edge: "#6e3408", gem: "#ff4b3e" }
    },
    2: {
      1: { hi: "#f8ead4", base: "#d2aa74", mid: "#a3733f", edge: "#624422", gem: "#fff6e8" },
      2: { hi: "#e8eef5", base: "#9aa8b8", mid: "#667588", edge: "#39424e", gem: "#dce6f0" },
      3: { hi: "#f7fafc", base: "#b9cbe0", mid: "#6e8aab", edge: "#31445c", gem: "#ffffff" },
      4: { hi: "#f8f4ff", base: "#c4aaef", mid: "#7d5cc0", edge: "#432d78", gem: "#ead4ff" },
      5: { hi: "#ffe8b4", base: "#e8882a", mid: "#b45312", edge: "#5c2a0c", gem: "#8dffb0" }
    },
    3: {
      1: { hi: "#fffaf2", base: "#e6d2b0", mid: "#b89a70", edge: "#746046", gem: "#fffdf8" },
      2: { hi: "#eef2f6", base: "#8b98a8", mid: "#596678", edge: "#2f3844", gem: "#d8e0ea" },
      3: { hi: "#ffffff", base: "#d5e0ee", mid: "#8aa4c4", edge: "#4a627e", gem: "#f4f8ff" },
      4: { hi: "#f7f3ff", base: "#cbb6f4", mid: "#8060c4", edge: "#46307a", gem: "#f0e4ff" },
      5: { hi: "#fff6d8", base: "#ffb84a", mid: "#d47820", edge: "#7a3c10", gem: "#7ef0ff" }
    },
    4: {
      1: { hi: "#ffe0b8", base: "#e09448", mid: "#b56528", edge: "#6e3814", gem: "#ffe7c8" },
      2: { hi: "#e8eef4", base: "#909eae", mid: "#5c6a7a", edge: "#343e4a", gem: "#dce4ee" },
      3: { hi: "#ffffff", base: "#d0dced", mid: "#849cb8", edge: "#45586e", gem: "#f7fbff" },
      4: { hi: "#f6f0ff", base: "#c2a6f0", mid: "#7858bc", edge: "#412c74", gem: "#eadcff" },
      5: { hi: "#fff1cc", base: "#f0a030", mid: "#c86418", edge: "#6a300c", gem: "#ff5a3c" }
    }
  };

  function ellipse(ctx, x, y, rx, ry) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  }

  function round(ctx, x, y, w, h, r) {
    var rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function metal(ctx, m, x0, y0, x1, y1) {
    var g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, m.hi);
    g.addColorStop(0.42, m.base);
    g.addColorStop(1, m.edge);
    return g;
  }

  function gem(ctx, x, y, r, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.82, 0);
    ctx.lineTo(0, r * 1.05);
    ctx.lineTo(-r * 0.82, 0);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.55);
    ctx.lineTo(r * 0.22, -r * 0.05);
    ctx.lineTo(0, r * 0.28);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function shadow(ctx, y) {
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ellipse(ctx, 50, y, 22, 5.5);
    ctx.fill();
  }

  function rivets(ctx, m, points) {
    for (var i = 0; i < points.length; i++) {
      ctx.fillStyle = m.hi;
      ellipse(ctx, points[i][0], points[i][1], 2.1, 2.1);
      ctx.fill();
      ctx.fillStyle = m.edge;
      ellipse(ctx, points[i][0], points[i][1], 0.9, 0.9);
      ctx.fill();
    }
  }

  function drawCollar(ctx, m, level) {
    shadow(ctx, 84);
    if (level === 5) {
      ctx.fillStyle = m.edge;
      ctx.beginPath();
      ctx.moveTo(30, 42);
      ctx.lineTo(22, 16);
      ctx.lineTo(40, 36);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(70, 42);
      ctx.lineTo(78, 16);
      ctx.lineTo(60, 36);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = m.base;
      ctx.beginPath();
      ctx.moveTo(31, 40);
      ctx.lineTo(26, 20);
      ctx.lineTo(38, 36);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(69, 40);
      ctx.lineTo(74, 20);
      ctx.lineTo(62, 36);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = metal(ctx, m, 18, 28, 82, 80);
    ellipse(ctx, 50, 54, 32, 20);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = m.edge;
    ctx.stroke();

    ctx.fillStyle = "#141820";
    ellipse(ctx, 50, 55, 17, 9.5);
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = m.mid;
    ellipse(ctx, 50, 55, 17, 9.5);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(48, 48, 24, 12, -0.15, Math.PI * 1.15, Math.PI * 1.75);
    ctx.stroke();

    round(ctx, 66, 44, 16, 16, 3);
    ctx.fillStyle = m.hi;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = m.edge;
    ctx.stroke();
    round(ctx, 71, 47, 4, 10, 1);
    ctx.fillStyle = m.edge;
    ctx.fill();
    ctx.fillStyle = "#141820";
    ellipse(ctx, 70, 52, 1.5, 1.5);
    ctx.fill();

    ctx.fillStyle = m.edge;
    ellipse(ctx, 34, 47, 1.7, 1.7);
    ctx.fill();
    ellipse(ctx, 42, 43, 1.7, 1.7);
    ctx.fill();

    if (level === 1) {
      ctx.save();
      ctx.strokeStyle = "rgba(255,248,236,0.85)";
      ctx.lineWidth = 1.3;
      ctx.setLineDash([2.2, 3.1]);
      ellipse(ctx, 50, 54, 25, 14.5);
      ctx.stroke();
      ctx.restore();
    } else {
      rivets(ctx, m, [[30, 62], [50, 70], [58, 66], [26, 52]]);
    }
    if (level >= 4) gem(ctx, 50, 68, level === 5 ? 5.2 : 4, m.gem);
  }

  function drawArmor(ctx, m, level) {
    shadow(ctx, 90);
    ctx.fillStyle = metal(ctx, m, 12, 18, 40, 44);
    round(ctx, 12, 24, 24, 16, 7);
    ctx.fill();
    ctx.fillStyle = metal(ctx, m, 64, 18, 90, 44);
    round(ctx, 64, 24, 24, 16, 7);
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = m.edge;
    round(ctx, 12, 24, 24, 16, 7);
    ctx.stroke();
    round(ctx, 64, 24, 24, 16, 7);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(32, 30);
    ctx.lineTo(68, 30);
    ctx.quadraticCurveTo(82, 50, 72, 76);
    ctx.quadraticCurveTo(50, 90, 28, 76);
    ctx.quadraticCurveTo(18, 50, 32, 30);
    ctx.closePath();
    ctx.fillStyle = metal(ctx, m, 24, 24, 76, 90);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = m.edge;
    ctx.stroke();

    ctx.fillStyle = "#141820";
    ctx.beginPath();
    ctx.ellipse(50, 32, 11, 7, 0, 0, Math.PI, true);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.38)";
    round(ctx, 47, 38, 6, 26, 3);
    ctx.fill();

    if (level === 1) {
      ctx.strokeStyle = m.edge;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(38, 42);
      ctx.lineTo(64, 70);
      ctx.moveTo(62, 42);
      ctx.lineTo(36, 70);
      ctx.stroke();
    } else if (level === 5) {
      ctx.save();
      ctx.strokeStyle = m.gem;
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = 1.5;
      var row, col;
      for (row = 0; row < 3; row++) {
        for (col = 0; col < 3; col++) {
          var x = 36 + col * 10 + (row % 2) * 4;
          var y = 48 + row * 9;
          ctx.beginPath();
          ctx.arc(x, y, 5.5, 0.1 * Math.PI, 0.9 * Math.PI);
          ctx.stroke();
        }
      }
      ctx.restore();
      gem(ctx, 50, 44, 4.2, m.gem);
    } else {
      ctx.save();
      ctx.globalAlpha = 0.75;
      ctx.strokeStyle = m.edge;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(30, 52);
      ctx.lineTo(70, 52);
      ctx.moveTo(32, 64);
      ctx.lineTo(68, 64);
      ctx.stroke();
      ctx.restore();
      if (level === 3) {
        ctx.strokeStyle = m.hi;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(34, 36);
        ctx.lineTo(66, 36);
        ctx.stroke();
      }
      if (level === 4) gem(ctx, 50, 58, 4.6, m.gem);
    }
    rivets(ctx, m, [[24, 32], [76, 32]]);
  }

  function pendantBody(ctx, m, level) {
    if (level === 1) {
      ctx.fillStyle = metal(ctx, m, 34, 36, 66, 84);
      ctx.beginPath();
      ctx.moveTo(50, 38);
      ctx.bezierCurveTo(66, 42, 64, 70, 50, 82);
      ctx.bezierCurveTo(36, 70, 34, 42, 50, 38);
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = m.edge;
      ctx.stroke();
      ctx.fillStyle = m.hi;
      ellipse(ctx, 42, 46, 5, 4);
      ctx.fill();
      ellipse(ctx, 58, 46, 5, 4);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ellipse(ctx, 44, 58, 3, 6);
      ctx.fill();
      return;
    }
    if (level === 2) {
      round(ctx, 34, 40, 32, 38, 5);
      ctx.fillStyle = metal(ctx, m, 34, 40, 66, 78);
      ctx.fill();
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = m.edge;
      ctx.stroke();
      ctx.strokeStyle = m.hi;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(50, 48);
      ctx.lineTo(42, 60);
      ctx.lineTo(50, 70);
      ctx.lineTo(58, 60);
      ctx.closePath();
      ctx.stroke();
      return;
    }
    if (level === 3) {
      ctx.fillStyle = metal(ctx, m, 32, 38, 70, 82);
      ellipse(ctx, 50, 60, 18, 18);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = m.edge;
      ctx.stroke();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = m.hi;
      ellipse(ctx, 50, 60, 11, 11);
      ctx.stroke();
      ctx.fillStyle = m.gem;
      ellipse(ctx, 50, 60, 3.2, 3.2);
      ctx.fill();
      return;
    }
    if (level === 4) {
      ctx.beginPath();
      ctx.moveTo(50, 36);
      ctx.lineTo(70, 60);
      ctx.lineTo(50, 84);
      ctx.lineTo(30, 60);
      ctx.closePath();
      ctx.fillStyle = metal(ctx, m, 30, 36, 70, 84);
      ctx.fill();
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = m.edge;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(50, 46);
      ctx.lineTo(60, 60);
      ctx.lineTo(50, 74);
      ctx.lineTo(40, 60);
      ctx.closePath();
      ctx.strokeStyle = m.hi;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      gem(ctx, 50, 60, 3.4, m.gem);
      return;
    }
    ctx.save();
    ctx.shadowColor = m.gem;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(50, 34);
    ctx.lineTo(68, 52);
    ctx.lineTo(58, 84);
    ctx.lineTo(42, 84);
    ctx.lineTo(32, 52);
    ctx.closePath();
    var g = ctx.createLinearGradient(32, 34, 68, 84);
    g.addColorStop(0, m.hi);
    g.addColorStop(0.45, m.gem);
    g.addColorStop(1, m.edge);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(50, 40);
    ctx.lineTo(58, 54);
    ctx.lineTo(50, 74);
    ctx.lineTo(46, 54);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawAmulet(ctx, m, level) {
    shadow(ctx, 90);
    ctx.lineCap = "round";
    ctx.strokeStyle = m.mid;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(22, 14);
    ctx.quadraticCurveTo(50, 42, 78, 14);
    ctx.stroke();
    ctx.strokeStyle = m.hi;
    ctx.lineWidth = 1.4;
    [[34, 22], [50, 30], [66, 22]].forEach(function (p) {
      ctx.beginPath();
      ctx.ellipse(p[0], p[1], 3.3, 2.2, 0.4, 0, Math.PI * 2);
      ctx.stroke();
    });
    round(ctx, 46, 34, 8, 8, 2);
    ctx.fillStyle = m.edge;
    ctx.fill();
    pendantBody(ctx, m, level);
  }

  function drawBell(ctx, m, level) {
    shadow(ctx, 90);
    if (level === 5) {
      var flame = ctx.createLinearGradient(50, 2, 50, 22);
      flame.addColorStop(0, "#fff1c4");
      flame.addColorStop(0.45, m.gem);
      flame.addColorStop(1, m.base);
      ctx.fillStyle = flame;
      ctx.beginPath();
      ctx.moveTo(50, 2);
      ctx.bezierCurveTo(62, 12, 58, 20, 50, 22);
      ctx.bezierCurveTo(42, 20, 38, 12, 50, 2);
      ctx.fill();
    }
    ctx.strokeStyle = m.edge;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(50, 18, 6.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(50, 24);
    ctx.lineTo(50, 32);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(37, 36);
    ctx.bezierCurveTo(34, 52, 24, 64, 20, 72);
    ctx.lineTo(80, 72);
    ctx.bezierCurveTo(76, 64, 66, 52, 63, 36);
    ctx.quadraticCurveTo(50, 26, 37, 36);
    ctx.closePath();
    ctx.fillStyle = metal(ctx, m, 24, 28, 78, 78);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = m.edge;
    ctx.stroke();

    round(ctx, 18, 68, 64, 8, 3);
    ctx.fillStyle = m.edge;
    ctx.fill();
    round(ctx, 22, 70, 56, 3, 1.5);
    ctx.fillStyle = m.hi;
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(40, 42);
    ctx.quadraticCurveTo(37, 56, 34, 66);
    ctx.stroke();

    ctx.strokeStyle = "#141820";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(50, 68);
    ctx.stroke();

    ctx.fillStyle = m.edge;
    ellipse(ctx, 50, 80, 4.2, 4.2);
    ctx.fill();
    ctx.fillStyle = m.hi;
    ellipse(ctx, 48.6, 78.6, 1.5, 1.5);
    ctx.fill();

    if (level === 4) gem(ctx, 50, 48, 3.6, m.gem);
  }

  function paint(ctx, part, level) {
    var m = LOOK[part][level];
    var glow = ctx.createRadialGradient(50, 46, 6, 50, 52, 48);
    glow.addColorStop(0, GLOW[level]);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.clearRect(0, 0, 100, 100);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(50, 50, 48, 0, Math.PI * 2);
    ctx.fill();
    if (part === 1) drawCollar(ctx, m, level);
    else if (part === 2) drawArmor(ctx, m, level);
    else if (part === 3) drawAmulet(ctx, m, level);
    else drawBell(ctx, m, level);
  }

  function canvas(part, level, size) {
    var key = part + ":" + level + ":" + size;
    if (cache[key]) return cache[key];
    var board = document.createElement("canvas");
    board.width = size;
    board.height = size;
    var ctx = board.getContext("2d");
    ctx.scale(size / 100, size / 100);
    paint(ctx, part, level);
    cache[key] = board;
    return board;
  }

  var urls = {};
  function url(part, level) {
    var key = part + ":" + level;
    if (!urls[key]) urls[key] = canvas(part, level, 192).toDataURL("image/png");
    return urls[key];
  }

  root.PetIcons = { canvas: canvas, url: url };
})(typeof window !== "undefined" ? window : globalThis);
