(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var narrow = window.matchMedia("(max-width: 760px)");
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  function t(pt, en) {
    return '<span lang="pt">' + pt + '</span><span lang="en">' + en + "</span>";
  }

  /* ------------------------------------------------------------------ */
  /* Workflows: each mirrors a real project. Kinds: auto, ai, human.     */
  /* ------------------------------------------------------------------ */
  function stack(ids) {
    return { cols: "minmax(0, 1fr)", areas: ids.map(function (id) { return '"' + id + '"'; }).join(" ") };
  }

  var FLOWS = [
    {
      id: "guias", file: "guias-judiciais",
      tab: ["Guias com IA", "AI payment slips"],
      title: ["Guias judiciais lidas pelo Google Gemini", "Court payment slips read by Google Gemini"],
      where: ["RecargaPay / Contas a Pagar", "RecargaPay / Accounts Payable"],
      metric: ["25&nbsp;h/mês", "25&nbsp;h/month"],
      nodes: [
        { id: "in", kind: "auto", label: ["Guia ou boleto chega", "Payment slip arrives"] },
        { id: "gem", kind: "ai", label: ["Gemini extrai os campos", "Gemini extracts the fields"] },
        { id: "reg", kind: "auto", label: ["Campos registrados no n8n", "Fields recorded in n8n"] },
        { id: "ok", kind: "human", label: ["Analista aprova ou rejeita", "Analyst approves or rejects"] },
        { id: "out", kind: "auto", label: ["Histórico atualizado", "History updated"] }
      ],
      edges: [["in", "gem"], ["gem", "reg"], ["reg", "ok"], ["ok", "out"]],
      desktop: { cols: "repeat(5, minmax(0, 1fr))", areas: '"in gem reg ok out"' },
      result: ["300 guias por mês, com raros erros de extração e rastreabilidade completa.", "300 slips a month, with rare extraction errors and full traceability."]
    },
    {
      id: "subsidios", file: "gerador-subsidios",
      tab: ["Subsídios jurídicos", "Legal reports"],
      title: ["Gerador de Subsídios", "Legal evidence report generator"],
      where: ["RecargaPay / Jurídico", "RecargaPay / Legal"],
      metric: ["100&nbsp;h/mês", "100&nbsp;h/month"],
      nodes: [
        { id: "req", kind: "human", label: ["Analista faz o pedido", "Analyst submits a request"] },
        { id: "db", kind: "auto", label: ["Python e Databricks buscam a conta", "Python and Databricks fetch the account"] },
        { id: "pdf", kind: "auto", label: ["PDF do relatório gerado", "Report PDF generated"] },
        { id: "drive", kind: "auto", label: ["Salvo no Google Drive", "Saved to Google Drive"] },
        { id: "slack", kind: "auto", label: ["Aviso no Slack", "Slack notice"] }
      ],
      edges: [["req", "db"], ["db", "pdf"], ["pdf", "drive"], ["pdf", "slack"]],
      desktop: { cols: "repeat(4, minmax(0, 1fr))", areas: '"req db pdf drive" "req db pdf slack"' },
      mobile: { cols: "repeat(2, minmax(0, 1fr))", areas: '"req req" "db db" "pdf pdf" "drive slack"' },
      result: ["Mais de 1.500 relatórios em um ano para 10 usuários do Jurídico.", "More than 1,500 reports in one year for 10 Legal users."]
    },
    {
      id: "negativacao", file: "negativacao-diaria",
      tab: ["Negativação", "Credit reporting"],
      title: ["Negativação automática de clientes", "Automated credit bureau reporting"],
      where: ["RecargaPay / Credit &amp; Collections", "RecargaPay / Credit &amp; Collections"],
      metric: ["2.000/dia", "2,000/day"],
      nodes: [
        { id: "cron", kind: "auto", label: ["Job diário no Databricks", "Daily Databricks job"] },
        { id: "delta", kind: "auto", label: ["Delta Tables com os clientes do dia", "Delta Tables with the day’s customers"] },
        { id: "api", kind: "auto", label: ["API da Boa Vista (SCPC)", "Boa Vista (SCPC) API"] },
        { id: "log", kind: "auto", label: ["Logs e alerta no Slack", "Logs and Slack alert"] }
      ],
      edges: [["cron", "delta"], ["delta", "api"], ["api", "log"]],
      desktop: { cols: "repeat(4, minmax(0, 1fr))", areas: '"cron delta api log"' },
      result: ["De semanal para diário, com mais de 60 horas/mês economizadas.", "From weekly to daily, with more than 60 hours/month saved."]
    },
    {
      id: "onboarding", file: "onboarding-rh",
      tab: ["Onboarding", "Onboarding"],
      title: ["Onboarding de funcionários", "Employee onboarding"],
      where: ["RecargaPay / RH", "RecargaPay / HR"],
      metric: ["100+", "100+"],
      nodes: [
        { id: "ta", kind: "human", label: ["Talent Acquisition envia a proposta", "Talent Acquisition sends the offer"] },
        { id: "kye", kind: "human", label: ["PLD faz o KYE", "Compliance runs KYE"] },
        { id: "pay", kind: "human", label: ["Payroll cadastra nos sistemas", "Payroll registers the hire"] },
        { id: "base", kind: "auto", label: ["Base corporativa consolidada", "Corporate records consolidated"] }
      ],
      edges: [["ta", "kye"], ["kye", "pay"], ["pay", "base"]],
      desktop: { cols: "repeat(4, minmax(0, 1fr))", areas: '"ta kye pay base"' },
      result: ["Contratações passando por um único fluxo no n8n entre três áreas.", "Hires moving through one n8n workflow across three teams."]
    },
    {
      id: "governanca", file: "governanca-ia",
      tab: ["Governança de IA", "AI governance"],
      title: ["Uso e custo das ferramentas de IA", "AI tool usage and cost"],
      where: ["RecargaPay / Governança de IA", "RecargaPay / AI governance"],
      metric: ["3 fontes", "3 sources"],
      nodes: [
        { id: "s1", kind: "auto", label: ["Netskope", "Netskope"] },
        { id: "s2", kind: "auto", label: ["Google Workspace", "Google Workspace"] },
        { id: "s3", kind: "auto", label: ["Tokens do Claude", "Claude tokens"] },
        { id: "py", kind: "auto", label: ["Python consolida os dados", "Python consolidates the data"] },
        { id: "dash", kind: "auto", label: ["Dashboard no Google Sites", "Dashboard on Google Sites"] },
        { id: "dec", kind: "human", label: ["Decisões de licença e mentoria", "License and mentoring decisions"] }
      ],
      edges: [["s1", "py"], ["s2", "py"], ["s3", "py"], ["py", "dash"], ["dash", "dec"]],
      desktop: { cols: "repeat(4, minmax(0, 1fr))", areas: '"s1 py dash dec" "s2 py dash dec" "s3 py dash dec"' },
      mobile: { cols: "repeat(2, minmax(0, 1fr))", areas: '"s1 py" "s2 py" "s3 py" "dash dash" "dec dec"' },
      result: ["Licenças inativas cortadas e ferramentas não homologadas detectadas.", "Inactive licenses cut and non-approved tools detected."]
    },
    {
      id: "chargeback", file: "rpa-chargeback",
      tab: ["Chargeback com RPA", "Chargeback RPA"],
      title: ["RPA de chargeback na América Latina", "Chargeback RPA across Latin America"],
      where: ["EBANX / Prevenção a Fraudes", "EBANX / Fraud Prevention"],
      metric: ["6&nbsp;h/dia", "6&nbsp;h/day"],
      nodes: [
        { id: "src", kind: "auto", label: ["Parceiros em 15 países", "Partners in 15 countries"] },
        { id: "ch", kind: "auto", label: ["E-mail, SFTP e portais web", "Email, SFTP and web portals"] },
        { id: "bot", kind: "auto", label: ["Robô A360 roda todo dia", "A360 bot runs daily"] },
        { id: "out", kind: "auto", label: ["Disputas tratadas no padrão", "Disputes handled to standard"] }
      ],
      edges: [["src", "ch"], ["ch", "bot"], ["bot", "out"]],
      desktop: { cols: "repeat(4, minmax(0, 1fr))", areas: '"src ch bot out"' },
      result: ["15 países integrados e mais de 2 anos em operação contínua.", "15 countries integrated and more than 2 years of continuous operation."]
    }
  ];

  function byId(id) {
    for (var i = 0; i < FLOWS.length; i++) if (FLOWS[i].id === id) return FLOWS[i];
    return FLOWS[0];
  }

  function levels(flow) {
    var lv = {};
    flow.nodes.forEach(function (n) { lv[n.id] = 0; });
    for (var pass = 0; pass < flow.nodes.length; pass++) {
      flow.edges.forEach(function (e) { lv[e[1]] = Math.max(lv[e[1]], lv[e[0]] + 1); });
    }
    return lv;
  }

  /* ------------------------------------------------------------------ */
  /* Console                                                             */
  /* ------------------------------------------------------------------ */
  var list = document.querySelector(".flow-list");
  var fileEl = document.querySelector(".console-file");
  var stateEl = document.querySelector(".run-state");
  var titleEl = document.querySelector(".flow-title");
  var whereEl = document.querySelector(".flow-where");
  var stage = document.querySelector(".stage");
  var svg = document.querySelector(".wires");
  var graph = document.querySelector(".graph");
  var logEl = document.querySelector(".log");
  var resultEl = document.querySelector(".result");
  var metricEl = document.querySelector(".result-metric");
  var resultTextEl = document.querySelector(".result-text");

  var current = FLOWS[0];
  var live = {};
  var runToken = 0;
  var started = false;

  list.innerHTML = FLOWS.map(function (f) {
    return '<button class="flow-item" type="button" aria-pressed="false" data-flow="' + f.id + '">' +
      '<span class="flow-item-title">' + t(f.tab[0], f.tab[1]) + "</span>" +
      '<span class="flow-item-meta"><span>' + f.where[0].split(" / ")[0] + '</span><span class="flow-item-metric">' + t(f.metric[0], f.metric[1]) + "</span></span>" +
      "</button>";
  }).join("");

  var STATES = {
    idle: ["pronto", "ready"],
    running: ["executando", "running"],
    done: ["concluído", "done"]
  };

  function setState(s) {
    stateEl.setAttribute("data-state", s);
    stateEl.innerHTML = t(STATES[s][0], STATES[s][1]);
  }

  function applyLayout() {
    var layout = narrow.matches
      ? (current.mobile || stack(current.nodes.map(function (n) { return n.id; })))
      : current.desktop;
    graph.style.gridTemplateColumns = layout.cols;
    graph.style.gridTemplateAreas = layout.areas;
  }

  function render(flow) {
    current = flow;
    live = {};
    fileEl.textContent = flow.file + ".flow";
    titleEl.innerHTML = t(flow.title[0], flow.title[1]);
    whereEl.innerHTML = t(flow.where[0], flow.where[1]);
    graph.innerHTML = flow.nodes.map(function (n) {
      var tag = n.kind === "ai" ? '<span class="node-tag">' + t("IA", "AI") + "</span>" : "";
      return '<div class="node node-' + n.kind + '" data-id="' + n.id + '" style="grid-area:' + n.id + '">' +
        '<span class="node-dot" aria-hidden="true"></span><span>' + t(n.label[0], n.label[1]) + "</span>" + tag + "</div>";
    }).join("");
    Array.prototype.forEach.call(list.children, function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-flow") === flow.id ? "true" : "false");
    });
    logEl.innerHTML = "";
    resultEl.classList.remove("shown");
    metricEl.innerHTML = t(flow.metric[0], flow.metric[1]);
    resultTextEl.innerHTML = t(flow.result[0], flow.result[1]);
    setState("idle");
    applyLayout();
    drawWires();
  }

  function box(id) {
    var el = graph.querySelector('[data-id="' + id + '"]');
    var s = stage.getBoundingClientRect();
    var r = el.getBoundingClientRect();
    return { l: r.left - s.left, r: r.right - s.left, t: r.top - s.top, b: r.bottom - s.top, cx: (r.left + r.right) / 2 - s.left, cy: (r.top + r.bottom) / 2 - s.top };
  }

  function wirePath(a, b) {
    var x1, y1, x2, y2, d;
    if (b.l >= a.r - 1) {
      x1 = a.r; y1 = a.cy; x2 = b.l; y2 = b.cy;
      d = Math.max(18, (x2 - x1) / 2);
      return { d: "M" + x1 + " " + y1 + " C" + (x1 + d) + " " + y1 + " " + (x2 - d) + " " + y2 + " " + x2 + " " + y2, x1: x1, y1: y1, x2: x2, y2: y2 };
    }
    x1 = a.cx; y1 = a.b; x2 = b.cx; y2 = b.t;
    d = Math.max(14, (y2 - y1) / 2);
    return { d: "M" + x1 + " " + y1 + " C" + x1 + " " + (y1 + d) + " " + x2 + " " + (y2 - d) + " " + x2 + " " + y2, x1: x1, y1: y1, x2: x2, y2: y2 };
  }

  function drawWires() {
    var s = stage.getBoundingClientRect();
    if (!s.width) return;
    svg.setAttribute("width", s.width);
    svg.setAttribute("height", s.height);
    svg.setAttribute("viewBox", "0 0 " + s.width + " " + s.height);
    svg.innerHTML = current.edges.map(function (e) {
      var p = wirePath(box(e[0]), box(e[1]));
      var key = e[0] + ">" + e[1];
      return '<path class="wire" d="' + p.d + '"/>' +
        '<path class="wire-live' + (live[key] ? " on" : "") + '" pathLength="1" data-edge="' + key + '" d="' + p.d + '"/>' +
        '<circle class="port" cx="' + p.x1 + '" cy="' + p.y1 + '" r="4"/>' +
        '<circle class="port" cx="' + p.x2 + '" cy="' + p.y2 + '" r="4"/>';
    }).join("");
  }

  function sendPacket(path) {
    if (reduceMotion.matches || !path.getTotalLength) return;
    var len = path.getTotalLength();
    var dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("r", "4.5");
    dot.setAttribute("class", "packet");
    svg.appendChild(dot);
    var t0 = performance.now(), dur = 520;
    (function step(now) {
      var k = Math.min(1, (now - t0) / dur);
      var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      var pt = path.getPointAtLength(len * e);
      dot.setAttribute("cx", pt.x);
      dot.setAttribute("cy", pt.y);
      if (k < 1) requestAnimationFrame(step);
      else if (dot.parentNode) dot.parentNode.removeChild(dot);
    })(t0);
  }

  function lightWiresInto(id) {
    current.edges.forEach(function (e) {
      if (e[1] !== id) return;
      var key = e[0] + ">" + e[1];
      live[key] = true;
      var path = svg.querySelector('[data-edge="' + key + '"]');
      if (path) { path.classList.add("on"); sendPacket(path); }
    });
  }

  function nodeEl(id) { return graph.querySelector('[data-id="' + id + '"]'); }

  function finishNode(n, index, total) {
    var el = nodeEl(n.id);
    el.classList.remove("active");
    el.classList.add("done");
    var li = document.createElement("li");
    var num = String(index + 1).padStart(2, "0") + "/" + String(total).padStart(2, "0");
    li.innerHTML = '<span class="log-n">' + num + '</span><span class="log-ok">ok</span><span>' + t(n.label[0], n.label[1]) + "</span>";
    logEl.appendChild(li);
  }

  function run() {
    started = true;
    var token = ++runToken;
    var flow = current;
    render(flow);
    var lv = levels(flow);
    var max = 0;
    Object.keys(lv).forEach(function (k) { max = Math.max(max, lv[k]); });
    var order = flow.nodes.slice().sort(function (a, b) { return lv[a.id] - lv[b.id]; });
    var count = 0;

    if (reduceMotion.matches) {
      order.forEach(function (n) { lightWiresInto(n.id); finishNode(n, count++, order.length); });
      resultEl.classList.add("shown");
      setState("done");
      return;
    }

    setState("running");
    var step = 0;
    function next() {
      if (token !== runToken) return;
      if (step > max) {
        resultEl.classList.add("shown");
        setState("done");
        return;
      }
      var here = order.filter(function (n) { return lv[n.id] === step; });
      here.forEach(function (n) { nodeEl(n.id).classList.add("active"); lightWiresInto(n.id); });
      setTimeout(function () {
        if (token !== runToken) return;
        here.forEach(function (n) { finishNode(n, count++, order.length); });
        step++;
        setTimeout(next, 240);
      }, step === 0 ? 260 : 560);
    }
    next();
  }

  // The chosen flow lives in the URL (?fluxo=id) so a link can open a specific one.
  function choose(id) {
    current = byId(id);
    try {
      var u = new URL(window.location.href);
      u.searchParams.set("fluxo", current.id);
      history.replaceState(null, "", u);
    } catch (e) {}
  }

  try {
    var fromUrl = new URL(window.location.href).searchParams.get("fluxo");
    if (fromUrl) current = byId(fromUrl);
  } catch (e) {}

  list.addEventListener("click", function (ev) {
    var b = ev.target.closest(".flow-item");
    if (b) { choose(b.getAttribute("data-flow")); run(); }
  });
  document.querySelector(".replay").addEventListener("click", run);

  narrow.addEventListener("change", function () { applyLayout(); drawWires(); });
  if ("ResizeObserver" in window) new ResizeObserver(drawWires).observe(stage);
  else window.addEventListener("resize", drawWires);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawWires);

  render(current);

  /* ------------------------------------------------------------------ */
  /* Mini flow art on project cards                                      */
  /* ------------------------------------------------------------------ */
  Array.prototype.forEach.call(document.querySelectorAll(".project"), function (card) {
    var flow = byId(card.getAttribute("data-flow"));
    var holder = card.querySelector(".mini-flow");
    if (!holder) return;
    var lv = levels(flow);
    var max = 0;
    Object.keys(lv).forEach(function (k) { max = Math.max(max, lv[k]); });
    var W = 300, H = 64, pad = 12;
    var byLevel = {};
    flow.nodes.forEach(function (n) { (byLevel[lv[n.id]] = byLevel[lv[n.id]] || []).push(n); });
    var pos = {};
    Object.keys(byLevel).forEach(function (l) {
      var group = byLevel[l];
      group.forEach(function (n, i) {
        pos[n.id] = {
          x: pad + (max ? (W - 2 * pad) * (l / max) : W / 2),
          y: H / 2 + (i - (group.length - 1) / 2) * 22
        };
      });
    });
    var out = '<svg viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="xMinYMid meet">';
    flow.edges.forEach(function (e) {
      var a = pos[e[0]], b = pos[e[1]], mx = (a.x + b.x) / 2;
      out += '<path class="mini-wire" d="M' + a.x + " " + a.y + " C" + mx + " " + a.y + " " + mx + " " + b.y + " " + b.x + " " + b.y + '"/>';
    });
    flow.nodes.forEach(function (n) {
      var p = pos[n.id];
      var cls = "mini-node" + (n.kind === "ai" ? " is-ai" : n.kind === "human" ? " is-human" : "");
      out += '<circle class="' + cls + '" cx="' + p.x + '" cy="' + p.y + '" r="' + (n.kind === "ai" ? 8 : 6) + '"/>';
    });
    holder.innerHTML = out + "</svg>";
  });

  /* ------------------------------------------------------------------ */
  /* Smooth scroll (Lenis) and anchor navigation                         */
  /* ------------------------------------------------------------------ */
  var lenis = null;
  if (window.Lenis && !reduceMotion.matches) {
    lenis = new Lenis({ lerp: 0.12 });
    if (hasGsap) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(performance.now());
    }
  }

  function goTo(target) {
    if (lenis) lenis.scrollTo(target, { offset: -90, duration: 1.2 });
    else target.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
  }

  document.addEventListener("click", function (ev) {
    if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    var a = ev.target.closest('a[href^="#"]');
    if (!a || a.classList.contains("skip")) return;
    var id = a.getAttribute("href");
    if (id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;
    ev.preventDefault();
    goTo(target);
    if (history.replaceState) history.replaceState(null, "", id);
  });

  Array.prototype.forEach.call(document.querySelectorAll(".show-flow"), function (b) {
    b.addEventListener("click", function () {
      goTo(document.getElementById("console"));
      choose(b.getAttribute("data-flow"));
      setTimeout(run, lenis ? 500 : 0);
    });
  });

  var marquee = document.querySelector(".marquee");
  var marqueeToggle = document.querySelector(".marquee-toggle");
  if (marquee && marqueeToggle) {
    marqueeToggle.addEventListener("click", function () {
      var paused = marqueeToggle.getAttribute("aria-pressed") !== "true";
      marqueeToggle.setAttribute("aria-pressed", paused ? "true" : "false");
      marquee.classList.toggle("is-paused", paused);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Language                                                            */
  /* ------------------------------------------------------------------ */
  var TITLES = { pt: "Lucas Severino | Automação, RPA e IA", en: "Lucas Severino | Automation, RPA & AI" };

  function applyLang(lang, persist) {
    root.setAttribute("data-lang", lang);
    root.lang = lang === "pt" ? "pt-BR" : "en";
    document.title = TITLES[lang];
    Array.prototype.forEach.call(document.querySelectorAll("[data-set-lang]"), function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-set-lang") === lang ? "true" : "false");
    });
    Array.prototype.forEach.call(document.querySelectorAll("img[data-alt-pt]"), function (img) {
      img.alt = img.getAttribute("data-alt-" + lang);
    });
    if (persist) { try { localStorage.setItem("lang", lang); } catch (e) {} }
    drawWires();
    if (hasGsap) ScrollTrigger.refresh();
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-set-lang]"), function (b) {
    b.addEventListener("click", function () { applyLang(b.getAttribute("data-set-lang"), true); });
  });
  applyLang(root.getAttribute("data-lang"), false);

  /* ------------------------------------------------------------------ */
  /* Small touches: clock, copy email, spotlight, nav state, marquee     */
  /* ------------------------------------------------------------------ */
  var clockFmt = null;
  try { clockFmt = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }); } catch (e) {}
  function tick() {
    if (!clockFmt) return;
    var s = clockFmt.format(new Date()) + " (UTC-3)";
    Array.prototype.forEach.call(document.querySelectorAll("[data-clock]"), function (el) { el.textContent = s; });
  }
  tick();
  setInterval(tick, 30000);

  var copyBtn = document.querySelector(".copy-email");
  var copyStatus = document.querySelector("[data-copy-status]");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var email = copyBtn.getAttribute("data-email");
      var done = function () {
        copyBtn.classList.add("is-copied");
        copyStatus.textContent = root.getAttribute("data-lang") === "pt" ? "E-mail copiado" : "Email copied";
        setTimeout(function () { copyBtn.classList.remove("is-copied"); copyStatus.textContent = ""; }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(email).then(done, function () {});
    });
  }

  if (window.matchMedia("(hover: hover)").matches) {
    Array.prototype.forEach.call(document.querySelectorAll(".spot"), function (el) {
      el.addEventListener("pointermove", function (ev) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", (ev.clientX - r.left) + "px");
        el.style.setProperty("--my", (ev.clientY - r.top) + "px");
      });
    });
  }

  var nav = document.querySelector(".nav");
  function navState() { nav.classList.toggle("is-scrolled", window.scrollY > 24); }
  window.addEventListener("scroll", navState, { passive: true });
  navState();

  var navLinks = document.querySelectorAll("[data-nav]");
  function setActive(id) {
    Array.prototype.forEach.call(navLinks, function (a) {
      if (a.getAttribute("data-nav") === id) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["console", "projetos", "sobre", "trajetoria", "contato", "topo"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }

  var track = document.querySelector(".marquee-track");
  if (track && !reduceMotion.matches) {
    Array.prototype.forEach.call(track.children, function (li) {
      var c = li.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      track.appendChild(c);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Counters                                                            */
  /* ------------------------------------------------------------------ */
  function formatCount(n, suffix) {
    return {
      pt: Math.round(n).toLocaleString("pt-BR") + (suffix || ""),
      en: Math.round(n).toLocaleString("en-US") + (suffix || "")
    };
  }
  function countUp(el, delay) {
    var to = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var pt = el.querySelector('[lang="pt"]'), en = el.querySelector('[lang="en"]');
    var obj = { v: 0 };
    gsap.to(obj, {
      v: to, duration: 1.8, delay: delay || 0, ease: "power3.out",
      onUpdate: function () { var f = formatCount(obj.v, suffix); pt.textContent = f.pt; en.textContent = f.en; }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Motion                                                              */
  /* ------------------------------------------------------------------ */
  function splitName() {
    var chars = [];
    Array.prototype.forEach.call(document.querySelectorAll(".name-line"), function (line) {
      var text = line.textContent.trim();
      line.textContent = "";
      text.split("").forEach(function (ch) {
        var s = document.createElement("span");
        s.className = "char";
        s.textContent = ch;
        line.appendChild(s);
        chars.push(s);
      });
    });
    return chars;
  }

  function startConsoleWhenVisible() {
    if (hasGsap) {
      ScrollTrigger.create({ trigger: ".console", start: "top 65%", once: true, onEnter: function () { if (!started) run(); } });
    } else if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); if (!started) run(); }
      }, { threshold: 0.3 });
      io.observe(stage);
    } else {
      run();
    }
  }

  if (hasGsap) {
    var mm = gsap.matchMedia();
    mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, function (ctx) {
      if (ctx.conditions.reduce) { root.classList.remove("js-anim"); return; }

      var chars = splitName();
      var tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.fromTo(".nav", { y: -24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 0)
        .set(".name", { opacity: 1 }, 0)
        .fromTo(chars, { yPercent: 115 }, { yPercent: 0, duration: 1.1, stagger: 0.03 }, 0.15)
        .fromTo("[data-intro]", { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.09 }, 0.35)
        .set(".portrait", { opacity: 1 }, 0.2)
        .fromTo(".portrait-frame", { clipPath: "inset(100% 0% 0% 0% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 28px)", duration: 1.3, ease: "power4.inOut" }, 0.2)
        .fromTo(".portrait-frame img", { scale: 1.18 }, { scale: 1, duration: 1.8, ease: "power3.out" }, 0.2)
        .fromTo("[data-chip]", { y: 16, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.14, ease: "back.out(1.6)" }, 1.15)
        .fromTo(".stat", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.08 }, 0.9);
      tl.add(function () {
        Array.prototype.forEach.call(document.querySelectorAll(".stat-num"), function (el, i) { countUp(el, i * 0.08); });
      }, 0.9);
      root.classList.remove("js-anim");

      gsap.utils.toArray("[data-reveal]").forEach(function (el) {
        gsap.fromTo(el, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 86%", once: true } });
      });

      gsap.set(".project, .bento-card, .tl-item", { y: 40, opacity: 0 });
      ScrollTrigger.batch(".project, .bento-card, .tl-item", {
        start: "top 90%", once: true,
        onEnter: function (els) { gsap.to(els, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.09, overwrite: true }); }
      });

      gsap.fromTo(".tl-progress", { scaleY: 0 }, {
        scaleY: 1, ease: "none",
        scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 65%", scrub: 0.6 }
      });

      gsap.to(".hero-glow", { yPercent: 18, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  } else {
    root.classList.remove("js-anim");
  }

  startConsoleWhenVisible();
})();
