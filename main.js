import { animate, stagger, utils } from "https://cdn.jsdelivr.net/npm/animejs@4/+esm";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const REPO = "MystiTheDev/oceanic";

/* ---------- Nerida orb (ported from NeridaOrb.tsx) ---------- */
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
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => t * t * (3 - 2 * t);
const lerpStops = (stops, p) => {
  for (let i = 1; i < stops.length; i++) {
    const [p1, c1] = stops[i], [p0, c0] = stops[i - 1];
    if (p <= p1) { const t = (p - p0) / (p1 - p0); return c0.map((v, k) => +(v + (c1[k] - v) * t).toFixed(3)); }
  }
  return stops.at(-1)[1];
};
const wide = () => innerWidth > 900;

/* Sea color and zone glows by page depth */
const SEA = [[0, [20, 120, 130]], [0.15, [8, 62, 88]], [0.4, [6, 28, 56]], [0.7, [3, 14, 30]], [1, [2, 9, 16]]];
const GLOW = [[0, [45, 212, 191, .3]], [0.3, [56, 189, 248, .22]], [0.5, [124, 58, 237, .3]], [0.7, [167, 139, 250, .18]], [0.85, [45, 212, 191, .12]], [1, [205, 185, 143, .22]]];
const GLOW2 = [[0, [14, 116, 144, .3]], [0.5, [59, 130, 246, .2]], [1, [124, 58, 237, .12]]];

const sea = $(".sea"), glow = $(".glow"), rays = $(".rays"), rope = $(".line-rope"), weight = $(".line-weight"), depth = $("#depth"), bar = $(".bar");
const riseFrame = $(".rise .frame"), jelly = $(".jelly"), orbWrap = $(".orb-wrap"), angler = $(".angler");
const showcase = $(".showcase"), shots = $$(".big .shots img"), caps = $$(".cap"), tabs = $$(".tabs button"), bigFrame = $(".big");
const callout = $(".callout"), note = $(".callout .note"), washMap = $("#wash-map");
const scrubs = $$("[data-scrub]");
const bubbles = [], snow = [];

function frame() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? clamp(scrollY / max) : 0;

  sea.style.background = `rgb(${lerpStops(SEA, p).map(Math.round).join(",")})`;
  glow.style.setProperty("--gc", `rgba(${lerpStops(GLOW, p).join(",")})`);
  glow.style.setProperty("--gc2", `rgba(${lerpStops(GLOW2, p).join(",")})`);
  glow.style.setProperty("--gx", `${60 + Math.sin(p * 9) * 25}%`);
  glow.style.setProperty("--gy", `${30 + Math.cos(p * 7) * 15}%`);
  rays.style.opacity = Math.max(0, 1 - p * 6);

  const y = 72 + p * (innerHeight - 130);
  rope.style.height = y + "px";
  weight.style.top = y + "px";
  depth.textContent = Math.round(p * 4000).toLocaleString();
  bar.classList.toggle("solid", scrollY > 40);

  const bOp = Math.max(0, 1 - p * 5), sOp = clamp((p - 0.25) * 2.5);
  bubbles.forEach((b) => (b.style.opacity = bOp));
  snow.forEach((s) => (s.style.opacity = sOp * s.dataset.o));

  if (reduce) return;

  // Hero: the app window rises out of the water and flattens.
  const h = ease(clamp(scrollY / (innerHeight * 0.7)));
  riseFrame.style.rotate = `x ${28 * (1 - h)}deg`;
  riseFrame.style.scale = String(0.88 + 0.12 * h);

  // Pinned showcase: five scenes scrubbed by scroll.
  if (wide()) {
    const r = showcase.getBoundingClientRect();
    const sp = clamp(-r.top / (r.height - innerHeight));
    const seg = sp * shots.length - 0.0001;
    const idx = Math.max(0, Math.floor(seg)), local = seg - idx;
    const last = idx === shots.length - 1;
    // Scene timeline: settle, zoom into a detail with a callout, zoom out, then the water transition.
    const tr = last ? 0 : ease(clamp((local - 0.72) / 0.28));
    const zin = ease(clamp((local - 0.12) / 0.28)), zout = last ? 0 : ease(clamp((local - 0.5) / 0.2));
    const zk = zin * (1 - zout);
    const cur = shots[idx], z = 1 + (+cur.dataset.z - 1) * zk;
    shots.forEach((img, i) => {
      img.style.transformOrigin = `${img.dataset.fx}% ${img.dataset.fy}%`;
      img.style.filter = "";
      if (i === idx) {
        img.style.opacity = 1; img.style.zIndex = 1; img.style.clipPath = "none";
        img.style.scale = String(z * (1 + 0.05 * tr));
      } else if (i === idx + 1 && tr > 0) {
        // Next view rises from the bottom like water filling the frame, edge rippling.
        img.style.opacity = 1; img.style.zIndex = 2; img.style.scale = "1";
        img.style.clipPath = `inset(${(1 - tr) * 100}% 0 0 0)`;
        img.style.filter = "url(#wash)";
      } else { img.style.opacity = 0; img.style.zIndex = 0; }
    });
    washMap.setAttribute("scale", String(Math.sin(tr * Math.PI) * 45));
    callout.style.left = cur.dataset.fx + "%";
    callout.style.top = cur.dataset.fy + "%";
    note.textContent = cur.dataset.note;
    const co = clamp((local - 0.28) / 0.08) * (1 - clamp((local - 0.58) / 0.08));
    callout.style.opacity = co;
    callout.style.scale = String(0.8 + 0.2 * co);
    caps.forEach((c, i) => {
      let o = 0, ty = 30;
      // Outgoing caption leaves in the first half of the transition, incoming arrives in the second.
      if (i === idx) { o = 1 - clamp(tr * 2); ty = -30 * clamp(tr * 2); }
      else if (i === idx + 1) { o = clamp(tr * 2 - 1); ty = 30 * (1 - clamp(tr * 2 - 1)); }
      c.style.opacity = o; c.style.translate = `0 ${ty}px`;
      c.classList.toggle("on", o > 0.5);
    });
    tabs.forEach((t, i) => { t.style.setProperty("--f", clamp(seg - i)); t.setAttribute("aria-selected", String(i === idx)); });
    // The frame turns slightly as scenes change, like a slow camera move.
    bigFrame.style.transform = `rotateY(${-8 + sp * 16}deg) rotateX(${4 - Math.sin(local * Math.PI) * 3}deg)`;
  }

  // Scroll-scrubbed text: tied to position, not a one-off fade.
  scrubs.forEach((el) => {
    const t = ease(clamp((innerHeight - el.getBoundingClientRect().top) / (innerHeight * 0.4)));
    el.style.opacity = t;
    el.style.translate = `0 ${(1 - t) * 60}px`;
    el.style.filter = t < 1 ? `blur(${(1 - t) * 6}px)` : "";
  });

  if (jelly) jelly.style.translate = `0 ${jelly.parentElement.getBoundingClientRect().top * -0.3}px`;
  if (angler) angler.style.translate = `${angler.parentElement.getBoundingClientRect().top * 0.15}px 0`;
  if (orbWrap) {
    const r = orbWrap.getBoundingClientRect(), t = 1 - clamp(Math.abs(r.top + r.height / 2 - innerHeight / 2) / innerHeight);
    orbWrap.style.scale = String(0.75 + t * 0.4);
  }
}
addEventListener("scroll", () => requestAnimationFrame(frame), { passive: true });
addEventListener("resize", frame);

/* Showcase tabs: jump to a scene (desktop scrolls there; mobile swaps in place) */
tabs.forEach((t, j) => t.addEventListener("click", () => {
  if (wide() && !reduce) {
    const top = showcase.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + ((j + 0.05) / shots.length) * (showcase.offsetHeight - innerHeight), behavior: "smooth" });
    return;
  }
  caps.forEach((c, k) => { c.classList.toggle("on", k === j); c.style.opacity = k === j ? 1 : 0; });
  shots.forEach((s, k) => { s.style.opacity = k === j ? 1 : 0; s.style.clipPath = "none"; });
  tabs.forEach((r, k) => { r.style.setProperty("--f", k === j ? 1 : 0); r.setAttribute("aria-selected", String(k === j)); });
}));

/* ---------- Bento illustrations play when seen ---------- */
const cal = $(".ill-cal");
cal.innerHTML = Array.from({ length: 28 }, (_, i) => `<b class="${[4, 9, 17, 23].includes(i) ? "due" : ""}"></b>`).join("");
const tileIO = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting || reduce) return;
  tileIO.unobserve(e.target);
  const t = e.target;
  if (t.classList.contains("t-docs")) animate(t.querySelectorAll(".ill-doc i"), { scaleX: [0, 1], delay: stagger(160), duration: 700, ease: "outQuart" });
  if (t.classList.contains("t-pdf")) animate(t.querySelectorAll(".hl"), { "--h": [0, 1], delay: stagger(500, { start: 300 }), duration: 700, ease: "inOutQuad" });
  if (t.classList.contains("t-cards")) animate(t.querySelector(".flip"), { rotateY: [0, 180], duration: 900, delay: 600, loop: true, alternate: true, loopDelay: 1600, ease: "inOutBack" });
  if (t.classList.contains("t-cal")) animate(t.querySelectorAll(".ill-cal b"), { scale: [0, 1], opacity: [0, 1], delay: stagger(25, { grid: [7, 4], from: "first" }), duration: 400, ease: "outBack" });
  if (t.classList.contains("t-spell")) animate(t.querySelector("u"), { opacity: [0.2, 1], duration: 600, loop: 3, alternate: true, ease: "inOutSine" });
}), { threshold: 0.4 });
$$(".tile").forEach((t) => tileIO.observe(t));

/* ---------- Download button matches the visitor's OS ---------- */
const OS = (() => {
  const p = (navigator.userAgentData?.platform || navigator.platform || navigator.userAgent).toLowerCase();
  if (/android|iphone|ipad|ios/.test(navigator.userAgent.toLowerCase())) return "mobile";
  if (p.includes("win")) return "windows";
  if (p.includes("mac")) return "mac";
  if (p.includes("linux")) return "linux";
  return "other";
})();
const OS_FILES = {
  windows: { label: "Windows", test: /-setup\.exe$/ },
  mac: { label: "macOS", test: /\.dmg$/ },
  linux: { label: "Linux", test: /\.AppImage$/ },
};
function pickDownload(assets) {
  const find = (re) => assets.find((a) => re.test(a.name));
  const mine = OS_FILES[OS];
  const asset = mine && find(mine.test);
  if (asset) $$(".os-dl").forEach((b) => { b.href = asset.browser_download_url; b.textContent = `Download for ${mine.label}`; });
  // Links to the other platforms (and .deb/.rpm on Linux) under the big button.
  const links = [];
  for (const [k, v] of Object.entries(OS_FILES)) {
    const a = find(v.test);
    if (a && k !== OS) links.push(`<a href="${esc(a.browser_download_url)}">${v.label}</a>`);
  }
  if (OS === "linux") [[/\.deb$/, ".deb"], [/\.rpm$/, ".rpm"]].forEach(([re, n]) => { const a = find(re); if (a) links.push(`<a href="${esc(a.browser_download_url)}">${n}</a>`); });
  const note = OS === "mobile" ? "Oceanic is a desktop app for now. Open this page on a computer to install it. " : "";
  $("#other-os").innerHTML = `${note}Also for ${links.join(", ")}.`;
}

/* ---------- Releases as seafloor strata ---------- */
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
fetch(`https://api.github.com/repos/${REPO}/releases?per_page=3`)
  .then((r) => (r.ok ? r.json() : Promise.reject()))
  .then((rels) => {
    if (!rels.length) throw 0;
    $("#ver").textContent = `Free for Windows, macOS and Linux. Latest: ${rels[0].tag_name}`;
    pickDownload(rels[0].assets || []);
    $("#strata").innerHTML = rels.map((r) => {
      const lines = (r.body || "").split("\n").filter((l) => /^\s*[-*]\s/.test(l)).slice(0, 3)
        .map((l) => `<li>${esc(l.replace(/^\s*[-*]\s+/, "").replace(/\*\*/g, ""))}</li>`).join("");
      const name = (r.name || r.tag_name).replace(/^.*?Oceanic\s*/, "");
      return `<article class="stratum"><h4>${esc(name)}</h4><ul>${lines}</ul><a href="${esc(r.html_url)}">Read the full notes</a></article>`;
    }).join("");
  })
  .catch(() => { $("#strata").innerHTML = `<p class="quiet">Release notes did not load. Read them on the <a href="https://github.com/${REPO}/releases">Releases page</a>.</p>`; });

/* ---------- FAQ accordion ---------- */
$$("details").forEach((d) => {
  const sum = d.querySelector("summary"), body = d.querySelector(".ans");
  sum.addEventListener("click", (e) => {
    if (reduce) return;
    e.preventDefault();
    if (d.open) animate(body, { height: [body.scrollHeight, 0], opacity: [1, 0], duration: 280, ease: "inOutQuad", onComplete: () => { d.open = false; body.style.height = ""; } });
    else { d.open = true; animate(body, { height: [0, body.scrollHeight], opacity: [0, 1], duration: 380, ease: "outQuad", onComplete: () => (body.style.height = "") }); }
  });
});

/* ---------- Water-drop ripple on buttons ---------- */
$$(".btn").forEach((btn) => btn.addEventListener("pointerdown", (e) => {
  if (reduce) return;
  const r = btn.getBoundingClientRect(), d = document.createElement("span");
  d.className = "drop"; d.style.left = e.clientX - r.left + "px"; d.style.top = e.clientY - r.top + "px";
  btn.appendChild(d);
  animate(d, { width: [0, r.width * 2.2], height: [0, r.width * 2.2], opacity: [0.6, 0], duration: 700, ease: "outQuad", onComplete: () => d.remove() });
}));

/* ---------- Bubbles near the surface, marine snow in the deep ---------- */
const host = $(".drift");
for (let i = 0; i < 40; i++) {
  const isSnow = i >= 14, d = document.createElement("span"), s = isSnow ? utils.random(1, 3) : utils.random(4, 12);
  d.className = isSnow ? "snow" : "bubble";
  d.dataset.o = utils.random(0.3, 0.9, 2);
  Object.assign(d.style, { width: s + "px", height: s + "px", left: utils.random(0, 100) + "vw", top: utils.random(0, 100) + "vh" });
  host.appendChild(d);
  (isSnow ? snow : bubbles).push(d);
  if (!reduce) animate(d, isSnow
    ? { y: [0, utils.random(80, 200)], x: [0, utils.random(-20, 20)], duration: utils.random(9000, 16000), loop: true, alternate: true, ease: "inOutSine" }
    : { y: [0, -utils.random(200, 500)], x: [0, utils.random(-15, 15)], duration: utils.random(5000, 9000), delay: utils.random(0, 3000), loop: true, ease: "inQuad" });
}
frame();

if (!reduce) {
  /* Hero: the word surfaces through the waterline, then the app rises. Skipped if the tab loads hidden. */
  if (!document.hidden) {
  animate(".surface", { scaleX: [0, 1], opacity: [0, 1], duration: 1100, ease: "outExpo" });
  animate(".above", { y: ["60%", 0], opacity: [0, 1], duration: 1300, delay: 250, ease: "outExpo" });
  animate(".below", { y: ["-40%", 0], opacity: [0, 0.75], duration: 1600, delay: 450, ease: "outExpo" });
  animate([".hero-lede", ".hero-act"], { y: [18, 0], opacity: [0, 1], delay: stagger(140, { start: 900 }), duration: 800, ease: "outQuad" });
  animate(".rise", { y: [180, 0], opacity: [0, 1], duration: 1600, delay: 1000, ease: "outExpo" });
  }
  animate("#turb", { baseFrequency: ["0.012 0.06", "0.02 0.09"], duration: 4000, loop: true, alternate: true, ease: "inOutSine" });
  animate(".rays i", { opacity: [0.35, 1], delay: stagger(600), duration: 3200, loop: true, alternate: true, ease: "inOutSine" });

  /* Fish wiggle */

  /* Nerida orb idle */
  animate("#orb .o-halo", { scale: [1, 1.12], opacity: [0.8, 1], duration: 1800, loop: true, alternate: true, ease: "inOutSine" });
  animate("#orb .o-ring", { scale: [1, 1.5], opacity: [0.9, 0], duration: 1800, loop: true, ease: "outQuad" });
  animate("#orb .o-core", { scale: [0.85, 1.15], duration: 1400, loop: true, alternate: true, ease: "inOutSine" });
  animate("#orb .o-waves", { x: [0, -16], duration: 3000, loop: true, ease: "linear" });
  animate("#orb .o-spark", { opacity: [1, 0.2], scale: [1, 0.6], delay: stagger(700), duration: 1100, loop: true, alternate: true, ease: "inOutSine" });

  /* Jellyfish pulse, anglerfish lure */
  animate(".jelly .bell", { scaleY: [1, 0.86], scaleX: [1, 1.06], duration: 1300, loop: true, alternate: true, ease: "inOutSine" });
  animate(".jelly .tent path", { x: [-3, 3], delay: stagger(200), duration: 2200, loop: true, alternate: true, ease: "inOutSine" });
  animate(".lure-glow", { opacity: [0.5, 1], scale: [0.85, 1.1], duration: 1700, loop: true, alternate: true, ease: "inOutSine" });
}

/* ---------- Liveliness: tide strip, sea life, ripples, hover reactions ---------- */
const row = $(".tide-row");
row.innerHTML += row.innerHTML.replace(/<li>/g, '<li aria-hidden="true">');
if (!reduce) animate(row, { x: ["0%", "-50%"], duration: 45000, loop: true, ease: "linear" });

const life = $(".life");
const R = (a, b) => a + Math.random() * (b - a);
const FISH_COLORS = ["#8ee6dc", "#5fe3ff", "#fcd34d", "#f9a8d4", "#a5b4fc"];
const svgEl = (vb, w, h, inner) => {
  const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  el.setAttribute("viewBox", vb); el.setAttribute("width", w); el.setAttribute("height", h);
  el.innerHTML = inner;
  life.appendChild(el);
  return el;
};
const makeFish = () => {
  const c = FISH_COLORS[Math.floor(R(0, FISH_COLORS.length))], s = R(18, 42);
  return svgEl("0 0 40 20", s, s / 2, `<g class="tail" style="transform-origin:10px 10px"><path d="M10 10 L0 2 L3 10 L0 18Z" fill="${c}" opacity=".8"/></g>
    <path d="M8 10 C14 1 32 1 40 10 C32 19 14 19 8 10Z" fill="${c}"/><circle cx="33" cy="8.5" r="1.6" fill="#01070e"/>`);
};
// Each fish swims its own random path, then picks a new one.
const swim = (el) => {
  const ltr = Math.random() > 0.5, y = R(0.12, 0.88) * innerHeight;
  el.style.scale = ltr ? "1 1" : "-1 1";
  animate(el, {
    x: ltr ? [-80, innerWidth + 80] : [innerWidth + 80, -80],
    y: [y, y + R(-120, 120)],
    duration: R(14000, 26000), delay: R(0, 6000), ease: "inOutSine",
    onComplete: () => swim(el),
  });
};

if (!reduce) {
  const fish = Array.from({ length: 7 }, makeFish);
  fish.forEach((f) => {
    f.style.translate = "-100px 0";
    swim(f);
    animate(f.querySelector(".tail"), { rotate: [-18, 18], duration: R(250, 420), loop: true, alternate: true, ease: "inOutSine" });
  });

  const ray = svgEl("0 0 160 90", 180, 100, `<path class="wing" d="M80 20 C60 20 30 40 0 46 C30 54 60 60 80 70 C100 60 130 54 160 46 C130 40 100 20 80 20Z" fill="#1b3a52" opacity=".85" style="transform-origin:80px 45px"/>
    <path d="M80 68 C82 76 84 84 88 90" stroke="#1b3a52" stroke-width="2" fill="none"/><circle cx="72" cy="30" r="1.5" fill="#8ee6dc"/><circle cx="88" cy="30" r="1.5" fill="#8ee6dc"/>`);
  const glide = () => animate(ray, { x: [innerWidth + 200, -260], y: [R(0.3, 0.7) * innerHeight, R(0.3, 0.7) * innerHeight], rotate: [-6, 4], duration: 30000, delay: R(4000, 12000), ease: "inOutSine", onComplete: glide });
  ray.style.translate = `${innerWidth + 200}px 0`;
  glide();
  animate(ray.querySelector(".wing"), { scaleY: [1, 0.6], duration: 1800, loop: true, alternate: true, ease: "inOutSine" });

  // Fish live in the bright water; the manta shows up in the deep.
  const fade = () => {
    const max = document.documentElement.scrollHeight - innerHeight, p = max > 0 ? scrollY / max : 0;
    fish.forEach((f) => (f.style.opacity = clamp(1 - (p - 0.25) * 4)));
    ray.style.opacity = clamp((p - 0.35) * 4) * 0.8;
  };
  addEventListener("scroll", fade, { passive: true });
  fade();

  // Splash ripples on click.
  const rip = $(".ripples");
  const ring = (x, y, size, cls, dur) => {
    const r = document.createElement("span");
    r.className = "ring " + cls; r.style.left = x + "px"; r.style.top = y + "px";
    rip.appendChild(r);
    animate(r, { width: [0, size], height: [0, size], opacity: [0.8, 0], duration: dur, ease: "outQuad", onComplete: () => r.remove() });
  };
  addEventListener("pointerdown", (e) => {
    ring(e.clientX, e.clientY, 170, "splash", 1000);
    setTimeout(() => ring(e.clientX, e.clientY, 110, "", 900), 120);
  });

  // Tiles tilt toward the cursor.
  $$(".tile").forEach((t) => {
    t.addEventListener("pointermove", (e) => {
      const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      animate(t, { rotateY: x * 12, rotateX: -y * 12, scale: 1.02, duration: 300, ease: "outQuad" });
    });
    t.addEventListener("pointerleave", () => animate(t, { rotateY: 0, rotateX: 0, scale: 1, duration: 900, ease: "outElastic(1, .5)" }));
  });

  // The orb leans toward the cursor.
  const orb = $("#orb");
  $(".nerida").addEventListener("pointermove", (e) => {
    const r = orb.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1;
    const k = Math.min(18, d / 20);
    animate(orb, { x: (dx / d) * k, y: (dy / d) * k, duration: 600, ease: "outQuad" });
  });
  $(".nerida").addEventListener("pointerleave", () => animate(orb, { x: 0, y: 0, duration: 1000, ease: "outElastic(1, .5)" }));

  // Buttons wobble like jelly on hover.
  $$(".btn, .dl-mini").forEach((b) => b.addEventListener("pointerenter", () =>
    animate(b, { scaleX: [1, 1.08, 0.96, 1.03, 1], scaleY: [1, 0.92, 1.04, 0.98, 1], duration: 650, ease: "outQuad" })));
}
