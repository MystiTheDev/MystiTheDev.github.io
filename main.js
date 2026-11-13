import { animate, stagger, utils } from "https://cdn.jsdelivr.net/npm/animejs@4/+esm";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const REPO = "MystiTheDev/oceanic";

/* ---------- Nerida orb (ported from the app's NeridaOrb.tsx) ---------- */
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
document.getElementById("orb").innerHTML = orbSvg();

/* ---------- Helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => 1 - Math.pow(1 - t, 3);
const mixHex = (stops, t) => {
  for (let i = 1; i < stops.length; i++) {
    const [t1, c1] = stops[i], [t0, c0] = stops[i - 1];
    if (t <= t1) {
      const k = (t - t0) / (t1 - t0);
      return "rgb(" + c0.map((v, j) => Math.round(v + (c1[j] - v) * k)).join(",") + ")";
    }
  }
  return "rgb(" + stops.at(-1)[1].join(",") + ")";
};
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ---------- Hero dive: scroll takes the camera from the sunlit surface into deep water ---------- */
const WATER = [[0, [27, 127, 168]], [0.35, [16, 92, 135]], [0.7, [11, 62, 98]], [1, [6, 26, 46]]];
const callouts = $$(".callout");
const dive = $(".dive"), stage = $(".dive-stage"), copy = $(".dive-copy"), win = $(".dive-window"), nav = $("#nav");
const motes = $(".motes"), moteList = [];
for (let i = 0; i < (reduce ? 0 : 36); i++) {
  const m = document.createElement("span"), s = 1 + Math.random() * 3;
  m.dataset.k = (0.3 + Math.random() * 1.2).toFixed(2);
  Object.assign(m.style, { width: s + "px", height: s + "px", left: Math.random() * 100 + "%", top: 20 + Math.random() * 100 + "%", opacity: (0.25 + Math.random() * 0.5).toFixed(2) });
  motes.appendChild(m);
  moteList.push(m);
}

function onScroll() {
  const span = dive.offsetHeight - innerHeight;
  const t = span > 0 ? clamp(scrollY / span) : 1;
  stage.style.setProperty("--water", mixHex(WATER, t));
  stage.style.setProperty("--surface-light", String(clamp(1 - t * 2)));
  stage.style.setProperty("--ray-op", String(0.9 * clamp(1 - t * 1.5)));
  stage.style.setProperty("--handoff", String(clamp((t - 0.78) / 0.22)));
  if (!reduce) {
    const lift = ease(clamp((t - 0.2) / 0.45));
    copy.style.transform = `translateY(${-lift * 140}px)`;
    copy.style.opacity = String(1 - lift);
    const rise = ease(clamp(t / 0.6));
    stage.style.setProperty("--win-off", `${(1 - rise) * innerHeight * 0.62}px`);
    stage.style.setProperty("--win-s", String(0.92 + rise * 0.08));
    // Once the window has settled, labels pop in one by one, then leave together before the handoff.
    const out = clamp((t - 0.93) / 0.05);
    callouts.forEach((c, i) => {
      const k = ease(clamp((t - (0.63 + i * 0.07)) / 0.05)) * (1 - out);
      c.style.opacity = String(k);
      c.style.scale = String(0.85 + k * 0.15);
    });
    // Motes rise past the camera at different speeds, which reads as moving down through the water.
    moteList.forEach((m) => (m.style.translate = `0 ${-t * 600 * m.dataset.k}px`));
  }
  nav.classList.toggle("scrolled", scrollY > 24);
  nav.classList.toggle("on-water", scrollY <= 24);

  // Feature screenshots settle into place as they enter the viewport.
  if (!reduce) shots.forEach((el) => {
    const p = ease(clamp((innerHeight - el.getBoundingClientRect().top) / (innerHeight * 0.85)));
    el.style.transform = `translateY(${(1 - p) * 90}px) scale(${0.95 + p * 0.05})`;
    el.style.opacity = String(0.35 + p * 0.65);
  });
}
const shots = $$(".row-shot");
let ticking = false;
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { onScroll(); ticking = false; }); } }, { passive: true });
addEventListener("resize", onScroll);
onScroll();

/* ---------- Row copy fades in once ---------- */
if (!reduce) {
  const copies = $$(".row-copy, .section-head, .road-card, .facts > div");
  copies.forEach((c) => (c.style.opacity = "0"));
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    animate(e.target, { opacity: [0, 1], y: [24, 0], duration: 700, ease: "outQuart" });
  }), { threshold: 0.2 });
  copies.forEach((c) => io.observe(c));
}

/* ---------- Study tools: tabs switch the screenshot, and cycle on their own until clicked ---------- */
const tabs = $$(".switch button"), imgs = $$(".stack img");
let auto = true, cur = 0;
const show = (i) => {
  cur = i;
  tabs.forEach((b, j) => b.setAttribute("aria-selected", String(j === i)));
  imgs.forEach((im, j) => im.classList.toggle("on", j === i));
};
tabs.forEach((b, i) => b.addEventListener("click", () => { auto = false; show(i); }));
let cycleTimer = null;
new IntersectionObserver((es) => {
  const vis = es[0].isIntersecting;
  if (vis && auto && !reduce && !cycleTimer) cycleTimer = setInterval(() => auto ? show((cur + 1) % imgs.length) : clearInterval(cycleTimer), 3800);
  if (!vis && cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; }
}, { threshold: 0.5 }).observe($(".study-shot"));

/* ---------- Nerida chat types itself once ---------- */
const typeInto = (el, text, speed) => new Promise((res) => {
  if (reduce) { el.textContent = text; return res(); }
  el.classList.add("caret");
  let i = 0;
  const step = () => {
    el.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(step, speed);
    else { el.classList.remove("caret"); res(); }
  };
  step();
});
const chat = $("#ai-msg");
new IntersectionObserver(async (es, obs) => {
  if (!es[0].isIntersecting) return;
  obs.disconnect();
  const lead = $(".typed", chat);
  await typeInto(lead, lead.dataset.text, 22);
  for (const li of $$(".quiz li", chat)) await typeInto(li, li.dataset.text, 14);
  $(".chat-actions", chat).classList.add("on");
}, { threshold: 0.5 }).observe(chat);

/* ---------- Download buttons match the visitor's OS ---------- */
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
  const others = [];
  for (const [k, v] of Object.entries(OS_FILES)) { const a = find(v.re); if (a && k !== OS) others.push(`<a href="${esc(a.browser_download_url)}">${v.label}</a>`); }
  if (OS === "linux") for (const [re, n] of [[/\.deb$/, ".deb"], [/\.rpm$/, ".rpm"]]) { const a = find(re); if (a) others.push(`<a href="${esc(a.browser_download_url)}">${n}</a>`); }
  const note = OS === "mobile" ? "Oceanic is a desktop app for now. Open this page on a computer to install it. " : "";
  if (others.length) $("#other-os").innerHTML = `${note}Also available for ${others.join(", ")}.`;
}

/* ---------- Releases ---------- */
fetch(`https://api.github.com/repos/${REPO}/releases?per_page=3`)
  .then((r) => (r.ok ? r.json() : Promise.reject()))
  .then((rels) => {
    if (!rels.length) throw 0;
    pickDownload(rels[0].assets || []);
    $("#meta").textContent = `Free for Windows, macOS and Linux · ${rels[0].tag_name}`;
    $("#log").innerHTML = rels.map((r) => {
      const items = (r.body || "").split("\n").filter((l) => /^\s*[-*]\s/.test(l)).slice(0, 3)
        .map((l) => `<li>${esc(l.replace(/^\s*[-*]\s+/, "").replace(/\*\*/g, "").replace(/^\p{Extended_Pictographic}️?\s*/u, ""))}</li>`).join("");
      const date = new Date(r.published_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
      return `<article class="release"><div class="release-head"><h4><a href="${esc(r.html_url)}">${esc(r.tag_name)}</a></h4><time datetime="${esc(r.published_at)}">${esc(date)}</time></div><ul>${items}</ul></article>`;
    }).join("");
  })
  .catch(() => { $("#log").innerHTML = `<p class="muted">Release notes didn't load. See them on <a href="https://github.com/${REPO}/releases">GitHub</a>.</p>`; });

/* ---------- FAQ: animate open and close ---------- */
$$("details").forEach((d) => {
  const sum = $("summary", d), body = $(".ans", d);
  sum.addEventListener("click", (e) => {
    if (reduce) return;
    e.preventDefault();
    if (d.open) animate(body, { height: [body.scrollHeight, 0], opacity: [1, 0], duration: 260, ease: "inOutQuad", onComplete: () => { d.open = false; body.style.height = ""; } });
    else { d.open = true; animate(body, { height: [0, body.scrollHeight], opacity: [0, 1], duration: 340, ease: "outQuad", onComplete: () => (body.style.height = "") }); }
  });
});

/* ---------- Ambient: drifting motes and the Nerida orb ---------- */
if (!reduce) {
  moteList.forEach((m) => animate(m, { x: [0, utils.random(-24, 24)], duration: utils.random(4000, 9000), loop: true, alternate: true, ease: "inOutSine" }));
  // Rays sway and shimmer like sunlight through moving waves (each on its own rhythm).
  $$(".rays i").forEach((r) => animate(r, {
    x: [utils.random(-30, -10), utils.random(10, 30)], skewX: [utils.random(-6, -2), utils.random(2, 6)], opacity: [0.35, 1],
    duration: utils.random(3800, 6500), delay: utils.random(0, 2000), loop: true, alternate: true, ease: "inOutSine",
  }));
  // Bubbles rise from the bottom of the scene, each with its own size, speed and wobble.
  const bubbleBox = $(".bubbles");
  for (let i = 0; i < 14; i++) {
    const b = document.createElement("span"), s = utils.random(6, 18);
    Object.assign(b.style, { width: s + "px", height: s + "px", left: utils.random(4, 96) + "%" });
    bubbleBox.appendChild(b);
    const rise = () => animate(b, {
      y: [0, -(innerHeight + 80)], x: [0, utils.random(-40, 40)], opacity: [0, 0.9, 0.9, 0],
      duration: utils.random(7000, 13000), delay: utils.random(0, 6000), ease: "inSine", onComplete: rise,
    });
    rise();
  }
  animate("#orb .o-halo", { scale: [1, 1.12], opacity: [0.8, 1], duration: 1800, loop: true, alternate: true, ease: "inOutSine" });
  animate("#orb .o-ring", { scale: [1, 1.5], opacity: [0.9, 0], duration: 1800, loop: true, ease: "outQuad" });
  animate("#orb .o-core", { scale: [0.85, 1.15], duration: 1400, loop: true, alternate: true, ease: "inOutSine" });
  animate("#orb .o-waves", { x: [0, -16], duration: 3000, loop: true, ease: "linear" });
  animate("#orb .o-spark", { opacity: [1, 0.2], scale: [1, 0.6], delay: stagger(700), duration: 1100, loop: true, alternate: true, ease: "inOutSine" });
  // Hero copy enters once on load.
  if (!document.hidden) animate([".dive-copy h1", ".lede", ".cta-row", ".meta"], { y: [24, 0], opacity: [0, 1], delay: stagger(110, { start: 150 }), duration: 1000, ease: "outQuart" });
}
