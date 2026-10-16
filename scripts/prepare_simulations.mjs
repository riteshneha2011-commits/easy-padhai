import fs from "fs";

let html = fs.readFileSync("Simulations/Physics-Lab-Visual-Motion-v3.html", "utf8");

// 1. Meta noindex & title
html = html.replace(
  "<title>Physics Lab — Explore every concept</title>",
  '<meta name="robots" content="noindex, nofollow"><title>Physics Lab Simulations — Easy Padhai (Class 11 &amp; 12)</title>'
);

// 2. Add Back to Easy Padhai button in header
html = html.replace(
  '<div class="header-right"><span class="offline-badge" id="offline-status">',
  '<div class="header-right"><a href="/learn" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px;background:#173c50;color:#a2edca;border:1px solid #40d7ff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s ease;" onmouseover="this.style.background=\'#22526c\'" onmouseout="this.style.background=\'#173c50\'">← Back to Easy Padhai</a><span class="offline-badge" id="offline-status">'
);

// 3. Service worker point to /sw.js
html = html.replace(
  "navigator.serviceWorker.register('./sw.js')",
  "navigator.serviceWorker.register('/sw.js')"
);

fs.writeFileSync("public/simulations/index.html", html, "utf8");
fs.writeFileSync("public/simulations.html", html, "utf8");
console.log("Successfully prepared public/simulations/index.html and public/simulations.html");
