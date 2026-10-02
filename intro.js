// intro.js — "Do you wish to proceed?" -> title card -> intro video (with sound) -> first page.
// Automatically stops showing after the END time (no need to edit anything later).

(function () {
  // ---------- SETTINGS (edit these) ----------
  const END = new Date("2026-10-11T11:00:00+05:30"); // Oct 11, 2026, 11:00 AM IST
  const VIDEO = "media/intro.mp4";                   // path to your intro video

  // How the video fits the screen:
  //   "cover"   = fills the whole screen (crops the edges)
  //   "contain" = shows the whole video (black bars if the shapes differ)
  const VIDEO_FIT_LANDSCAPE = "contain";             // laptops / wide screens
  const VIDEO_FIT_PORTRAIT = "cover";                // phones held upright

  const FRIEND_NAME = "Ganesh";                    // shows as "To Our Dear Friend 1"
  const TOPIC = "We wish you a truly blessed and joyful birthday.";                             // the big line under it

  const GATE_TEXT = "Do you wish to proceed?";       // first screen question
  const GATE_BUTTON = "Yes.";                     // text on the button

  // Optional music that plays under the title card ("" = none), e.g. "media/music.mp3"
  const MUSIC = "";
  const MUSIC_VOLUME = 0.8;
  const MUSIC_CONTINUES_IN_VIDEO = false;            // false = music fades out when the video starts

  const ONCE_PER_SESSION = false;                    // true = plays once per browser tab/session
  const GIVE_UP_AFTER_MS = 8000;                     // if the video can't start in 8s, skip it

  // Timing (milliseconds)
  const GATE_QUESTION_DELAY = 600;   // black screen before the question fades in
  const GATE_BUTTON_DELAY = 1500;    // wait after the question before the button fades in
  const START_DELAY = 500;           // pause after the button press before the title appears
  const GAP_BETWEEN_LINES = 1800;    // wait after line 1 before line 2 fades in
  const HOLD = 4200;                 // how long both lines stay after line 2 starts fading in
  const TITLE_FADE_OUT = 1400;       // how long the title takes to fade away
  // -------------------------------------------

  // 1) Past the deadline? Do nothing, the site loads normally.
  if (Date.now() >= END.getTime()) return;
  if (ONCE_PER_SESSION && sessionStorage.getItem("introSeen")) return;

  // 2) Styles
  const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif';
  const EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";
  const style = document.createElement("style");
  style.textContent = `
    #intro {
      position: fixed; inset: 0; z-index: 99999;
      background: #000; overflow: hidden;
      transition: opacity 1s ease;
    }
    #intro.hide { opacity: 0; pointer-events: none; }

    /* ----- Video ----- */
    #intro video {
      position: absolute; inset: 0; width: 100%; height: 100%;
      opacity: 0; transform: scale(0.92);
      transition: opacity 0.8s ease, transform 0.8s ease;
    }
    #intro video.show { opacity: 1; transform: scale(1); }

    /* ----- Shared fade-in used by the question, button and title lines ----- */
    .t-line {
      opacity: 0; transform: translateY(14px); filter: blur(10px);
      transition: opacity 1.8s ${EASE}, transform 1.8s ${EASE}, filter 1.8s ${EASE};
    }
    .t-line.in { opacity: 1; transform: none; filter: blur(0); }

    /* ----- Title card ----- */
    #intro-title {
      position: absolute; inset: 0; pointer-events: none;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 22px; padding: 24px; text-align: center; color: #fff;
      font-family: ${FONT};
      transition: opacity 1.4s ease;
    }
    #intro-title.out { opacity: 0; }
    #t-to {
      font-size: clamp(13px, 2.4vw, 20px);
      font-weight: 400; letter-spacing: 0.35em; text-transform: uppercase;
      color: rgba(255, 255, 255, 0.7);
    }
    #t-topic {
      font-size: clamp(30px, 6.5vw, 72px);
      font-weight: 600; letter-spacing: -0.02em; line-height: 1.08;
      max-width: 16em; text-wrap: balance;
    }

    /* ----- "Do you wish to proceed?" screen ----- */
    #intro-gate {
      position: absolute; inset: 0; pointer-events: none;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 34px; padding: 24px; text-align: center; color: #fff;
      font-family: ${FONT};
      transition: opacity 0.8s ease;
    }
    #intro-gate.gone { opacity: 0; }
    #gate-q {
      font-size: clamp(20px, 4vw, 34px);
      font-weight: 500; letter-spacing: -0.01em;
    }
    #gate-btn {
      pointer-events: none;
      padding: 14px 38px;
      background: transparent;             /* same as the black background */
      color: #fff;
      border: 1px solid #fff;              /* white outline */
      border-radius: 999px;
      font: 500 15px ${FONT}; letter-spacing: 0.02em;
      cursor: pointer;
      transition: opacity 1.8s ${EASE}, transform 1.8s ${EASE}, filter 1.8s ${EASE}, background 0.3s ease;
    }
    #gate-btn.in { pointer-events: auto; }
    #gate-btn.in:hover { background: rgba(255, 255, 255, 0.14); }
    #gate-btn:focus-visible { outline: 2px solid rgba(255,255,255,0.6); outline-offset: 4px; }

    /* ----- Corner buttons ----- */
    #intro .corner {
      position: absolute; bottom: 24px;
      padding: 10px 18px; border: 1px solid rgba(255,255,255,0.5);
      background: rgba(0,0,0,0.4); color: #fff; border-radius: 999px;
      font: 14px system-ui, sans-serif; cursor: pointer;
    }
    #intro-skip  { right: 24px; }
    #intro-sound { left: 24px; display: none; }
  `;
  document.head.appendChild(style);

  // 3) The overlay (note: the video is NOT muted by default)
  const overlay = document.createElement("div");
  overlay.id = "intro";
  overlay.innerHTML = `
    <video src="${VIDEO}" playsinline preload="auto"></video>
    <div id="intro-title">
      <div id="t-to" class="t-line"></div>
      <div id="t-topic" class="t-line"></div>
    </div>
    <div id="intro-gate">
      <div id="gate-q" class="t-line"></div>
      <button id="gate-btn" class="t-line"></button>
    </div>
    <button id="intro-sound" class="corner">Tap for sound</button>
    <button id="intro-skip" class="corner">Skip</button>
  `;
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden"; // no scrolling while the intro plays

  const $ = (id) => document.getElementById(id);
  $("t-to").textContent = "To Our Dear " + FRIEND_NAME;
  $("t-topic").textContent = TOPIC;
  $("gate-q").textContent = GATE_TEXT;
  $("gate-btn").textContent = GATE_BUTTON;

  const video = overlay.querySelector("video");

  // Landscape screens (laptops) and portrait screens (phones) can fit the video differently
  function applyFit() {
    video.style.objectFit =
      window.innerWidth > window.innerHeight ? VIDEO_FIT_LANDSCAPE : VIDEO_FIT_PORTRAIT;
  }
  applyFit();
  window.addEventListener("resize", applyFit);

  const music = MUSIC ? new Audio(MUSIC) : null;
  if (music) { music.loop = true; music.volume = 0; }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let started = false;
  let finished = false;
  let videoStarted = false;
  let videoBad = false;
  let giveUp;

  // Smooth volume change (iPhones ignore volume changes, so there it just starts/stops)
  function fade(media, to, ms, done) {
    const from = media.volume, steps = 30;
    let i = 0;
    const t = setInterval(() => {
      i++;
      media.volume = Math.min(1, Math.max(0, from + (to - from) * (i / steps)));
      if (i >= steps) { clearInterval(t); if (done) done(); }
    }, ms / steps);
  }

  // 4) Fade the whole overlay out, revealing the first page
  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(giveUp);
    if (ONCE_PER_SESSION) sessionStorage.setItem("introSeen", "1");
    if (music && !music.paused) fade(music, 0, 900, () => music.pause());
    if (!video.paused) fade(video, 0, 900, () => video.pause());
    overlay.classList.add("hide");
    document.body.style.overflow = "";
    setTimeout(() => overlay.remove(), 1000); // matches the 1s fade
  }

  // 5) Video events
  video.addEventListener("playing", () => {
    if (videoStarted) video.classList.add("show"); // video "pops up"
  });
  video.addEventListener("ended", finish);          // fades away when done
  video.addEventListener("error", () => { videoBad = true; });

  $("intro-skip").addEventListener("click", finish);
  $("intro-sound").addEventListener("click", (e) => {
    video.muted = false;
    e.target.remove();
  });

  function playVideo() {
    videoStarted = true;
    video.volume = 1;
    if (music && !MUSIC_CONTINUES_IN_VIDEO) fade(music, 0, 1500, () => music.pause());
    giveUp = setTimeout(() => { if (video.paused) finish(); }, GIVE_UP_AFTER_MS);

    video.play().catch(() => {
      // Sound was blocked: play muted instead, with a button to turn sound on
      video.muted = true;
      $("intro-sound").style.display = "block";
      video.play().catch(() => {
        // Even muted autoplay blocked: let a tap start it (Skip is still available)
        clearTimeout(giveUp);
        video.classList.add("show");
        overlay.addEventListener("click", () => video.play(), { once: true });
      });
    });
  }

  // 6) The sequence: title -> video -> page
  async function run() {
    await sleep(START_DELAY);          if (finished) return;
    $("t-to").classList.add("in");     // "To Our Dear ..." fades in
    await sleep(GAP_BETWEEN_LINES);    if (finished) return;
    $("t-topic").classList.add("in");  // topic fades in
    await sleep(HOLD);                 if (finished) return;
    $("intro-title").classList.add("out");
    await sleep(TITLE_FADE_OUT);       if (finished) return;
    $("intro-title").remove();
    if (videoBad) return finish();     // video missing? go straight to the page
    playVideo();
  }

  // 7) First screen: the question fades in, then the button
  (async function showGate() {
    await sleep(GATE_QUESTION_DELAY);  if (finished || started) return;
    $("gate-q").classList.add("in");
    await sleep(GATE_BUTTON_DELAY);    if (finished || started) return;
    $("gate-btn").classList.add("in");
  })();

  // 8) The button press: this is what lets the browser play sound for the rest of the intro
  $("gate-btn").addEventListener("click", () => {
    if (started) return;
    started = true;
    $("intro-gate").classList.add("gone");
    setTimeout(() => $("intro-gate").remove(), 900);

    // "Unlock" the video's sound now, while we have a tap, then pause until its turn
    video.muted = false;
    video.volume = 0;
    video.play()
      .then(() => {
        if (!videoStarted) { video.pause(); video.currentTime = 0; }
        video.volume = 1;
      })
      .catch(() => { video.volume = 1; });

    if (music) {
      music.play().then(() => fade(music, MUSIC_VOLUME, 2500)).catch(() => {});
    }
    run();
  });
})();
