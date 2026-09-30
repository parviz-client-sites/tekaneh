(function () {
  "use strict";

  /* فیلتر برنامه‌ها (صفحه‌ی برنامه‌ها) */
  var filter = document.querySelector("[data-filter]");
  if (filter) {
    var cards = document.querySelectorAll("[data-status]");
    var buttons = filter.querySelectorAll("button");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var want = btn.getAttribute("data-value");
        buttons.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
        cards.forEach(function (c) {
          c.hidden = want !== "all" && c.getAttribute("data-status") !== want;
        });
      });
    });
  }

  /* جست‌وجوی پایگاه دانش */
  var box = document.getElementById("q");
  var out = document.getElementById("results");
  if (box && out && window.TK_INDEX) {
    var root = box.getAttribute("data-root") || "";
    /* نرمال‌سازی نویسه‌به‌نویسه تا موقعیت‌ها به متن اصلی برگردند */
    var nc = function (ch) {
      if (ch === "ي" || ch === "ى") return "ی";
      if (ch === "ك") return "ک";
      if (ch === "\u200c" || ch === "\u0640" || (ch >= "\u064b" && ch <= "\u065f")) return "";
      if (ch >= "۰" && ch <= "۹") return String(ch.charCodeAt(0) - 1776);
      if (ch >= "٠" && ch <= "٩") return String(ch.charCodeAt(0) - 1632);
      return ch.toLowerCase();
    };
    var normMap = function (s) {
      var n = "", map = [];
      for (var i = 0; i < s.length; i++) {
        var c = nc(s.charAt(i));
        for (var j = 0; j < c.length; j++) { n += c.charAt(j); map.push(i); }
      }
      return { n: n, map: map };
    };
    var esc = function (s) {
      return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
    };
    var data = window.TK_INDEX.map(function (e) {
      var x = normMap(e.x);
      return { t: e.t, d: e.d, u: e.u, x: e.x, nt: normMap(e.t).n, nx: x.n, map: x.map };
    });
    var render = function () {
      var q = normMap(box.value.trim()).n;
      if (q.length < 2) { out.innerHTML = ""; return; }
      var hits = [];
      data.forEach(function (e) {
        var inT = e.nt.indexOf(q), inX = e.nx.indexOf(q);
        if (inT < 0 && inX < 0) return;
        hits.push({ e: e, score: (inT >= 0 ? 2 : 0) + (inX >= 0 ? 1 : 0), pos: inX });
      });
      hits.sort(function (a, b) { return b.score - a.score; });
      if (!hits.length) { out.innerHTML = "<li><p>نتیجه‌ای پیدا نشد. عبارت کوتاه‌تر یا مترادف آن را امتحان کنید.</p></li>"; return; }
      out.innerHTML = hits.slice(0, 8).map(function (h) {
        var snippet = "";
        if (h.pos >= 0) {
          var a0 = h.e.map[h.pos], a1 = h.e.map[h.pos + q.length - 1] + 1;
          var s0 = Math.max(0, a0 - 60), s1 = Math.min(h.e.x.length, a1 + 90);
          snippet = "<p>" + (s0 > 0 ? "… " : "") + esc(h.e.x.slice(s0, a0)) + "<mark>" + esc(h.e.x.slice(a0, a1)) + "</mark>" + esc(h.e.x.slice(a1, s1)) + (s1 < h.e.x.length ? " …" : "") + "</p>";
        }
        return '<li><span class="doc-name">' + esc(h.e.d) + '</span><br><a href="' + root + h.e.u + '">' + esc(h.e.t) + "</a>" + snippet + "</li>";
      }).join("");
    };
    box.addEventListener("input", render);
  }

  /* پیوندهای قدیمیِ نسخه‌ی تک‌صفحه‌ای (فقط صفحه‌ی اصلی) */
  if (document.body.hasAttribute("data-home") && location.hash) {
    var h = location.hash.slice(1);
    var map = {
      cover: "knowledge/paradigm/", toc: "knowledge/paradigm/", close: "knowledge/paradigm/",
      problem: "knowledge/paradigm/problem/", principles: "knowledge/paradigm/principles/"
    };
    var m = /^r([1-9])$/.exec(h);
    if (m) { location.replace("knowledge/paradigm/references/#r" + m[1]); }
    else if (map[h]) { location.replace(map[h]); }
  }
})();
