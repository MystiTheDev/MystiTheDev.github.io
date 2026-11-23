// Captures website screenshots of the Oceanic web build in light and dark, at 2880x1620.
// Usage: start the app (`npm run dev` in the oceanic repo, port 1420), then
//   node tools/shoot.js [only-this-shot]
// Writes assets/shots/<name>-<light|dark>.jpg. Uses headless Chrome over the DevTools protocol.
const { spawn } = require("child_process"), fs = require("fs"), path = require("path"), os = require("os");

const APP = process.env.APP_URL || "http://localhost:1420/";
const OUT = path.join(__dirname, "..", "assets", "shots");
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "/usr/bin/google-chrome", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].find(fs.existsSync);
const SEED = fs.readFileSync(path.join(__dirname, "seed-demo.js"), "utf8");
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// In-page helpers: click the first visible element whose label or text matches.
const HELPERS = `
window.__click = (text, exact = true) => {
  const els = [...document.querySelectorAll('button, a, [role=button], [role=tab], [role=treeitem], div, span')];
  const hit = els.find((e) => {
    const s = (e.getAttribute('aria-label') || e.getAttribute('title') || e.textContent || '').trim();
    const r = e.getBoundingClientRect();
    return r.width && r.height && (exact ? s === text : s.includes(text));
  });
  if (!hit) throw new Error('No element: ' + text);
  hit.click();
  return true;
};`;

// Each shot: a name and the steps to reach it (run in order, each followed by a pause).
const SHOTS = [
  { name: "home", steps: [] },
  // 16:10, to fill the MacBook screen in the hero.
  { name: "laptop", steps: [], height: 900 },
  { name: "notes", steps: ["__click('Cell Structure')"] },
  { name: "calendar", steps: ["__click('Calendar view')"] },
  { name: "mindmap", steps: ["__click('Map your ideas')", "__click('The Cell')", "@click 1100,700"], settle: 3500 },
  { name: "flashcards", steps: ["__click('Cell Structure')", "__click('Practice', false)"] },
  { name: "dashboard", steps: ["localStorage.setItem('oc-home-mode','dashboard')"], reload: true },
  { name: "docs", steps: ["__click('Write and edit Word documents')"], settle: 6000 },
];

async function main() {
  const only = process.argv[2];
  const port = 9333, profile = fs.mkdtempSync(path.join(os.tmpdir(), "oc-shoot-"));
  const chrome = spawn(CHROME, [`--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--headless=new", "--hide-scrollbars", "--no-first-run", "--window-size=1440,810", "about:blank"], { stdio: "ignore" });
  try {
    let ws;
    for (let i = 0; i < 50 && !ws; i++) {
      try { ws = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === "page")?.webSocketDebuggerUrl; } catch { await wait(200); }
    }
    const sock = new WebSocket(ws);
    await new Promise((r) => sock.addEventListener("open", r));
    let id = 0;
    const pending = new Map();
    sock.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
    const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, (m) => (m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result))); sock.send(JSON.stringify({ id: i, method, params })); });
    const evaluate = async (expr) => { const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || expr); return r.result.value; };
    // A real mouse click at viewport coordinates (CSS px), e.g. on empty canvas to clear a selection.
    const clickAt = async (x, y) => { for (const type of ["mousePressed", "mouseReleased"]) await send("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 }); };
    const load = async (url) => { await send("Page.navigate", { url }); await wait(3500); await evaluate(HELPERS); };

    await send("Page.enable");
    await send("Runtime.enable");
        fs.mkdirSync(OUT, { recursive: true });

    for (const theme of ["dark", "light"]) {
      await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: theme }] });
      for (const shot of SHOTS) {
        if (only && shot.name !== only) continue;
        // Fresh demo data for every shot, so one shot's clicks never leak into the next.
        await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: shot.height || 810, deviceScaleFactor: 2, mobile: false });
        await load(APP);
        await evaluate(SEED + "; localStorage.setItem('oc-home-mode','home'); true");
        await load(APP);
        try {
          for (const step of shot.steps) { await (step.startsWith("@click ") ? clickAt(...step.slice(7).split(",").map(Number)) : evaluate(step)); await wait(1200); if (shot.reload) await load(APP); }
          await evaluate("document.activeElement && document.activeElement.blur(); [...document.querySelectorAll('p')].filter((p) => p.textContent === 'Get started with').forEach((p) => p.closest('.absolute')?.remove()); true");
          await wait(shot.settle || 800);
          const { data } = await send("Page.captureScreenshot", { format: "jpeg", quality: 86 });
          const file = path.join(OUT, `${shot.name}-${theme}.jpg`);
          fs.writeFileSync(file, Buffer.from(data, "base64"));
          console.log("saved", path.relative(process.cwd(), file));
        } catch (e) {
          console.log("FAILED", shot.name, theme, "-", e.message);
        }
      }
    }
    sock.close();
  } finally {
    chrome.kill();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
