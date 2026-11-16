import { animate, stagger, utils } from "https://cdn.jsdelivr.net/npm/animejs@4/+esm";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const REPO = "MystiTheDev/oceanic";

/* ---------- Nerida orb, ported from the app's NeridaOrb.tsx ---------- */
function orbSvg() {
  const C = { x: 36, y: 31 }, T = 4 * Math.PI;
  const sp = (t) => { const r = 2.25 * Math.exp(0.156 * t); return [C.x - r * Math.cos(t), C.y - r * Math.sin(t)]; };
  const pt = (t) => sp(t).map((v) => v.toFixed(2)).join(" ");
  const shell = [], a = [], b = [];
  for (let t = T; t >= 0; t -= 0.12) shell.push(pt(t));
  for (let t = T - 2 * Math.PI; t <= T; t += 0.12) a.push(pt(t));
  for (let t = T; t >= T - 2 * Math.PI; t -= 0.12) b.push(pt(t - 2 * Math.PI));
  const chambers = Array.from({ length: 12 }, (_, i) => { const t = T - i * 0.52; return `M${pt(t)} Q${pt(t - Math.PI * 1.15)} ${pt(t - 2 * Math.PI)}`; }).join(" ");
  return `<svg viewBox="0 0 64 64" aria-hidden="true">
  <defs>
    <radialGradient id="ob" cx=".42" cy=".38" r=".75"><stop offset="0" stop-color="#5fd4ff"/><stop offset=".35" stop-color="#2f7bff"/><stop offset=".7" stop-color="#5b2fd6"/><stop offset="1" stop-color="#1a0b4d"/></radialGradient>
    <radialGradient id="oh"><stop offset=".55" stop-color="#4f6bff" stop-opacity=".55"/><stop offset=".8" stop-color="#7c3aed" stop-opacity=".2"/><stop offset="1" stop-color="#7c3aed" stop-opacity="0"/></radialGradient>
    <radialGradient id="oc"><stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="#bff4ff"/><stop offset=".65" stop-color="#38d6ff" stop-opacity=".45"/><stop offset="1" stop-color="#38d6ff" stop-opacity="0"/></radialGradient>
    <linearGradient id="os" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="or" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bff4ff"/><stop offset=".5" stop-color="#6d8bff" stop-opacity=".3"/><stop offset="1" stop-color="#d8b4fe"/></linearGradient>
    <linearGradient id="og" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5fe3ff"/><stop offset="1" stop-color="#a78bfa"/></linearGradient>
    <clipPath id="ocl"><circle cx="32" cy="32" r="21"/></clipPath>
  </defs>
  <circle class="o-halo" cx="32" cy="32" r="31" fill="url(#oh)" style="transform-origin:32px 32px;transform-box:view-box"/>
  <circle class="o-ring" cx="32" cy="32" r="21" fill="none" stroke="url(#og)" stroke-width="1.6" style="transform-origin:32px 32px"/>
  <circle cx="32" cy="32" r="21" fill="url(#ob)"/>
  <g clip-path="url(#ocl)">
    <g class="o-waves" fill="none" stroke="#a5b4fc" stroke-opacity=".35" stroke-width="1.1">
      <path d="M0 43 q8 -4 16 0 t16 0 t16 0 t16 0 t16 0"/><path d="M-4 48 q8 -3 16 0 t16 0 t16 0 t16 0 t16 0" stroke-opacity=".25"/>
    </g>
    <g fill="none" stroke="#bff4ff" stroke-linecap="round" stroke-linejoin="round">
      <path d="M${a.join(" L")} L${b.join(" L")}Z" fill="#7dd3fc" fill-opacity=".16" stroke="none"/>
      <path d="${chambers}" stroke-width=".55" stroke-opacity=".5"/>
      <path class="o-shell" d="M${shell.join(" L")}" stroke-width="1.1" stroke-opacity=".85"/>
    </g>
    <circle class="o-core" cx="36" cy="31" r="7" fill="url(#oc)" style="transform-origin:36px 31px"/>
    <ellipse cx="27" cy="18" rx="12" ry="5.5" fill="url(#os)" transform="rotate(-18 27 18)" opacity=".55"/>
  </g>
  <circle cx="32" cy="32" r="21" fill="none" stroke="url(#or)" stroke-width="1"/>
  <g fill="#e0f2fe">
    <path class="o-spark" d="M54 9 l1 2.6 2.6 1 -2.6 1 -1 2.6 -1 -2.6 -2.6 -1 2.6 -1z"/>
    <path class="o-spark" d="M9 52 l.7 1.8 1.8 .7 -1.8 .7 -.7 1.8 -.7 -1.8 -1.8 -.7 1.8 -.7z"/>
    <circle cx="20" cy="27" r="1" opacity=".9"/>
  </g></svg>`;
}

/* ---------- Helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => 1 - Math.pow(1 - t, 3);
const lerpRGB = (stops, t) => {
  for (let i = 1; i < stops.length; i++) {
    const [t1, c1] = stops[i], [t0, c0] = stops[i - 1];
    if (t <= t1) { const k = (t - t0) / (t1 - t0); return c0.map((v, j) => Math.round(v + (c1[j] - v) * k)); }
  }
  return stops.at(-1)[1];
};
const rgb = (c) => `rgb(${c.join(",")})`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
if (!reduce) document.documentElement.classList.add("js-motion");

/* ---------- Nerida orb ---------- */
$("#orb").innerHTML = orbSvg();

/* ---------- Hero dive and page depth ---------- */
// Water colour while diving (hero) and the page's depth colour below it (midnight to abyss).
const WATER = [[0, [27, 127, 168]], [0.35, [16, 92, 135]], [0.7, [11, 62, 98]], [1, [6, 26, 46]]];
const PAGE = [[0, [6, 26, 46]], [0.55, [5, 20, 38]], [1, [2, 10, 20]]];
const dive = $(".dive"), stage = $(".dive-stage"), copy = $(".dive-copy"), nav = $("#nav"), depthEl = $(".depth");
const points = $$(".hl .pt").map((g) => ({ rect: $("rect", g), line: $("line", g) }));
const tags = $$(".tag");
const parallax = $$(".parallax");

// Pointer rings: positions are % of the screenshot in the markup; redraw them in real pixels
// so the stroke stays even and the draw-on (dash) animation stays solid.
const hl = $(".hl");
const pct = points.map(({ rect, line }) => ({
  r: ["x", "y", "width", "height"].map((a) => +rect.getAttribute(a)),
  l: ["x1", "y1", "x2", "y2"].map((a) => +line.getAttribute(a)),
}));
function sizePointers() {
  const w = hl.clientWidth, h = hl.clientHeight;
  if (!w) return;
  hl.setAttribute("viewBox", `0 0 ${w} ${h}`);
  points.forEach(({ rect, line }, i) => {
    const [x, y, rw, rh] = pct[i].r, [x1, y1, x2, y2] = pct[i].l;
    const set = (el, o) => Object.entries(o).forEach(([a, v]) => el.setAttribute(a, v));
    set(rect, { x: x * w / 100, y: y * h / 100, width: rw * w / 100, height: rh * h / 100, rx: 8 });
    set(line, { x1: x1 * w / 100, y1: y1 * h / 100, x2: x2 * w / 100, y2: y2 * h / 100 });
  });
}
if (reduce) {
  points.forEach((g) => { g.rect.style.strokeDashoffset = 0; g.line.style.strokeDashoffset = 0; });
  tags.forEach((t) => (t.style.opacity = 1));
}

// Ambient motes in the hero.
const motes = $(".motes"), moteList = [];
for (let i = 0; i < (reduce ? 0 : 32); i++) {
  const m = document.createElement("span"), s = 1 + Math.random() * 3;
  m.dataset.k = (0.3 + Math.random() * 1.2).toFixed(2);
  Object.assign(m.style, { width: s + "px", height: s + "px", left: Math.random() * 100 + "%", top: 20 + Math.random() * 100 + "%", opacity: (0.25 + Math.random() * 0.5).toFixed(2) });
  motes.appendChild(m);
  moteList.push(m);
}

function onScroll() {
  const span = dive.offsetHeight - innerHeight;
  const t = span > 0 ? clamp(scrollY / span) : 1;

  // Hero water.
  stage.style.setProperty("--water", rgb(lerpRGB(WATER, t)));
  stage.style.setProperty("--surface-light", String(clamp(1 - t * 2)));
  stage.style.setProperty("--ray-op", String(0.9 * clamp(1 - t * 1.5)));
  stage.style.setProperty("--handoff", String(clamp((t - 0.8) / 0.2)));

  // Below the hero, the whole page keeps getting deeper.
  const rest = document.documentElement.scrollHeight - innerHeight - dive.offsetHeight;
  const d = rest > 0 ? clamp((scrollY - dive.offsetHeight) / rest) : 0;
  depthEl.style.setProperty("--depth-color", rgb(lerpRGB(PAGE, d)));
  depthEl.style.setProperty("--glow-a", String(0.1 * (1 - d)));
  depthEl.style.setProperty("--glow-b", String(0.12 * (1 - d * 0.7)));

  if (!reduce) {
    const lift = ease(clamp((t - 0.2) / 0.45));
    copy.style.transform = `translateY(${-lift * 140}px)`;
    copy.style.opacity = String(1 - lift);
    const rise = ease(clamp(t / 0.6));
    stage.style.setProperty("--win-off", `${(1 - rise) * innerHeight * 0.62}px`);
    stage.style.setProperty("--win-s", String(0.92 + rise * 0.08));
    // Each pointer draws in turn (ring, connector, label), tied to scroll so it reverses going up.
    points.forEach((g, i) => {
      const k = clamp((t - (0.62 + i * 0.075)) / 0.07);
      const ring = ease(clamp(k / 0.5)), line = ease(clamp((k - 0.45) / 0.25)), lab = ease(clamp((k - 0.65) / 0.35));
      g.rect.style.strokeDashoffset = String(1 - ring);
      g.rect.style.fill = `rgba(142, 230, 242, ${0.07 * ring})`;
      g.line.style.strokeDashoffset = String(1 - line);
      const tag = tags[i], dir = tag.classList.contains("tag-left") ? 1 : -1;
      tag.style.opacity = String(lab);
      tag.style.transform = `translateX(${dir * (1 - lab) * 14}px)`;
    });
    // Motes rise past the camera at different speeds, which reads as moving down.
    moteList.forEach((m) => (m.style.translate = `0 ${-t * 600 * m.dataset.k}px`));
    // Screenshots drift slightly slower than the page.
    parallax.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      el.style.transform = `translateY(${p * -28}px)`;
    });
  }
  nav.classList.toggle("scrolled", scrollY > 24);
}
let ticking = false;
addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { onScroll(); ticking = false; });
}, { passive: true });
addEventListener("resize", () => { sizePointers(); onScroll(); });
sizePointers();
onScroll();

/* ---------- Navigation: current section and the mobile menu ---------- */
const navLinks = $$(".nav-links a");
// Every section is watched; data-nav says which link it belongs to (none clears the highlight).
const sectionIO = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  const key = "#" + (e.target.dataset.nav ?? e.target.id);
  navLinks.forEach((a) => {
    if (a.getAttribute("href") === key) a.setAttribute("aria-current", "true");
    else a.removeAttribute("aria-current");
  });
}), { rootMargin: "-45% 0px -50% 0px" });
$$("main > section").forEach((s) => sectionIO.observe(s));

const menu = $("#menu"), menuBtn = $("#menu-btn");
const focusables = () => [menuBtn, ...$$("a, button", menu)];
function setMenu(open) {
  menu.hidden = !open;
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.classList.toggle("menu-open", open);
  nav.classList.toggle("menu-on", open);
  if (open) {
    $("a", menu).focus();
    if (!reduce) animate($$("nav a, .btn, .menu-note", menu), { opacity: [0, 1], y: [16, 0], delay: stagger(40), duration: 420, ease: "outQuart" });
  }
}
menuBtn.addEventListener("click", () => setMenu(menu.hidden));
$$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
addEventListener("keydown", (e) => {
  if (menu.hidden) return;
  if (e.key === "Escape") { setMenu(false); menuBtn.focus(); }
  if (e.key === "Tab") {
    const f = focusables(), i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f.at(-1).focus(); }
    else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
  }
});
matchMedia("(min-width: 1081px)").addEventListener("change", (m) => m.matches && !menu.hidden && setMenu(false));

/* ---------- Reveals: one gentle rise per block as it enters ---------- */
if (!reduce) {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    io.unobserve(e.target);
  }), { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach((el) => io.observe(el));
}

/* ---------- Study tools: accessible tabs that rotate until you interact ---------- */
const tabs = $$(".segmented [role=tab]"), imgs = $$(".stack img"), panel = $("#study-panel"), caption = $("#study-caption");
const CAPTIONS = [
  "Review cards from any note, graded Again, Hard, Good or Easy.",
  "Turn your flashcards into a multiple-choice test and see your score.",
  "See every exam and assignment, with a countdown on your dashboard.",
];
let cur = 0, autoOn = !reduce, timer = null;
function showTab(i, focus = false) {
  cur = i;
  tabs.forEach((b, j) => { b.setAttribute("aria-selected", String(j === i)); b.tabIndex = j === i ? 0 : -1; });
  imgs.forEach((im, j) => im.classList.toggle("on", j === i));
  panel.setAttribute("aria-labelledby", tabs[i].id);
  caption.textContent = CAPTIONS[i];
  if (focus) tabs[i].focus();
}
const stopAuto = () => { autoOn = false; clearInterval(timer); timer = null; };
tabs.forEach((b, i) => {
  b.addEventListener("click", () => { stopAuto(); showTab(i); });
  b.addEventListener("keydown", (e) => {
    const k = { ArrowRight: 1, ArrowLeft: -1, Home: "first", End: "last" }[e.key];
    if (k === undefined) return;
    e.preventDefault(); stopAuto();
    const n = k === "first" ? 0 : k === "last" ? tabs.length - 1 : (cur + k + tabs.length) % tabs.length;
    showTab(n, true);
  });
});
$(".study").addEventListener("pointerenter", () => { clearInterval(timer); timer = null; });
$(".study").addEventListener("pointerleave", () => { if (autoOn && studyVisible && !timer) timer = setInterval(() => showTab((cur + 1) % tabs.length), 4200); });
let studyVisible = false;
new IntersectionObserver(([e]) => {
  studyVisible = e.isIntersecting;
  if (studyVisible && autoOn && !timer) timer = setInterval(() => showTab((cur + 1) % tabs.length), 4200);
  if (!studyVisible && timer) { clearInterval(timer); timer = null; }
}, { threshold: 0.4 }).observe($(".study"));

/* ---------- Nerida: two real conversations that play in turn ---------- */
const CONVOS = [
  {
    note: "🌿 Photosynthesis", ask: "Quiz me on this note",
    lead: "Here are three questions from your note.",
    quiz: ["What does a plant make from carbon dioxide and water?", "Name two factors that limit the rate of photosynthesis.", "Where in the cell does photosynthesis happen?"],
    actions: ["Check my answers", "Insert into note"],
  },
  {
    note: "🧬 Cell Structure", ask: "Make flashcards from this note",
    lead: "I made four flashcards. Add them to your deck?",
    cards: [["What does the nucleus do?", "Holds DNA and controls the cell"], ["Where is energy released?", "In the mitochondria"], ["What do ribosomes make?", "Proteins"], ["What controls what enters a cell?", "The cell membrane"]],
    actions: ["Make flashcards", "Insert into note"],
  },
];
const chatBody = $("#chat-body");
const typeInto = async (el, text, speed) => {
  if (reduce) { el.textContent = text; return; }
  el.classList.add("caret");
  for (let i = 1; i <= text.length; i++) { el.textContent = text.slice(0, i); await wait(speed); }
  el.classList.remove("caret");
};
const pop = async (el) => { chatBody.appendChild(el); await wait(30); el.classList.add("in"); };
async function play(c) {
  chatBody.innerHTML = "";
  const me = document.createElement("div");
  me.className = "msg me";
  me.innerHTML = `<span class="chip">${esc(c.note)}</span><span>${esc(c.ask)}</span>`;
  await pop(me);
  await wait(reduce ? 0 : 700);
  const ai = document.createElement("div");
  ai.className = "msg ai";
  ai.innerHTML = `<p></p>`;
  await pop(ai);
  await typeInto($("p", ai), c.lead, 20);
  if (c.quiz) {
    const ol = document.createElement("ol");
    ai.appendChild(ol);
    for (const q of c.quiz) { const li = document.createElement("li"); ol.appendChild(li); await typeInto(li, q, 12); }
  } else {
    const box = document.createElement("div");
    box.className = "cards-out";
    ai.appendChild(box);
    for (const [q, a] of c.cards) {
      const d = document.createElement("div");
      d.className = "card-out msg";
      d.innerHTML = `<b>${esc(q)}</b> <span>${esc(a)}</span>`;
      box.appendChild(d);
      await wait(reduce ? 0 : 260);
      d.classList.add("in");
    }
  }
  const acts = document.createElement("div");
  acts.className = "chat-actions";
  acts.innerHTML = c.actions.map((a) => `<span>${esc(a)}</span>`).join("");
  ai.appendChild(acts);
}
let chatStarted = false;
new IntersectionObserver(async ([e], obs) => {
  if (!e.isIntersecting || chatStarted) return;
  chatStarted = true;
  obs.disconnect();
  if (reduce) { await play(CONVOS[0]); return; }
  for (let i = 0; ; i = (i + 1) % CONVOS.length) { await play(CONVOS[i]); await wait(5200); }
}, { threshold: 0.35 }).observe($(".chat"));

/* ---------- Downloads: match the visitor's system to the real release files ---------- */
const OS = (() => {
  const ua = navigator.userAgent.toLowerCase();
  const p = (navigator.userAgentData?.platform || navigator.platform || ua).toLowerCase();
  if (/android|iphone|ipad/.test(ua)) return "mobile";
  if (p.includes("win")) return "windows";
  if (p.includes("mac")) return "mac";
  if (p.includes("linux")) return "linux";
  return "other";
})();
const OS_FILES = { windows: { label: "Windows", re: /-setup\.exe$/ }, mac: { label: "macOS", re: /\.dmg$/ }, linux: { label: "Linux", re: /\.AppImage$/ } };
function pickDownload(assets) {
  const find = (re) => assets.find((a) => re.test(a.name));
  const mine = OS_FILES[OS], asset = mine && find(mine.re);
  if (asset) $$(".os-dl").forEach((b) => {
    b.href = asset.browser_download_url;
    if (!b.classList.contains("btn-sm")) b.textContent = `Download for ${mine.label}`;
  });
  $$(".platform").forEach((li) => {
    const key = li.dataset.os, a = find(OS_FILES[key].re);
    if (a) $("a", li).href = a.browser_download_url;
    li.classList.toggle("mine", key === OS);
  });
  const extra = [[/\.deb$/, ".deb"], [/\.rpm$/, ".rpm"]].map(([re, n]) => { const a = find(re); return a ? `<a href="${esc(a.browser_download_url)}">${n}</a>` : ""; }).filter(Boolean);
  if (extra.length) $("#linux-alt").innerHTML = `Also ${extra.join(" or ")}`;
}
$$(".platform").forEach((li) => li.classList.toggle("mine", li.dataset.os === OS));

/* ---------- Releases ---------- */
fetch(`https://api.github.com/repos/${REPO}/releases?per_page=3`)
  .then((r) => (r.ok ? r.json() : Promise.reject()))
  .then((rels) => {
    if (!rels.length) throw 0;
    pickDownload(rels[0].assets || []);
    $("#meta").textContent = `Free for Windows, macOS and Linux. Latest version ${rels[0].tag_name}.`;
    $("#log").innerHTML = rels.map((r) => {
      const items = (r.body || "").split("\n").filter((l) => /^\s*[-*]\s/.test(l)).slice(0, 3)
        .map((l) => `<li>${esc(l.replace(/^\s*[-*]\s+/, "").replace(/\*\*/g, "").replace(/^\p{Extended_Pictographic}️?\s*/u, ""))}</li>`).join("");
      const date = new Date(r.published_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
      return `<article class="release"><div class="release-head"><h4><a href="${esc(r.html_url)}">${esc(r.tag_name)}</a></h4><time datetime="${esc(r.published_at)}">${esc(date)}</time></div><ul>${items}</ul></article>`;
    }).join("");
  })
  .catch(() => { $("#log").innerHTML = `<p class="muted">Release notes didn't load. See them on <a href="https://github.com/${REPO}/releases">GitHub</a>.</p>`; });

/* ---------- FAQ: animate open and close, keep native keyboard behaviour ---------- */
$$("details").forEach((d) => {
  const sum = $("summary", d), body = $(".ans", d);
  sum.addEventListener("click", (e) => {
    if (reduce) return;
    e.preventDefault();
    if (d.open) animate(body, { height: [body.scrollHeight, 0], opacity: [1, 0], duration: 260, ease: "inOutQuad", onComplete: () => { d.open = false; body.style.height = ""; body.style.opacity = ""; } });
    else { d.open = true; animate(body, { height: [0, body.scrollHeight], opacity: [0, 1], duration: 340, ease: "outQuad", onComplete: () => { body.style.height = ""; } }); }
  });
});

/* ---------- Ambient motion (hero water and the orb) ---------- */
if (!reduce) {
  moteList.forEach((m) => animate(m, { x: [0, utils.random(-24, 24)], duration: utils.random(4000, 9000), loop: true, alternate: true, ease: "inOutSine" }));
  $$(".rays i").forEach((r) => animate(r, {
    x: [utils.random(-30, -10), utils.random(10, 30)], skewX: [utils.random(-6, -2), utils.random(2, 6)], opacity: [0.35, 1],
    duration: utils.random(3800, 6500), delay: utils.random(0, 2000), loop: true, alternate: true, ease: "inOutSine",
  }));
  const bubbleBox = $(".bubbles");
  for (let i = 0; i < (innerWidth < 600 ? 7 : 14); i++) {
    const b = document.createElement("span"), s = utils.random(6, 18);
    Object.assign(b.style, { width: s + "px", height: s + "px", left: utils.random(4, 96) + "%" });
    bubbleBox.appendChild(b);
    const rise = () => animate(b, { y: [0, -(innerHeight + 80)], x: [0, utils.random(-40, 40)], opacity: [0, 0.9, 0.9, 0], duration: utils.random(7000, 13000), delay: utils.random(0, 6000), ease: "inSine", onComplete: rise });
    rise();
  }
  // Orb: slow breathing glow, a ring that keeps rippling out, and a few motes orbiting it.
  animate(".orb-glow", { scale: [0.92, 1.08], opacity: [0.75, 1], duration: 3200, loop: true, alternate: true, ease: "inOutSine" });
  animate("#orb .o-halo", { scale: [1, 1.1], opacity: [0.8, 1], duration: 2200, loop: true, alternate: true, ease: "inOutSine" });
  animate("#orb .o-ring", { scale: [1, 1.6], opacity: [0.8, 0], duration: 2600, loop: true, ease: "outQuad" });
  animate("#orb .o-core", { scale: [0.88, 1.12], duration: 1800, loop: true, alternate: true, ease: "inOutSine" });
  animate("#orb .o-waves", { x: [0, -16], duration: 3600, loop: true, ease: "linear" });
  animate("#orb .o-spark", { opacity: [1, 0.2], scale: [1, 0.6], delay: stagger(800), duration: 1300, loop: true, alternate: true, ease: "inOutSine" });
  const om = $(".orb-motes");
  for (let i = 0; i < 6; i++) {
    const m = document.createElement("span"), r = 80 + i * 14, a0 = (i / 6) * Math.PI * 2;
    m.style.left = "50%"; m.style.top = "50%";
    om.appendChild(m);
    const o = { a: a0 };
    animate(o, { a: a0 + Math.PI * 2, duration: 14000 + i * 2600, loop: true, ease: "linear", onUpdate: () => { m.style.transform = `translate(${Math.cos(o.a) * r}px, ${Math.sin(o.a) * r * 0.45}px)`; } });
  }
  // Hero copy enters once on load.
  if (!document.hidden) animate([".dive-copy h1", ".lede", ".cta-row", ".meta"], { y: [24, 0], opacity: [0, 1], delay: stagger(110, { start: 150 }), duration: 1000, ease: "outQuart" });
}
