// Helper: range("media/one/", 1, 3, "jpg") -> ["media/one/1.jpg","media/one/2.jpg","media/one/3.jpg"]
function range(folder, from, to, ext) {
  return Array.from({ length: to - from + 1 }, (_, i) => `${folder}${from + i}.${ext}`);
}

// ============================================================
//  EDIT THIS FILE ONLY. Every word and photo on the site is here.
//  Put files in the "media" folder, then write their path here.
//
//  TIP for lots of photos: instead of typing 40 lines, use
//     photos: range("media/one/", 1, 40, "jpg")
//  This means media/one/1.jpg ... media/one/40.jpg
//  (name your files 1.jpg, 2.jpg, 3.jpg ... in that folder)
// ============================================================

const SITE = {
  title: "The Three of Us",
  subtitle: "Three friends, one long story.",
  footer: "Made for us, by us.."
};

// ---- Page 1: intro ----
const HOME = {
  button: "Learn about us",
  quotes: [
    { text: "Everything in your life is a reflection of a choice you have made. If you want a different result, make a different choice.", by: "Ganesh Verma" },
    { text: "A person's ego is his biggest enemy.", by: "Varun Aery" },
    { text: "Infinity is the limit for the Brilliance of Human Innovation. ", by: "Vinendder Singh Bassi" }
  ]
};

// ---- Page 2: the hub ----
const HUB = {
  friendButton: "Explore",
  togetherTitle: "In 2 Years we made memories worth 10.",
  togetherButton: "Explore"
};

// ---- Each person (copy a block to add more) ----
// photo = the round picture shown on the intro page and hub
const PEOPLE = [
  {
    name: "Ganesh", color: "#0d31c0", tagline: "Theek aa pa.",
    photo: "media/one.jpg",
    bio: "Casual Tower Defence Enjoyer",
    photos: range("media/one/", 1, 9, "jpg"),
    videos: [],  // e.g. "media/one/clip.mp4" or a YouTube link
    stories: [ { date: "2026-01-10", title: "The day we met", text: "TBA" } ],
    blogs:   [ { date: "2026-10-02", title: "My first post", text: "TBA.\n\nA blank line starts a new paragraph." } ]
  },
  {
    name: "Varun", color: "#af0707", tagline: ":hug",
    photo: "media/two.jpg",
    bio: "Tryhard Minecraft Enjoyer",
    photos: range("media/two/", 1, 7, "jpg"),
    videos: [],
    stories: [ { date: "2026-02-14", title: "A memory", text: "TBA" } ],
    blogs:   [ { date: "2026-10-02", title: "My first post", text: "TBA." } ]
  },
  {
    name: "Vinendder", color: "#6622e5", tagline: "can we play?",
    photo: "media/three.jpg",
    bio: "Retired Industrialist Enjoyer",
    photos: range("media/three/", 1, 10, "jpg"),
    videos: [],
    stories: [ { date: "2026-03-01", title: "A memory", text: "TBA" } ],
    blogs:   [ { date: "2026-10-02", title: "My first post", text: "TBA." } ]
  }
];

// ---- All of us together (the "Explore" page) ----
const TOGETHER = {
  title: "All our memories together",
  intro: "Every moment, every joke, every memory.",
  color: "#1336b6",
  photos: range("media/together/", 1, 55, "jpg"),
  videos: ["media/together/A.mp4", "media/together/B.mp4", "media/together/C.mp4", "media/together/D.mp4",
           "media/together/E.mp4", "media/together/F.mp4", "media/together/G.mp4", "media/together/H.mp4",
           "media/together/I.mp4", "media/together/J.mp4", "media/together/K.mp4", "media/together/E.mp4"

  ],
  stories: [ { date: "2026-04-05", title: "Our first trip", text: "TBA." } ]
};

// ---- COLOURS (change any hex code, save, refresh) ----
// mode = which look the site opens with: "light", "dark", "mixed" or "auto" (follows the viewer's device).
// Viewers can switch it themselves in the Settings menu; their choice is remembered on their device.
// accent = colour of the intro-page buttons (Learn about us, Explore, ...), background = page, text = main text, subtext = small grey text,
// card = boxes (memory cards, blog posts, friend cards), cardText / cardSubtext = text inside those boxes.
const THEME = {
  mode: "light",
  accent: "#1b2340",   // fallback button colour (each palette below has its own "accent" too)
  light: { accent: "#1b2340", background: "#eef1f6", text: "#1b2340", subtext: "#5b6482", card: "#ffffff", cardText: "#1b2340", cardSubtext: "#5b6482" },
  dark:  { accent: "#5b7cfa", background: "#131827", text: "#e9ecf6", subtext: "#98a1c0", card: "#1c2338", cardText: "#e9ecf6", cardSubtext: "#98a1c0" },
  mixed: { accent: "#e8590c", background: "#1b2340", text: "#eef1f6", subtext: "#aab3d1", card: "#ffffff", cardText: "#1b2340", cardSubtext: "#5b6482" }  // dark page, light cards
};
// Each friend's own colour is the "color" line in PEOPLE above. The Together page colour is TOGETHER.color.

// ---- POSTS FROM GOOGLE FORMS (so your friends never have to touch code) ----
// Leave all four as "" to use only what is written above.
// BLOGS: the form's link ("Write a post" button) and the published CSV link of its responses sheet.
const BLOG_FORM  = "";
const BLOG_SHEET = "";
// STORIES (text memories, shown under each person's Memories and on the Together page): same idea, a second form.
const STORY_FORM  = "";   // shows an "Add a story" button in the Stories tab
const STORY_SHEET = "";   // published CSV link of the story form's responses sheet
