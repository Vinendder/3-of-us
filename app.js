// ---- Theme: copies the chosen palette from content.js into CSS variables ----
const THEME_KEY = "friends-theme";
let themeMode;
function applyTheme(mode) {
  if (mode === "auto") mode = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  if (!THEME[mode]) mode = "light";
  const pal = THEME[mode], root = document.documentElement.style;
  root.setProperty("--bg", pal.background);   root.setProperty("--ink", pal.text);
  root.setProperty("--muted", pal.subtext);   root.setProperty("--card", pal.card);
  root.setProperty("--cardink", pal.cardText); root.setProperty("--cardmuted", pal.cardSubtext);
  root.setProperty("--c", pal.accent || THEME.accent);
  document.querySelectorAll("[data-theme]").forEach(b => b.setAttribute("aria-pressed", b.dataset.theme === mode));
  return mode;
}
let saved; try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
themeMode = applyTheme(["light", "dark", "mixed"].includes(saved) ? saved : THEME.mode);

// app.js: builds each "page" when the address (#/...) changes. Rarely needs editing.
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtDate = d => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const $ = id => document.getElementById(id);
const PAGE = 24;                 // photos shown per "Show more" click
let cur = { photos: [], shown: 0 };

// Round photo; if the file is missing, the initial letter shows instead
const avatar = p => `<span class="av" style="--c:${p.color}"><b>${esc(p.name[0])}</b>
  <img src="${esc(p.photo)}" alt="${esc(p.name)}" onerror="this.remove()"></span>`;

const para = t => esc(t).split(/\n\s*\n/).map(x => `<p>${x.replace(/\n/g, "<br>")}</p>`).join("");
const back = (href, label) => `<a class="back" href="${href}">← ${esc(label)}</a>`;

function photoFigs(from, to) {
  return cur.photos.slice(from, to).map((p, i) => {
    const { src, caption = "" } = typeof p === "string" ? { src: p } : p;
    return `<figure data-photo="${from + i}"><img src="${esc(src)}" alt="${esc(caption)}" loading="lazy" decoding="async"
      onerror="this.parentNode.classList.add('missing');this.remove()">${caption ? `<figcaption>${esc(caption)}</figcaption>` : ""}</figure>`;
  }).join("");
}

const ytId = v => (v.match(/(?:youtu\.be\/|v=)([\w-]{11})/) || [])[1];
// Videos in the grid are only thumbnails (nothing plays here). Clicking one opens the big player.
const videoThumb = (v, i) => { const yt = ytId(v);
  return `<button class="vthumb" data-video="${i}" aria-label="Play video ${i + 1}">${yt
    ? `<img src="https://img.youtube.com/vi/${yt}/hqdefault.jpg" alt="">`
    : `<video src="${esc(v)}#t=0.1" preload="metadata" muted playsinline></video>`}<span class="play"><b>▶</b></span></button>`; };

// ---- PAGE: intro ----
function home() {
  return `<section class="home">
    <div class="faces">${PEOPLE.map(avatar).join("")}</div>
    <h1>${esc(SITE.title)}</h1><p class="sub">${esc(SITE.subtitle)}</p>
    <div class="quotes">${HOME.quotes.map(q => `<blockquote>“${esc(q.text)}”<cite>${esc(q.by)}</cite></blockquote>`).join("")}</div>
    <a class="btn big" href="#/about">${esc(HOME.button)}</a></section>`;
}

// ---- PAGE: hub with 3 friends + together ----
function about() {
  return `${back("#/", "Home")}<section class="hub">
    <div class="cards">${PEOPLE.map((p, i) => `<a class="card" style="--c:${p.color}" href="#/p/${i}">
      ${avatar(p)}<h2>${esc(p.name)}</h2><p>${esc(p.tagline)}</p><span class="btn">${esc(HUB.friendButton)}</span></a>`).join("")}</div>
    <div class="tog"><h2>${esc(HUB.togetherTitle)}</h2><a class="btn big" href="#/together">${esc(HUB.togetherButton)}</a></div></section>`;
}

// ---- PAGE: one friend -> Memories / Blog ----
function friend(i) {
  const p = PEOPLE[i];
  return `${back("#/about", "Everyone")}<section class="friend" style="--c:${p.color}">
    ${avatar(p)}<h1>${esc(p.name)}</h1><p class="sub">${esc(p.tagline)}</p><p class="bio">${esc(p.bio)}</p>
    <div class="two"><a class="btn big" href="#/p/${i}/memories">Memories</a><a class="btn big" href="#/p/${i}/blog">Blog</a></div></section>`;
}

// ---- PAGE: memories (tabs: Photos / Videos / Stories). Used for each friend AND together ----
const storyHTML = (m, raw) => `<article class="card2"><time>${esc(raw ? m.date : fmtDate(m.date))}</time><h3>${esc(m.title)}</h3>${para(m.text)}</article>`;
function memories(o, backHref, backLabel, title) {
  cur = { photos: o.photos || [], videos: o.videos || [], shown: Math.min(PAGE, (o.photos || []).length) };
  const nStories = (o.stories || []).length;
  const tabs = [["photos", `Photos (${cur.photos.length})`, cur.photos.length],
                ["videos", `Videos (${(o.videos || []).length})`, (o.videos || []).length],
                ["stories", `Stories (${nStories})`, nStories || STORY_SHEET || STORY_FORM]].filter(t => t[2]);
  const more = cur.photos.length > cur.shown ? `<button class="btn" data-more>Show more</button>` : "";
  return `${back(backHref, backLabel)}<section class="mem" style="--c:${o.color}"><h1>${esc(title)}</h1>
    ${o.intro ? `<p class="bio">${esc(o.intro)}</p>` : ""}
    <div class="tabs">${tabs.map((t, k) => `<button data-tab="${t[0]}" class="${k ? "" : "on"}">${t[1]}</button>`).join("")}</div>
    <div class="panel" id="photos"><div class="gallery" id="gal">${photoFigs(0, cur.shown)}</div>${more}</div>
    <div class="panel videos" id="videos" hidden>${(o.videos || []).map(videoThumb).join("")}</div>
    <div class="panel" id="stories" hidden>
      ${STORY_FORM ? `<p style="margin-bottom:1.2rem"><a class="btn" href="${esc(STORY_FORM)}" target="_blank" rel="noopener">Add a story</a></p>` : ""}
      <div id="sheetStories"></div>${(o.stories || []).map(m => storyHTML(m)).join("")}</div></section>`;
}

// ---- Posts typed into the Google Form arrive via a published Google Sheet (CSV) ----
function parseCSV(t) {                       // small CSV reader: handles quotes, commas and line breaks inside posts
  const rows = []; let row = [], f = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && t[i + 1] === "\n") i++; row.push(f); rows.push(row); row = []; f = ""; }
    else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows;
}
const sheetCache = {};
function loadSheet(url) {                    // columns: Timestamp, Who, Title, Text
  if (!url) return Promise.resolve([]);
  if (!sheetCache[url]) sheetCache[url] = fetch(url).then(r => r.text())
    .then(t => parseCSV(t).slice(1).filter(r => r[1] && r[3])
      .map(r => ({ who: r[1].trim().toLowerCase(), title: r[2] || "Untitled", date: r[0].split(" ")[0], text: r[3] })))
    .catch(() => []);
  return sheetCache[url];
}

// ---- PAGE: blog (click a post to open it) ----
const postHTML = (b, raw) => `<details class="card2"><summary>${esc(b.title)}<time>${esc(raw ? b.date : fmtDate(b.date))}</time></summary>${para(b.text)}</details>`;
function blog(i) {
  const p = PEOPLE[i];
  return `${back(`#/p/${i}`, p.name)}<section class="mem" style="--c:${p.color}"><h1>${esc(p.name)}’s blog</h1>
    ${BLOG_FORM ? `<p><a class="btn" href="${esc(BLOG_FORM)}" target="_blank" rel="noopener">Write a post</a></p>` : ""}
    <div id="sheetPosts" style="margin-top:1.2rem"></div>
    ${(p.blogs || []).map(b => postHTML(b)).join("")}</section>`;
}

// ---- Router: reads the address and shows the right page ----
function route() {
  const [a, b, c] = location.hash.replace(/^#\/?/, "").split("/");
  const p = PEOPLE[b];
  let html;
  if (a === "about") html = about();
  else if (a === "together") html = memories(TOGETHER, "#/about", "Everyone", TOGETHER.title);
  else if (a === "p" && p && !c) html = friend(b);
  else if (a === "p" && p && c === "memories") html = memories(p, `#/p/${b}`, p.name, `${p.name}’s memories`);
  else if (a === "p" && p && c === "blog") html = blog(b);
  else html = home();
  closeLb();
  $("view").innerHTML = `<div class="page">${html}</div>`;  // fresh element each time, so its CSS animation replays
  window.scrollTo(0, 0);
  if (a === "p" && p && c === "blog") {
    const h = location.hash;
    loadSheet(BLOG_SHEET).then(all => {
      const box = $("sheetPosts"); if (!box || location.hash !== h) return;   // user already left this page
      const mine = all.filter(x => x.who === p.name.trim().toLowerCase()).reverse();   // newest first
      box.innerHTML = mine.map(x => postHTML(x, true)).join("");
      if (!mine.length && !(p.blogs || []).length) box.innerHTML = `<p class="bio">No posts yet.</p>`;
    });
  }
  if (a === "together" || (a === "p" && p && c === "memories")) {
    const h = location.hash, who = a === "together" ? "together" : p.name.trim().toLowerCase();
    loadSheet(STORY_SHEET).then(all => {
      const box = $("sheetStories"); if (!box || location.hash !== h) return;
      const mine = all.filter(x => x.who === who).reverse();             // newest first
      box.innerHTML = mine.map(x => storyHTML(x, true)).join("");
      const tab = document.querySelector('[data-tab="stories"]');
      if (tab) tab.textContent = `Stories (${((a === "together" ? TOGETHER : p).stories || []).length + mine.length})`;
    });
  }
}

// ---- Clicks: tabs, show more, photo viewer ----
document.addEventListener("click", e => {
  const t = e.target.closest("[data-tab]");
  if (t) {
    document.querySelectorAll("[data-tab]").forEach(x => x.classList.toggle("on", x === t));
    document.querySelectorAll(".panel").forEach(x => x.hidden = x.id !== t.dataset.tab);
  }
  if (e.target.closest("[data-more]")) {
    const from = cur.shown; cur.shown = Math.min(from + PAGE, cur.photos.length);
    $("gal").insertAdjacentHTML("beforeend", photoFigs(from, cur.shown));
    if (cur.shown >= cur.photos.length) e.target.remove();
  }
  const f = e.target.closest("[data-photo]");
  if (f && !f.classList.contains("missing")) openPhoto(+f.dataset.photo);
  const vt = e.target.closest("[data-video]"); if (vt) openVideo(+vt.dataset.video);
  if ((e.target.id === "lb" && mode === "photo") || e.target.dataset.close != null) closeLb();
  if (e.target.dataset.step) step(+e.target.dataset.step);
});

// ---- Full-screen viewer: photos (arrows / swipe) and videos (play, pause, previous, next) ----
let idx = 0, mode = "photo";
function closeLb() { $("lb").hidden = true; $("lb").innerHTML = ""; $("lb").className = ""; document.body.style.overflow = ""; }  // emptying it also stops any playing video
function openPhoto(i) {
  idx = i; mode = "photo"; const p = cur.photos[i], src = typeof p === "string" ? p : p.src;
  $("lb").hidden = false; $("lb").className = ""; document.body.style.overflow = "hidden";   // page behind can't scroll
  $("lb").innerHTML = `<button data-close aria-label="Close">✕</button><button data-step="-1" aria-label="Previous">‹</button><img src="${esc(src)}" alt=""><button data-step="1" aria-label="Next">›</button>`;
}
function openVideo(i) {
  idx = i; mode = "video"; const v = cur.videos[i], yt = ytId(v), n = cur.videos.length;
  $("lb").hidden = false; $("lb").className = "vmode"; document.body.style.overflow = "hidden";
  $("lb").innerHTML = `<button data-close aria-label="Close">✕</button>
    <div class="vbox">${yt ? `<iframe src="https://www.youtube.com/embed/${yt}?autoplay=1&rel=0" allow="autoplay; fullscreen" allowfullscreen></iframe>`
                           : `<video src="${esc(v)}" controls autoplay playsinline></video>`}</div>
    ${n > 1 ? `<div class="vnav"><button data-step="-1">‹ Prev</button><span>${i + 1} / ${n}</span><button data-step="1">Next ›</button></div>` : ""}`;
}
const step = d => { const n = (mode === "video" ? cur.videos : cur.photos).length; (mode === "video" ? openVideo : openPhoto)((idx + d + n) % n); };
document.addEventListener("keydown", e => {
  if ($("lb").hidden) return;
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowRight") step(1);
  if (e.key === "ArrowLeft") step(-1);
  const vid = $("lb").querySelector("video");
  if (vid && e.key === " " && document.activeElement?.tagName !== "VIDEO") { e.preventDefault(); vid.paused ? vid.play() : vid.pause(); }
});
// Swipe left/right on a photo to go next/previous (not used for videos, so scrubbing the timeline never skips)
let tx = 0, ty = 0;
$("lb").addEventListener("touchstart", e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
$("lb").addEventListener("touchend", e => {
  if (mode !== "photo") return;
  const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
}, { passive: true });

// ---- Start ----
document.title = SITE.title;
$("nav").innerHTML = `<a href="#/">${esc(SITE.title)}</a>
  <div class="set"><button id="setBtn" aria-expanded="false">⚙ Settings</button>
    <div id="setPanel" hidden><p>Appearance</p>
      ${["light", "dark", "mixed"].map(m => `<button data-theme="${m}">${m[0].toUpperCase() + m.slice(1)}</button>`).join("")}</div></div>`;
themeMode = applyTheme(themeMode);   // nav now exists, so highlight the active option
$("footer").textContent = SITE.footer;
window.addEventListener("hashchange", route);
route();

// ---- Settings menu: open/close, and choosing a look ----
const closeSettings = () => { $("setPanel").hidden = true; $("setBtn").setAttribute("aria-expanded", "false"); };
document.addEventListener("click", e => {
  if (e.target.closest("#setBtn")) {
    const open = $("setPanel").hidden;
    $("setPanel").hidden = !open; $("setBtn").setAttribute("aria-expanded", open);
  } else if (e.target.closest("[data-theme]")) {
    themeMode = applyTheme(e.target.dataset.theme);
    try { localStorage.setItem(THEME_KEY, themeMode); } catch (err) {}
  } else if (!e.target.closest("#setPanel")) closeSettings();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") closeSettings(); });
