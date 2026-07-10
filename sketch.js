const affirmations = [
  "I am loved",
  "I am the most beautiful girl in the world",
  "I am pretty sure everyone hates me???",
  "I am good at my job. I am so good at my job.",
  "I am.  .  .  hold on",
  "I think I might be wrong",
  "I think I might be right",
  "I am sure there is something out there",
  "I always eat my feelings",
  "One day I will make freinds",
  "I need to chill out",
  "I am flying. I am ascending.",
  "Fuuuuuuuuuuuuuuuuuck",
  "I am really good at drawing",
  "Drawing is the only thing I am good at",
  "I am one",
  "I am whole",

];

// Add journal entries here in writing order (entry 1 first, entry 2 next,
// ...) — the journal itself shows them in reverse (see resetJournal/
// handleJournalClick further down, in the "JOURNAL MECHANIC" section), so
// the last one written is always what comes up first. Keep each one short
// enough to fit the font size in drawJournal — there's no
// truncation/scrolling.
const JOURNAL_ENTRIES = [
  "July 4.                 We could only see the bottom half of the fireworks. They lit up the fog in neon colors, which was a sight to see in itself. They were shot from the Golden Gate Bridge. I shared a Long Drink with Alex.",
  "July 5.                 Spent a lot of today languishing indoors. I visited the park breifly. I climbed every hill in this city and sat at the park for 20 minutes, sliding off the grassy hill trying to draw.",
  "July 6.                 Work today like every day. Monotony eating itself and my standing desk is broken. Met Xyan at the pottery studio and made and destroyed a face.",
  "July 8.                 Figure drawing tonight. Lovlier than I could have hoped for, though the first hour felt so miserable I almost slipped out on break. I met new friends and had the lovliest dinner.",
  "July 9.                 Worked from home. Have been making slide decks like lives depend on it.",
];

const APP_SIZE = 1; // app icon files were shrunk to match this exact display size

// Every image file has been pre-shrunk (by a build script) to the largest
// pixel size it's ever actually drawn at on the 1452x960 canvas — that's
// purely a load-time optimization (was 31.6MB total, now ~5MB). Since
// on-screen size = image's native pixels x scale, shrinking a file's native
// pixels means its scale had to be recalculated so the drawn size stays
// pixel-identical to before. Most became exactly 1 (their only usage is now
// the file's full size); a few non-1 values below are real, deliberately
// computed ratios for images reused at more than one size (e.g. a mug drawn
// smaller when carried) — they are not typos.
let images = {
  room_background: {
    path: "main_room/room_background.png", coordinates_by_percentage: [0, 0], scale: 1,
    children: [
      // Opens bedpopup — see the "BED MECHANIC" section further down for the
      // covers/quilt pull-down and scattered draggable objects.
      {
        id: "bed", path: "main_room/bed.png", coordinates_by_percentage: [11.3, 28], scale: 1, shake: true,
        children: [
          {
            // bedbase.png (and its siblings pillow/covers/quilt, all drawn by
            // drawBedScene rather than as ordinary `children`) were shrunk
            // with headroom (native 900x1201 for a ~675x901 on-screen size,
            // scale 0.75) rather than pixel-exact — a pixel-exact shrink is
            // what made fridge_pen.png (see PEN_SCALE further down) go blurry
            // once it needed to be drawn any bigger than its file's own native
            // size, so this leaves slack instead of cutting it that close.
            id: "bedpopup", path: "bed/bedbase.png",
            coordinates_by_percentage: [50, 50], scale: 0.75,
            do_dark_background: true,
          },
        ],
      },
      { path: "main_room/pattern.png", coordinates_by_percentage: [50.1, 8.5], scale: 1 },
      // Its only job is linking out to the "stuff to do" page — see the
      // calendar click handling in the mousedown listener further down.
      { path: "main_room/calendar.png", coordinates_by_percentage: [88, 8.1], scale: 1, shake: true },
      { path: "main_room/flowers.png", coordinates_by_percentage: [91.9, 23], scale: 1 },
      { path: "main_room/books.png", coordinates_by_percentage: [32.2, 45], scale: 1 },

      {
        path: "main_room/laptop.png", coordinates_by_percentage: [43, 14], scale: 1, shake: true,
        children: [
          {
            path: "computer/desktop.png", coordinates_by_percentage: [50, 50], scale: 1,
            do_dark_background: true,
            children: [
              {
                path: "computer/app_bank.png", coordinates_by_percentage: [48.4, 30.0], scale: APP_SIZE, shake: true,
                children: [
                  {
                    // The balance readout and PRESS button are baked into
                    // this art, not separate nodes — see the "BANK APP"
                    // section further down for how clicks on them work.
                    // bank_home.png was replaced with a cleaned-up-edges
                    // version at a different native resolution (837x1187 ->
                    // 660x964, and not quite the same aspect ratio) — 0.6124
                    // is the recomputed scale that keeps its on-screen
                    // footprint matching the old art as closely as a single
                    // uniform scale can (it's the average of the width-
                    // matching and height-matching ratios, ~1.5% off each).
                    id: "bank_home", path: "computer/bank_home.png",
                    coordinates_by_percentage: [50, 50], scale: 0.6124,
                    do_dark_background: true,
                    // Keeps these two templates from also rendering
                    // statically at their own placeholder coordinates
                    // whenever bank_home is open — they're only ever used
                    // as clone stencils for spawned dollar bills.
                    hide: ["dollar_template1", "dollar_template2"],
                    children: [
                      { id: "dollar_template1", path: "computer/dollar1.png", coordinates_by_percentage: [50, 50], scale: 0.242 },
                      { id: "dollar_template2", path: "computer/dollar2.png", coordinates_by_percentage: [50, 50], scale: 0.275 },
                    ],
                  },
                ],
              },
              { path: "computer/app_borders.png", coordinates_by_percentage: [65.7, 55.7], scale: APP_SIZE },
              {
                path: "computer/app_camera.png", coordinates_by_percentage: [66.8, 29.7], scale: APP_SIZE, shake: true,
                children: [
                  {
                    // "camera app background.png" was cropped/shrunk to match its
                    // full-size on-canvas display (1230x877, native was
                    // 1674x1194) — scale 0.76 is a deliberate 24% size-down from
                    // that on top (20% then another 5%), not a typo/stand-in for
                    // 1. See the "CAMERA APP" section further down for the photo
                    // carousel drawn on top of it (its layout rects are
                    // fractions of this node's own w/h, so they scale down with
                    // it automatically).
                    id: "cameraapp", path: "computer/camera app/camera app background.png",
                    coordinates_by_percentage: [50, 50], scale: 0.76,
                    do_dark_background: true,
                  },
                ],
              },
              {
                path: "computer/app_wizard.png", coordinates_by_percentage: [53.2, 48.5], scale: APP_SIZE, shake: true,
                children: [
                  {
                    // See the "WIZARD MINIGAME" section further down for how
                    // the falling pieces, score, and wizard cursor work —
                    // this node is just the game's background/play area.
                    // wizardgamebackground.png hasn't been through the
                    // pre-shrink pass the other images have (native
                    // 1006x1238), so 0.6 is a real, deliberately picked
                    // display scale, not a stand-in for 1.
                    id: "wizardgame", path: "wizard/wizardgamebackground.png",
                    coordinates_by_percentage: [50, 50], scale: 0.6,
                    do_dark_background: true,
                  },
                ],
              },
              // app_file.png is reused for multiple items, so its id must be given explicitly to avoid duplicates.
              { id: "app_file1", path: "computer/app_file.png", coordinates_by_percentage: [19.6, 30.2], scale: 1 },
              { id: "app_file2", path: "computer/app_file.png", coordinates_by_percentage: [19.6, 45.2], scale: 1 },
              { id: "app_file3", path: "computer/app_file.png", coordinates_by_percentage: [19.6, 60.2], scale: 1 },

              { path: "computer/alert_compromised_wizard.png", coordinates_by_percentage: [33.9, 68.0], scale: APP_SIZE },

              {
                path: "computer/app_affirmations.png", coordinates_by_percentage: [35.5, 30.4], scale: 1, shake: true,
                children: [
                  { path: "computer/affirmations_popup.png", coordinates_by_percentage: [10, 10], scale: 1 },
                ]
              },
            ]
          }
        ]
      },
      // test

      // journal.png hasn't been through the pre-shrink pass the other props
      // have (native 337x342), so 0.38 is a real, deliberately picked
      // display scale, not a stand-in for 1 — sized and placed by eye to
      // rest on the desk's left side, in front of the laptop. Clicking it
      // opens journalpopup — see the "JOURNAL MECHANIC" section further
      // down for how the entries/paper cycling work.
      {
        id: "journal", path: "journal/journal.png", coordinates_by_percentage: [43, 28], scale: 0.38, shake: true,
        children: [
          {
            // "journnal popup background.png" (typo is in the actual
            // filename) hasn't been pre-shrunk either (native 1056x921),
            // so 0.9 is a deliberately picked display scale.
            id: "journalpopup", path: "journal/journnal popup background.png",
            coordinates_by_percentage: [50, 50], scale: 0.9,
            do_dark_background: true,
          },
        ],
      },

      { path: "main_room/teapot.png", coordinates_by_percentage: [91.5, 40], scale: 1 },
      // Opens fridgepopup — see the "FRIDGE MECHANIC" section further down
      // for the magnets/drawer/notes that live inside it.
      {
        id: "notes", path: "main_room/notes.png", coordinates_by_percentage: [93.2, 35], scale: 1, shake: true,
        children: [
          {
            // fridgebackground.png is 924x743 native. scale 1.2919 (=960/743)
            // fills the canvas's full height exactly, so the top and bottom
            // edges are both flush — the resulting ~1194px width is then
            // right-aligned (center = canvas.width - width/2) rather than
            // centered, per the right/top/bottom flush placement asked for.
            id: "fridgepopup", path: "fridge/fridgebackground.png",
            coordinates_by_percentage: [58.9, 50], scale: 1.2919,
            do_dark_background: true,
          },
        ],
      },
      { path: "main_room/paper.png", coordinates_by_percentage: [34.0, 70.3], scale: 1 },
      // Opens laurenbryantart.com — see the "drawing" click handling in the
      // mousedown listener further down, same special-case pattern as the
      // calendar. Bounces (rather than shakes) to invite a click.
      { path: "main_room/drawing.png", coordinates_by_percentage: [52.7, 26], scale: 1, bounce: true },
      { path: "main_room/laundry.png", coordinates_by_percentage: [26, 29], scale: 1 },

      // Clicking the coffeemaker opens the coffee counter minigame — see
      // the "COFFEE MINIGAME" section further down for how it works.
      { path: "main_room/coffeemaker.png", coordinates_by_percentage: [83.5, 18.7], scale: 1, shake: true, children: [
        {
          // The coffee minigame code below keys off this id — the file is
          // "newnewcounter.png" so it needs to be set explicitly rather
          // than relying on the filename-derived default.
          id: "coffeecounter",
          path: "coffeemaker/newnewcounter.png",
          // Positioned so its right and bottom edges sit flush against the
          // canvas's right and bottom edges (center = canvas edge minus half
          // the scaled image size), rather than centered like other popups.
          // Was 4461x3326 native; the file's been shrunk to match its
          // on-canvas size exactly (1236x921), so scale is now 1.
          coordinates_by_percentage: [57.45, 52.02], scale: 1,
          do_dark_background: true,
        },
      ] },
    ]
  }
};

const root = images.room_background;

// A node's id defaults to its file name (without extension). Nodes that
// reuse the same file (e.g. the app_file popups) must set `id` explicitly
// to avoid colliding.
function idFromPath(path) {
  const filename = path.split("/").pop();
  return filename.replace(/\.[^.]+$/, "");
}

// Fill in defaults (id/children/hide) and resolve the image path, walking
// the whole tree.
const IMAGES_FOLDER = "images/";
function normalize(node) {
  if (node.id === undefined) node.id = idFromPath(node.path);
  if (node.children === undefined) node.children = [];
  if (node.hide === undefined) node.hide = [];
  if (node.do_dark_background === undefined) node.do_dark_background = false;
  if (node.shake === undefined) node.shake = false;
  if (node.bounce === undefined) node.bounce = false;
  node.path = IMAGES_FOLDER + node.path;
  node.children.forEach(normalize);
}

normalize(root);





function findNodeById(node, id) {
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
}

const desktopNode = findNodeById(root, "desktop");
const calendarNode = findNodeById(root, "calendar");
const drawingNode = findNodeById(root, "drawing");
const alertNode = findNodeById(root, "alert_compromised_wizard");
const fridgeNode = findNodeById(root, "fridgepopup");
const bedNode = findNodeById(root, "bedpopup");

// -------------------- FONTS --------------------

const handwritingFont = new FontFace("Handwriting", "url(fonts/handwriting.ttf)");
handwritingFont.load()
  .then((font) => document.fonts.add(font))
  .catch((err) => pushError(`Failed to load handwriting font: ${err.message}`));

// -------------------- POPUP TREE --------------------
// The room itself is just the first thing shown — `openPath` is the
// permanent base of the popup chain (index 0: room_background), never
// popped. Clicking a node with children pushes those children onto the
// chain (e.g. clicking the laptop reveals the desktop popup). Every
// layer opened so far stays visible — opening a new popup does not hide
// the ones already open — so every layer's children stay part of the scene,
// not just the most recent one. A node's `hide` list removes specific ids
// from that set while the node is showing.
// Clicking outside the most-recently-opened popup's bounds pops back one
// level — same rule at every depth. Exception: nodes spawned by
// spawnRandomPopup (affirmation popups, dollar bills) are marked `stacked` —
// clicking anywhere outside the desktop while any of those are on top pops
// all of them at once instead of just one (see the mousedown handler),
// since one-by-one would otherwise take as many clicks as there are popups
// to get back out.

let openPath = [root];

function collectHiddenIds() {
  const hidden = new Set();
  const addHides = (node) => node.hide.forEach((id) => hidden.add(id));

  openPath.forEach((node) => {
    addHides(node);
    node.children.forEach(addHides);
  });

  return hidden;
}

function closePopup() {
  if (openPath.length > 1) openPath.pop(); // room_background can't be popped
}

// -------------------- CANVAS --------------------

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1452;
canvas.height = 960;

let mouseX = 0;
let mouseY = 0;

// When true, clicking the canvas copies the click's [x%, y%] (percentage of
// the canvas's width/height, rounded to 1 decimal) to the clipboard instead
// of opening/closing popups — handy for reading off
// `coordinates_by_percentage` values.
const CLICK_TO_SHOW_COORDINATES = false;

// -------------------- ERROR SYSTEM --------------------

let errors = [];

function pushError(msg) {
  console.warn("[Captured Error]", msg);
  errors.push(String(msg));
  if (errors.length > 8) errors.shift();
}

window.onerror = function (message, source, lineno, colno) {
  pushError(`${message} (${lineno}:${colno})`);
  return true;
};

window.onunhandledrejection = function (event) {
  pushError(event.reason?.message || String(event.reason));
  return true;
};

function safeTry(label, fn) {
  try {
    return fn();
  } catch (err) {
    pushError(`${label}: ${err.message || err}`);
  }
}

// -------------------- IMAGE LOADING --------------------
// One Image per unique `id`, shared across nodes — the three app_file
// nodes all share id "app_file", so it's only fetched once.

function loadImages(node, cache = {}) {
  if (!cache[node.id]) {
    const img = new Image();

    img.onload = () => {};
    img.onerror = () => {
      pushError(`Missing image: ${node.path}`);
    };

    img.src = node.path;
    cache[node.id] = img;
  }

  node.img = cache[node.id];
  node.children.forEach((child) => loadImages(child, cache));
}

loadImages(root);

// -------------------- SOUND EFFECTS --------------------
// One Audio per unique file, fetched once and replayed from the start each
// time (rather than a fresh `new Audio()` per play) — these effects are
// short and never intentionally overlap themselves, so resetting
// currentTime is enough.

const SOUND_FOLDER = "soundeffects/";
const soundCache = {};

// Plain HTMLMediaElement.volume tops out at 1 (its recorded level), so a
// sound that still reads as too quiet at full volume needs actual gain, not
// just a volume tweak — routed through Web Audio for whichever filenames are
// listed here. Shakeshake reads as quiet next to the room's other effects,
// so it gets a genuine 30% boost past its recorded level.
const SOUND_VOLUME_BOOST = {
  Shakeshake: 1.3,
};
let audioContext = null;

function loadSound(filename) {
  if (!soundCache[filename]) {
    const audio = new Audio(`${SOUND_FOLDER}${filename}.mp3`);
    audio.onerror = () => pushError(`Missing sound: ${SOUND_FOLDER}${filename}.mp3`);
    soundCache[filename] = audio;

    const boost = SOUND_VOLUME_BOOST[filename];
    if (boost) {
      safeTry(`sound boost: ${filename}`, () => {
        if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const gain = audioContext.createGain();
        gain.gain.value = boost;
        audioContext.createMediaElementSource(audio).connect(gain).connect(audioContext.destination);
      });
    }
  }
  return soundCache[filename];
}

function playSound(filename) {
  safeTry(`sound: ${filename}`, () => {
    const audio = loadSound(filename);
    audio.currentTime = 0;
    audio.play().catch((err) => pushError(`Sound playback failed: ${filename} (${err.message})`));
  });
}

// -------------------- COORDINATES --------------------
// `coordinates_by_percentage` normally points at the CENTER of a node's image. The one
// exception is [0, 0] — used by room_background to sit flush in the
// top-left corner — which is treated as the image's top-left corner
// instead of being centered on the origin.

function topLeftFor(coordinates_by_percentage, w, h) {
  const [xPct, yPct] = coordinates_by_percentage;
  if (xPct === 0 && yPct === 0) return { x: 0, y: 0 };
  const cx = (xPct / 100) * canvas.width;
  const cy = (yPct / 100) * canvas.height;
  return { x: cx - w / 2, y: cy - h / 2 };
}

// -------------------- SAFE DRAW --------------------

// A small idle wobble for marking specific clickable things as
// interactive — not tied to the popup tree, so it works for any drawn
// thing (a tree node's `shake: true`, or a one-off custom-drawn sprite like
// the coffee machine) as long as you pass it a stable id. Each id gets its
// own phase offset (from the characters in the id) so multiple shaking
// things don't wobble in lockstep.
const SHAKE_MAX_DEGREES = 3;
const SHAKE_PERIOD_MS = 1600;
// maxDegrees/periodMs default to the idle "look at me" wobble above, but a
// caller can pass its own (e.g. the coffee machine's much quicker brewing
// vibration further down) to get a differently-paced shake using this same
// per-id phase-offset trick.
function shakeAngleRadians(id, maxDegrees = SHAKE_MAX_DEGREES, periodMs = SHAKE_PERIOD_MS) {
  const phase = [...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const t = (performance.now() + phase * 137) / periodMs;
  return (Math.sin(t * Math.PI * 2) * maxDegrees * Math.PI) / 180;
}

// Same "bounce bounce ... pause" idle idea as the fridge drawer
// (fridgeDrawerBounceOffsetY) — two quick up-and-back-down pops,
// BOUNCE_GAP_MS apart, then a long pause before the pair repeats — but
// reusable for any node marked `bounce: true`, with the same per-id phase
// offset trick as shakeAngleRadians so multiple bouncing things don't move
// in lockstep.
const BOUNCE_PERIOD_MS = 1900;
const BOUNCE_PULSE_MS = 260;
const BOUNCE_GAP_MS = 160;
const BOUNCE_HEIGHT_PX = 8;
function bounceOffsetY(id) {
  const phase = [...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const t = (performance.now() + phase * 137) % BOUNCE_PERIOD_MS;
  const secondPulseStart = BOUNCE_PULSE_MS + BOUNCE_GAP_MS;

  let pulseT = -1;
  if (t < BOUNCE_PULSE_MS) pulseT = t;
  else if (t >= secondPulseStart && t < secondPulseStart + BOUNCE_PULSE_MS) pulseT = t - secondPulseStart;
  if (pulseT < 0) return 0; // the pause between pairs

  return -Math.sin((pulseT / BOUNCE_PULSE_MS) * Math.PI) * BOUNCE_HEIGHT_PX;
}

function safeDrawImage(img, coordinates_by_percentage, scale, label, rotationRadians = 0, offsetY = 0) {
  try {
    if (!img) return;
    if (!img.complete || img.naturalWidth === 0) return;

    const w = img.width * scale;
    const h = img.height * scale;
    const { x, y } = topLeftFor(coordinates_by_percentage, w, h);

    if (rotationRadians) {
      ctx.save();
      ctx.translate(x + w / 2, y + h / 2 + offsetY);
      ctx.rotate(rotationRadians);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    } else {
      ctx.drawImage(img, x, y + offsetY, w, h);
    }
  } catch (err) {
    pushError(`drawImage failed: ${label} (${err.message})`);
  }
}

// -------------------- ERROR BOX --------------------

function drawErrors() {
  if (!errors.length) return;

  const boxX = 20;
  const boxY = 20;
  const boxW = canvas.width - 40;
  const padding = 14;
  const lineH = 18;

  const boxH = errors.length * lineH + padding * 2 + 30;

  ctx.fillStyle = "rgba(200, 0, 0, 0.92)";
  ctx.fillRect(boxX, boxY, boxW, boxH);

  ctx.strokeStyle = "rgba(0,0,0,0.6)";
  ctx.lineWidth = 2;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  ctx.fillStyle = "white";
  ctx.font = "bold 14px monospace";
  ctx.fillText("⚠ ERRORS", boxX + padding, boxY + 20);

  ctx.font = "13px monospace";

  errors.forEach((err, i) => {
    const y = boxY + 45 + i * lineH;

    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(boxX + 8, y - 12, boxW - 16, lineH);

    ctx.fillStyle = "white";
    ctx.fillText(`• ${err}`, boxX + padding, y);
  });
}

// -------------------- CLICK DETECTION --------------------
// Every currently visible child is clickable — at the base level that's
// room_background's children (bed, laptop, ...), same rule used again for
// desktop's children (app_bank, app_file, ...), all shown together.
// A node is only clickable if it has children to reveal.

// Clicking app_affirmations (or the bank's PRESS button) doesn't reveal a
// template child directly — it clones a random one of `templates` at a
// random position inside `container`'s bounds, so every click stacks a
// brand new, independent popup on top of whatever's already there. `extra`
// gets merged in for any per-feature bits (affirmations attach `text`;
// dollar bills need nothing extra).
function spawnRandomPopup(container, templates, extra = {}) {
  const template = templates[Math.floor(Math.random() * templates.length)];

  const w = template.img.width * template.scale;
  const h = template.img.height * template.scale;

  const cw = container.img.width * container.scale;
  const ch = container.img.height * container.scale;
  const { x: cx, y: cy } = topLeftFor(container.coordinates_by_percentage, cw, ch);

  // Keep spawned popups off the container's edges by a 5% margin on each side.
  const marginX = cw * 0.05;
  const marginY = ch * 0.05;

  const minX = cx + marginX;
  const minY = cy + marginY;
  const maxX = cx + cw - marginX - w;
  const maxY = cy + ch - marginY - h;

  const topLeftX = minX + Math.random() * Math.max(0, maxX - minX);
  const topLeftY = minY + Math.random() * Math.max(0, maxY - minY);

  // coordinates_by_percentage store the CENTER, so convert the chosen top-left box back
  // (and from pixels into a percentage of the canvas's width/height).
  const x = topLeftX + w / 2;
  const y = topLeftY + h / 2;
  const xPct = (x / canvas.width) * 100;
  const yPct = (y / canvas.height) * 100;

  return {
    // A unique id per spawned clone, not the template's own id — bank_home
    // hides its templates by id (dollar_template1/2) so they don't also
    // render statically at their placeholder spot, and reusing the
    // template's id here would make every spawned dollar bill invisible too.
    id: `${template.id}-${Math.random().toString(36).slice(2)}`,
    path: template.path,
    img: template.img,
    coordinates_by_percentage: [xPct, yPct],
    scale: template.scale,
    children: [],
    hide: [],
    // Marks this as one of a pile of clones stacking on the desktop, so a
    // click outside the desktop can clear the whole pile at once — see the
    // note above `openPath`.
    stacked: true,
    ...extra,
  };
}

// Wraps `text` to fit within `maxWidth`, breaking on word boundaries.
function wrapText(text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });

  if (line) lines.push(line);
  return lines;
}

// Draws a popup's affirmation text, inset 30px from the popup's top and
// bottom edges and centered (both horizontally and within that inset band).
function drawAffirmationText(node) {
  const w = node.img.width * node.scale;
  const h = node.img.height * node.scale;
  const { x, y } = topLeftFor(node.coordinates_by_percentage, w, h);
  const margin = 30;

  ctx.save();
  ctx.fillStyle = "black";
  ctx.font = "26px Handwriting, cursive";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const lines = wrapText(node.text, w - margin * 2);
  const lineHeight = 30;
  const bandTop = y + margin;
  const bandHeight = h - margin * 2;
  const startY = bandTop + Math.max(0, (bandHeight - lines.length * lineHeight) / 2) + lineHeight / 2;

  lines.forEach((line, i) => ctx.fillText(line, x + w / 2, startY + i * lineHeight));

  ctx.restore();
}

// -------------------- BANK APP --------------------
// bank_home is a single static image with two "hot" spots baked into the
// art (the balance readout and the PRESS button) rather than separate
// clickable nodes — so, like the coffee counter, it needs a little custom
// handling instead of relying on the generic popup-tree clicks. Both rects
// are fractions (0-1) of bank_home's own width/height, so they still line
// up correctly if bank_home's position/scale ever changes.
const BANK_BALANCE_RECT = { xMin: 0.173, xMax: 0.881, yMin: 0.365, yMax: 0.504 };
const BANK_PRESS_RECT = { xMin: 0.305, xMax: 0.771, yMin: 0.754, yMax: 0.876 };

let bankBalance = 0;

function randomBankBalance() {
  return Math.floor(Math.random() * 1999999) - 999999; // -999,999 to 999,999
}

function bankHomeRect(bankHomeNode) {
  const w = bankHomeNode.img.width * bankHomeNode.scale;
  const h = bankHomeNode.img.height * bankHomeNode.scale;
  const { x, y } = topLeftFor(bankHomeNode.coordinates_by_percentage, w, h);
  return { x, y, w, h };
}

function isWithinLocalRect(rect, bx, by, bw, bh, x, y) {
  return (
    x >= bx + rect.xMin * bw && x <= bx + rect.xMax * bw &&
    y >= by + rect.yMin * bh && y <= by + rect.yMax * bh
  );
}

// Draws the current balance centered in the balance box, in the same
// handwriting font the affirmation popups use.
function drawBankBalance(bankHomeNode) {
  const { x, y, w, h } = bankHomeRect(bankHomeNode);
  const cx = x + ((BANK_BALANCE_RECT.xMin + BANK_BALANCE_RECT.xMax) / 2) * w;
  const cy = y + ((BANK_BALANCE_RECT.yMin + BANK_BALANCE_RECT.yMax) / 2) * h;

  ctx.save();
  ctx.fillStyle = "black";
  ctx.font = "34px Handwriting, cursive";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(bankBalance.toLocaleString("en-US"), cx, cy);
  ctx.restore();
}

// Returns true if the click hit the PRESS button: balance goes up by one,
// and a random dollar bill spawns and stacks on the screen, the same
// "clone a random template somewhere random" trick app_affirmations uses.
function handleBankPressClick(bankHomeNode, x, y) {
  const { x: bx, y: by, w: bw, h: bh } = bankHomeRect(bankHomeNode);
  if (!isWithinLocalRect(BANK_PRESS_RECT, bx, by, bw, bh, x, y)) return false;

  bankBalance += 1;
  const dollarTemplates = bankHomeNode.children.filter((c) => c.id.startsWith("dollar_template"));
  openPath.push(spawnRandomPopup(desktopNode, dollarTemplates));
  return true;
}

function hitTest(node, x, y) {
  const w = node.img.width * node.scale;
  const h = node.img.height * node.scale;
  const { x: nx, y: ny } = topLeftFor(node.coordinates_by_percentage, w, h);
  return x >= nx && x <= nx + w && y >= ny && y <= ny + h;
}

// Walk the popup chain from the topmost layer down. Each layer's own image
// (or, for a `do_dark_background` layer, its full-canvas dim overlay) covers
// whatever is beneath it — so a layer blocks lower layers from being hit
// once the click misses all of that layer's own clickable children (e.g. the
// laptop must stop being clickable once the desktop is open on top of it).
function getClickableNodeAt(x, y) {
  const hidden = collectHiddenIds();

  for (let i = openPath.length - 1; i >= 0; i--) {
    const node = openPath[i];
    const children = node.children.filter((child) => !hidden.has(child.id));

    for (let j = children.length - 1; j >= 0; j--) {
      const child = children[j];
      if (!child.img || child.children.length === 0) continue;
      if (hitTest(child, x, y)) return child;
    }

    if (node.do_dark_background) return null;
    if (i > 0 && node.img && hitTest(node, x, y)) return null;
  }

  return null;
}

// -------------------- COFFEE MINIGAME --------------------
// This whole minigame is one mechanic reused four times: click a moveable
// thing (a mug, the carafe once it's brewed, the milk, the whip) to pick it
// up — it then follows the mouse — and click again to set it down wherever
// you clicked. Setting a "tool" (carafe/milk/whip) down exactly on a mug in
// the right state also applies its effect to that mug; otherwise the tool
// just rests at the spot you clicked, ready to be picked up again. Nothing
// here plugs into the generic popup-tree engine above — like
// app_affirmations, it's simple enough to special-case by id instead.

// yellowmug's filled versions are named "yellowcup_..." rather than
// "yellowmug_...", so that's spelled out explicitly here rather than
// derived from the mug's own name.
const MUG_STAGES = {
  papercup: { coffee: "papercup_coffee", coffee_milk: "papercup_coffee_milk" },
  greenmug: { coffee: "greenmug_coffee", coffee_milk: "greenmug_coffee_milk" },
  redmug: { coffee: "redmug_coffee", coffee_milk: "redmug_coffee_milk" },
  wavymug: { coffee: "wavymug_coffee", coffee_milk: "wavymug_coffee_milk" },
  yellowmug: { coffee: "yellowcup_coffee", coffee_milk: "yellowcup_coffee_milk" },
};

const COFFEE_FOLDER = IMAGES_FOLDER + "coffeemaker/";

// One Image per unique coffee-related file, fetched once and reused.
const coffeeImageCache = {};
function coffeeImage(filename) {
  if (!coffeeImageCache[filename]) {
    const img = new Image();
    img.onerror = () => pushError(`Missing image: ${COFFEE_FOLDER}${filename}.png`);
    img.src = `${COFFEE_FOLDER}${filename}.png`;
    coffeeImageCache[filename] = img;
  }
  return coffeeImageCache[filename];
}

// Every mug state (empty/coffee/coffee_milk) is only ever requested the
// first time a mug actually reaches that state — so without this, clicking
// a mug right after it changes state could momentarily miss, because its
// hitbox is sized from an image that hasn't finished loading yet. Loading
// everything up front avoids that, the same way loadImages() does for the
// rest of the room.
[
  "coffeemachine_carafe_empty", "coffeemachine_carafe_full", "coffeemachine_nocarafe",
  "carafe_pouring", "topping_oatmilk", "topping_brownsugarcreamer", "topping_whip", "topping_cinnamon",
  "topping_output_whippedcream", "topping_output_cinnamon",
  ...Object.keys(MUG_STAGES).flatMap((mugType) => [mugType, MUG_STAGES[mugType].coffee, MUG_STAGES[mugType].coffee_milk]),
].forEach(coffeeImage);

// Every mug on the counter, plus the milk/creamer and whip/cinnamon
// toppings. Each has its own position (so it can be picked up and set down
// anywhere). Mug spots were hand-tuned with the coordinate-copy trick —
// don't change those — the topping spots are still a best guess.
// A mug's `topping` is null, "whip", or "cinnamon" (only one at a time).
// scale is 1 on all of these — each image file was shrunk to match its
// on-counter display size exactly (see the note above `images`).
let coffeeItems = [
  { kind: "mug", mugType: "papercup", state: "empty", topping: null, coordinates_by_percentage: [38, 28], scale: 1, pickedUp: false },
  { kind: "mug", mugType: "greenmug", state: "empty", topping: null, coordinates_by_percentage: [28, 45], scale: 1, pickedUp: false },
  { kind: "mug", mugType: "redmug", state: "empty", topping: null, coordinates_by_percentage: [35, 65], scale: 1, pickedUp: false },
  { kind: "mug", mugType: "wavymug", state: "empty", topping: null, coordinates_by_percentage: [47, 70], scale: 1, pickedUp: false },
  { kind: "mug", mugType: "yellowmug", state: "empty", topping: null, coordinates_by_percentage: [40, 44], scale: 1, pickedUp: false },
  { kind: "milk", coordinates_by_percentage: [77, 40], scale: 1 },
  { kind: "creamer", coordinates_by_percentage: [90, 63], scale: 1 },
  { kind: "whip", coordinates_by_percentage: [87, 40], scale: 1 },
  { kind: "cinnamon", coordinates_by_percentage: [78, 65], scale: 1 },
];

// Toppings (not mugs) snap back to this starting spot once they're
// successfully used on a mug, so the counter resets itself instead of
// toppings piling up wherever they were last used.
coffeeItems.forEach((item) => {
  if (item.kind !== "mug") item.home = item.coordinates_by_percentage;
});

// Mugs and toppings can only be set down on the counter's actual top
// surface, not anywhere in the popup — otherwise a mug could end up
// floating over the backsplash. Bounds are the 4 corners Lauren measured
// with the coordinate-copy trick (they were slightly inconsistent corner to
// corner, so this is the more generous reading of each side rather than
// the tightest one).
const COUNTER_TOP_BOUNDS = {
  xMin: (24.9 / 100) * canvas.width,
  xMax: (99.9 / 100) * canvas.width,
  yMin: (30.7 / 100) * canvas.height,
  yMax: (85.7 / 100) * canvas.height,
};
// Allows the placement as long as the item's own footprint (given its
// center at x, y) overlaps the counter top at all — not just its exact
// center point. That way a mug resting right at the edge (its bottom
// touching the top boundary, or its side touching the left boundary) can
// still be set down, instead of being rejected just because its center
// happens to fall outside the line.
function overlapsCounterTop(x, y, w, h) {
  const left = x - w / 2;
  const right = x + w / 2;
  const top = y - h / 2;
  const bottom = y + h / 2;
  return (
    right >= COUNTER_TOP_BOUNDS.xMin && left <= COUNTER_TOP_BOUNDS.xMax &&
    bottom >= COUNTER_TOP_BOUNDS.yMin && top <= COUNTER_TOP_BOUNDS.yMax
  );
}

// "empty" -> waiting to brew. "brewing" -> mid-brew, machine not clickable.
// "full" -> ready to pick up and pour. "nocarafe" -> the carafe is out and
// about (held) so the machine itself does nothing until that carafe gets
// poured into a mug and disappears.
let machineState = "empty";
// The machine shakes to show a first-time visitor where to click — once
// they've clicked it (see handleCoffeeCounterClick), it stops for good.
let machineDiscovered = false;
// One shared position + size for the machine, however it currently looks —
// change these two and every state (empty/brewing/full/nocarafe) moves and
// resizes together, since they all share this same footprint.
const MACHINE_COORDS = [57.25, 40];
const MACHINE_SCALE = 1; // machine images were shrunk to match this display size
const CARAFE_SCALE = 1; // carafe_pouring.png was shrunk to match this display size
const BREW_TIME_MS = 2500;
// While brewing, the machine vibrates instead of the slow idle wobble above —
// much tighter/quicker (smaller angle, much shorter period) so it reads as
// the machine working rather than "click me".
const BREWING_SHAKE_MAX_DEGREES = 1.5;
const BREWING_SHAKE_PERIOD_MS = 180;

// Milk and creamer both just move a mug from "coffee" to "coffee_milk" —
// two different toppings with the same effect. Whip and cinnamon both sit
// as a dusting/dollop drawn on top of the mug. Since the mugs' rims are all
// different shapes/sizes, each topping's placement is tuned per mug type
// below (rather than needing a hand-drawn combo image for every mug) —
// `default` is used for any mug type that doesn't have its own entry.
// Nudge a mug's `offsetX`/`offsetY` (canvas pixels, from the mug's own
// center/top) directly to fix that mug's whipped cream or cinnamon —
// `scale` is a resize-compensation ratio (see the note above `images`), not
// a free tuning knob: topping_output_whippedcream.png and
// topping_output_cinnamon.png were each shrunk to match their single
// largest usage below (redmug's whip, and the mug-specific cinnamon
// entries), so that entry reads 1 and the rest are that file's other
// on-screen sizes relative to it — don't "round them to 1", they're correct
// as different numbers.
const MILK_LIKE = ["milk", "creamer"];
const TOPPING_LIKE = ["whip", "cinnamon"];
const TOPPING_STYLE = {
  whip: {
    image: "topping_output_whippedcream",
    default: { scale: 0.896552, offsetX: 0, offsetY: -45 },
    papercup: { scale: 0.896552, offsetX: 0, offsetY: -45 },
    greenmug: { scale: 0.896552, offsetX: 0, offsetY: -45 },
    redmug: { scale: 1, offsetX: -17, offsetY: -28 },
    wavymug: { scale: 0.896552, offsetX: 0, offsetY: -45 },
    yellowmug: { scale: 0.896552, offsetX: 0, offsetY: -45 },
  },
  cinnamon: {
    image: "topping_output_cinnamon",
    default: { scale: 0.933333, offsetX: 0, offsetY: -11 },
    papercup: { scale: 1, offsetX: 0, offsetY: 20 },
    greenmug: { scale: 1, offsetX: 0, offsetY: 20 },
    redmug: { scale: 1, offsetX: -15, offsetY: 25 },
    wavymug: { scale: 1, offsetX: 0, offsetY: 9 },
    yellowmug: { scale: 1, offsetX: 0, offsetY: 8 },
  },
};

// While held, milk/creamer/whip/cinnamon tilt like they're being poured.
// Positive = tips clockwise, negative = tips counter-clockwise — creamer and
// cinnamon are drawn facing the opposite way from milk and whip, so they
// need the opposite sign to still look like they're pouring correctly.
const TOPPING_TILT_DEGREES = { milk: 25, creamer: -25, whip: 25, cinnamon: -25 };

// Whichever mug you last poured coffee into, added a topping to, or picked
// up while it already had coffee in it — that mug then follows the cursor
// everywhere outside the coffee counter itself, like you're carrying it
// around the room. CARRIED_MUG_SCALE controls how big it looks; the offset
// keeps it from sitting directly under (and blocking) the cursor.
let lastCoffeeMug = null;
// Mug files were shrunk to match their on-counter size (scale 1 there);
// carrying them smaller now means 0.15 of the ORIGINAL size is
// 0.15 / 0.32 = 0.46875 of the shrunk file.
const CARRIED_MUG_SCALE = 0.46875;
const CARRIED_MUG_OFFSET = { x: 26, y: -34 };

// Double-clicking anywhere in the main room (not inside any popup/minigame —
// see the dblclick listener further down) sets the carried mug down at that
// spot instead of it following the cursor — it then just sits there as a
// fixed room prop, same scale as while it was carried. Only one mug can be
// set down at a time; setting down again (or picking up a fresh one at the
// coffee counter) replaces whichever was there before.
let placedMug = null; // { kind: "mug", mugType, state, topping, scale, x, y } — x/y are canvas pixels (center)

function setDownCarriedMug(x, y) {
  if (!lastCoffeeMug) return;
  placedMug = { kind: "mug", mugType: lastCoffeeMug.mugType, state: lastCoffeeMug.state, topping: lastCoffeeMug.topping, scale: lastCoffeeMug.scale, x, y };
  lastCoffeeMug = null;
}

// Whichever coffeeItems entry is currently stuck to the mouse. Null when
// nothing is held.
let heldItem = null;

function machineImagePath() {
  if (machineState === "nocarafe") return "coffeemachine_nocarafe";
  if (machineState === "full") return "coffeemachine_carafe_full";
  return "coffeemachine_carafe_empty"; // "empty" and "brewing" look the same
}

function itemImagePath(item) {
  if (item.kind === "mug") return item.state === "empty" ? item.mugType : MUG_STAGES[item.mugType][item.state];
  if (item.kind === "milk") return "topping_oatmilk";
  if (item.kind === "creamer") return "topping_brownsugarcreamer";
  if (item.kind === "whip") return "topping_whip";
  if (item.kind === "cinnamon") return "topping_cinnamon";
  return "carafe_pouring"; // item.kind === "carafe"
}

function coffeeItemRect(item) {
  const img = coffeeImage(itemImagePath(item));
  const w = img.width * item.scale;
  const h = img.height * item.scale;
  const { x, y } = topLeftFor(item.coordinates_by_percentage, w, h);
  return { img, x, y, w, h };
}

function hitTestItem(item, x, y) {
  const { x: ix, y: iy, w, h } = coffeeItemRect(item);
  return x >= ix && x <= ix + w && y >= iy && y <= iy + h;
}

function hitTestMachine(x, y) {
  const img = coffeeImage(machineImagePath());
  const w = img.width * MACHINE_SCALE;
  const h = img.height * MACHINE_SCALE;
  const { x: mx, y: my } = topLeftFor(MACHINE_COORDS, w, h);
  return x >= mx && x <= mx + w && y >= my && y <= my + h;
}

function pixelsToPercentage(x, y) {
  return [(x / canvas.width) * 100, (y / canvas.height) * 100];
}

// Cancels whatever's currently held so the counter (and the popup) can still
// be left even when there's nowhere left to actually place it — e.g. the
// carafe once every mug already has coffee in it, which placeHeldItem below
// will never accept. The carafe returns to the machine (full again, ready to
// pour once a mug frees up); anything else just snaps back to its own home
// spot, the same place it'd end up dropping it off-counter.
function cancelHeldItem() {
  const item = heldItem;
  if (item.kind === "carafe") {
    coffeeItems = coffeeItems.filter((i) => i !== item);
    machineState = "full";
  } else {
    item.coordinates_by_percentage = item.home;
  }
  heldItem = null;
}

// Sets whatever's held down at (x, y). If it lands on a mug in the right
// state, the effect (pour coffee / add milk / add whip) applies — and on
// success, milk/creamer/whip/cinnamon teleport back to their own starting
// spot on the counter rather than staying where they were used. Missing the
// target still drops them exactly where you clicked (no snapping back) as
// long as that's actually on the counter top — clicking off the counter
// (or holding the carafe with no valid mug) just leaves the item stuck to
// the mouse instead.
function placeHeldItem(x, y) {
  const item = heldItem;

  const targetMug = coffeeItems.find(
    (other) => other !== item && other.kind === "mug" && hitTestItem(other, x, y)
  );

  if (item.kind === "carafe") {
    if (targetMug && targetMug.state === "empty") {
      targetMug.state = "coffee";
      coffeeItems = coffeeItems.filter((i) => i !== item);
      machineState = "empty";
      heldItem = null;
      lastCoffeeMug = targetMug;
      playSound("Pouring water");
    }
    return; // no valid mug: stays held, nothing more to do
  }

  let applied = false;
  if (targetMug) {
    if (MILK_LIKE.includes(item.kind) && targetMug.state === "coffee") {
      targetMug.state = "coffee_milk";
      applied = true;
      playSound("Water to water 3");
    }
    if (TOPPING_LIKE.includes(item.kind) && targetMug.state !== "empty") {
      targetMug.topping = item.kind;
      applied = true;
      if (item.kind === "cinnamon") playSound("Shakeshake");
      if (item.kind === "whip") playSound("Whipped cream");
    }
    if (applied) lastCoffeeMug = targetMug;
  }

  if (applied) {
    item.coordinates_by_percentage = item.home;
    heldItem = null;
    return;
  }

  const img = coffeeImage(itemImagePath(item));
  const w = img.width * item.scale;
  const h = img.height * item.scale;
  if (!overlapsCounterTop(x, y, w, h)) return; // off the counter top: stays held

  item.coordinates_by_percentage = pixelsToPercentage(x, y);
  heldItem = null;
}

// Returns true once it's handled the click, so the generic click logic
// further down knows to do nothing else.
function handleCoffeeCounterClick(x, y) {
  if (heldItem) {
    placeHeldItem(x, y);
    return true;
  }

  if (hitTestMachine(x, y)) {
    machineDiscovered = true; // stop shaking now that the user found it
    if (machineState === "empty") {
      machineState = "brewing";
      playSound("Coffee machine 4 (yes)");
      setTimeout(() => {
        if (machineState === "brewing") machineState = "full";
      }, BREW_TIME_MS);
    } else if (machineState === "full") {
      const carafeItem = { kind: "carafe", coordinates_by_percentage: [...MACHINE_COORDS], scale: CARAFE_SCALE };
      coffeeItems.push(carafeItem);
      heldItem = carafeItem;
      machineState = "nocarafe";
    }
    return true;
  }

  for (const item of coffeeItems) {
    if (hitTestItem(item, x, y)) {
      heldItem = item;
      // Picking up a mug that already has coffee in it counts as
      // "interacting with your coffee" too, not just pouring/topping it.
      if (item.kind === "mug" && item.state !== "empty") lastCoffeeMug = item;
      // The clink only plays the first time each specific mug gets chosen —
      // picking the same one up again later (to carry it, refill it, etc.)
      // stays quiet. Skipped entirely for papercup — it's paper, not glass,
      // so the clink doesn't make sense for it.
      if (item.kind === "mug" && !item.pickedUp && item.mugType !== "papercup") {
        item.pickedUp = true;
        playSound("Glasses clinking");
      }
      return true;
    }
  }

  return false; // clicked empty counter space with nothing held — no-op
}

// Draws a mug's whip/cinnamon dusting on top of it, using that topping's
// own independent size + offset for this specific mug type (not the mug's
// own scale) — (x, y, w, h) is wherever the mug itself was just drawn, held
// or resting. `sizeRatio` shrinks the topping to match a mug drawn smaller
// than its usual counter size (see drawCarriedMug).
function drawMugTopping(mug, x, y, w, h, sizeRatio = 1) {
  if (!mug.topping) return;
  const topping = TOPPING_STYLE[mug.topping];
  const style = topping[mug.mugType] || topping.default;
  const img = coffeeImage(topping.image);
  if (!img.complete || img.naturalWidth === 0) return;
  const toppingW = img.width * style.scale * sizeRatio;
  const toppingH = img.height * style.scale * sizeRatio;
  ctx.drawImage(
    img,
    x + w / 2 - toppingW / 2 + style.offsetX * sizeRatio,
    y + style.offsetY * sizeRatio,
    toppingW,
    toppingH
  );
}

// The last mug you interacted with (see lastCoffeeMug above) follows the
// cursor everywhere except while the coffee counter itself is open — there,
// it's already visible sitting on the counter, so drawing it twice would
// just look broken — and while the wizard game is open, where the wizard
// sprite is the cursor companion instead.
function drawCarriedMug() {
  if (!lastCoffeeMug) return;
  if (openPath[openPath.length - 1].id === "coffeecounter") return;
  if (openPath[openPath.length - 1].id === "wizardgame") return;

  const img = coffeeImage(itemImagePath(lastCoffeeMug));
  if (!img.complete || img.naturalWidth === 0) return;

  const w = img.width * CARRIED_MUG_SCALE;
  const h = img.height * CARRIED_MUG_SCALE;
  const x = mouseX + CARRIED_MUG_OFFSET.x;
  const y = mouseY + CARRIED_MUG_OFFSET.y;

  ctx.drawImage(img, x, y, w, h);
  drawMugTopping(lastCoffeeMug, x, y, w, h, CARRIED_MUG_SCALE / lastCoffeeMug.scale);
}

// Draws the mug set down via setDownCarriedMug, centered on wherever it was
// double-clicked down — same size it was carried at, just no longer glued to
// the cursor.
function drawPlacedMug() {
  if (!placedMug) return;

  const img = coffeeImage(itemImagePath(placedMug));
  if (!img.complete || img.naturalWidth === 0) return;

  const w = img.width * CARRIED_MUG_SCALE;
  const h = img.height * CARRIED_MUG_SCALE;
  const x = placedMug.x - w / 2;
  const y = placedMug.y - h / 2;

  ctx.drawImage(img, x, y, w, h);
  drawMugTopping(placedMug, x, y, w, h, CARRIED_MUG_SCALE / placedMug.scale);
}

function drawCoffeeCounter() {
  const machineShake =
    machineState === "brewing"
      ? shakeAngleRadians("coffee_machine", BREWING_SHAKE_MAX_DEGREES, BREWING_SHAKE_PERIOD_MS)
      : machineDiscovered
      ? 0
      : shakeAngleRadians("coffee_machine");
  safeDrawImage(coffeeImage(machineImagePath()), MACHINE_COORDS, MACHINE_SCALE, "coffee machine", machineShake);

  coffeeItems.forEach((item) => {
    if (item === heldItem) return; // drawn glued to the mouse instead, below
    const { img, x, y, w, h } = coffeeItemRect(item);
    if (!img.complete || img.naturalWidth === 0) return;
    ctx.drawImage(img, x, y, w, h);
    if (item.kind === "mug") drawMugTopping(item, x, y, w, h);
  });

  if (heldItem) {
    const { img, w, h } = coffeeItemRect(heldItem);
    if (img.complete && img.naturalWidth !== 0) {
      if (MILK_LIKE.includes(heldItem.kind) || TOPPING_LIKE.includes(heldItem.kind)) {
        // Tilted like it's being poured, pivoting around its own center.
        ctx.save();
        ctx.translate(mouseX, mouseY);
        ctx.rotate((TOPPING_TILT_DEGREES[heldItem.kind] * Math.PI) / 180);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
        ctx.restore();
      } else {
        ctx.drawImage(img, mouseX - w / 2, mouseY - h / 2, w, h);
      }
      if (heldItem.kind === "mug") drawMugTopping(heldItem, mouseX - w / 2, mouseY - h / 2, w, h);
    }
  }
}

// -------------------- WIZARD MINIGAME --------------------
// Clicking app_wizard opens wizardgame (a single do_dark_background layer,
// the same trick bank_home/coffeecounter use) and starts a "catch the
// falling pieces" game: pieces spawn at the top of the background and fall
// within its bounds, faster and more often the longer the game runs,
// ramping up over WIZARD_RAMP_MS and then holding steady. Clicking a piece
// scores a point; letting one reach the bottom resets the score to zero.
// While playing, the mouse cursor is replaced by wizardhimself.png — free to
// roam the whole desktop (unlike the pieces) — positioned so the star at
// the tip of his wand sits exactly on the real cursor position. On a loss,
// the cursor and every piece freeze in place for WIZARD_LOSS_FREEZE_MS while
// the wizard flashes; clicking outside the game's own background quits it,
// back to the desktop, the same way every other app closes.

const WIZARD_PIECE_SCALE = 0.5;
// The art has a "THE WIZARD" title band painted across the top of the
// background — pieces spawn (and the score sits) just below it, in the sky,
// rather than on top of that band.
const WIZARD_PLAY_TOP_INSET = 0.13;
const WIZARD_CURSOR_SCALE = 0.4;
// Pixel offset (in wizardhimself.png's own, unscaled space) of the star at
// the tip of his wand, measured from the source image — this is the
// cursor's hotspot, not the image's top-left corner.
const WIZARD_STAR_OFFSET = { x: 286.8, y: 50.6 };

const WIZARD_RAMP_MS = 120000; // 2 minutes to reach full difficulty, then it holds steady
const WIZARD_MIN_FALL_SPEED = 60; // px/sec
const WIZARD_MAX_FALL_SPEED = 520; // px/sec
const WIZARD_MIN_SPAWN_INTERVAL_MS = 1400;
const WIZARD_MAX_SPAWN_INTERVAL_MS = 200;
// The background art has decorative borders down its left and right edges —
// pieces spawn inset from them by this fraction of the background's width.
const WIZARD_SPAWN_SIDE_MARGIN = 0.06;

const WIZARD_LOSS_FREEZE_MS = 2500;
const WIZARD_LOSS_FLASH_PULSES = 3;

const WIZARD_FOLDER = IMAGES_FOLDER + "wizard/";
const wizardImageCache = {};
function wizardImage(filename) {
  if (!wizardImageCache[filename]) {
    const img = new Image();
    img.onerror = () => pushError(`Missing image: ${WIZARD_FOLDER}${filename}.png`);
    img.src = `${WIZARD_FOLDER}${filename}.png`;
    wizardImageCache[filename] = img;
  }
  return wizardImageCache[filename];
}
const WIZARD_PIECE_FILENAMES = ["fallingpiece1", "fallingpiece2", "fallingpiece3", "fallingpiece4", "fallingpiece5"];
["wizardhimself", ...WIZARD_PIECE_FILENAMES].forEach(wizardImage);

let wizardScore = 0;
let wizardPieces = []; // { img, x, y, w, h } — x/y are the piece's top-left, in canvas pixels
let wizardGameStart = 0;
let wizardLastFrameTime = 0;
let wizardNextSpawnAt = 0;
// While performance.now() is under this, a loss is being shown: pieces and
// the cursor hold still and the wizard flashes — see updateWizardGame and
// drawWizardCursor.
let wizardFreezeUntil = 0;
let wizardLossFlashStart = 0;
// Snapshot of the cursor's on-screen position at the moment of a loss, so
// the wizard can be redrawn there (frozen) instead of following the mouse.
let wizardFreezeCursorPos = null;
// True from the moment a loss freeze starts until the frame the freeze
// lifts — that frame clears every falling piece (not just the one that fell
// through) so the board starts empty on the next attempt, instead of
// leaving a pile already sitting near the bottom.
let wizardPendingClearOnUnfreeze = false;

// Called when app_wizard is opened, so every session starts fresh.
function resetWizardGame() {
  wizardScore = 0;
  wizardPieces = [];
  wizardGameStart = performance.now();
  wizardLastFrameTime = 0;
  wizardNextSpawnAt = wizardGameStart + WIZARD_MIN_SPAWN_INTERVAL_MS;
  wizardFreezeUntil = 0;
  wizardLossFlashStart = 0;
  wizardFreezeCursorPos = null;
  wizardPendingClearOnUnfreeze = false;
}

function wizardGameRect(node) {
  const w = node.img.width * node.scale;
  const h = node.img.height * node.scale;
  const { x, y } = topLeftFor(node.coordinates_by_percentage, w, h);
  return { x, y, w, h };
}

// -------------------- WIZARD MUSIC --------------------
// Background music for the wizard minigame only — looped, faded in when the
// game opens and faded back out however it's left (clicking outside it,
// closing back through the desktop, or any other path closePopup gets
// called from). There's no single "wizard game closed" event to hook, so
// the fade-out is driven by checking every frame instead — same "check every
// frame rather than hook every close path" trick drawWizardCursor already
// uses for its own freeze/flash state.

const WIZARD_MUSIC_FILENAME = "wizard_background_music";
const WIZARD_MUSIC_MAX_VOLUME = 0.25;
const WIZARD_MUSIC_FADE_MS = 1500;

let wizardMusicAudio = null;
let wizardMusicTarget = 0; // 0 or WIZARD_MUSIC_MAX_VOLUME — where the current fade is headed
let wizardMusicFadeStart = 0; // performance.now() when the current fade began
let wizardMusicFadeFromVolume = 0; // audio.volume at the moment the current fade began
let wizardMusicWasOpen = false; // last frame's open/closed state, to catch the close transition

function wizardMusic() {
  if (!wizardMusicAudio) {
    wizardMusicAudio = new Audio(`${SOUND_FOLDER}${WIZARD_MUSIC_FILENAME}.mp3`);
    wizardMusicAudio.loop = true;
    wizardMusicAudio.volume = 0;
    wizardMusicAudio.onerror = () => pushError(`Missing sound: ${SOUND_FOLDER}${WIZARD_MUSIC_FILENAME}.mp3`);
  }
  return wizardMusicAudio;
}

// Called directly from the app_wizard click handler (not just left to the
// per-frame check below) so the play() call happens synchronously inside a
// real user gesture — browsers block autoplay otherwise.
function startWizardMusic() {
  const audio = wizardMusic();
  wizardMusicTarget = WIZARD_MUSIC_MAX_VOLUME;
  wizardMusicFadeStart = performance.now();
  wizardMusicFadeFromVolume = audio.volume;
  wizardMusicWasOpen = true;
  if (audio.paused) {
    audio.currentTime = 0;
    audio.play().catch((err) => pushError(`Sound playback failed: ${WIZARD_MUSIC_FILENAME} (${err.message})`));
  }
}

function updateWizardMusic() {
  const isOpen = openPath[openPath.length - 1].id === "wizardgame";
  const audio = wizardMusic();

  if (!isOpen && wizardMusicWasOpen) {
    wizardMusicTarget = 0;
    wizardMusicFadeStart = performance.now();
    wizardMusicFadeFromVolume = audio.volume;
    wizardMusicWasOpen = false;
  }

  const t = Math.min((performance.now() - wizardMusicFadeStart) / WIZARD_MUSIC_FADE_MS, 1);
  audio.volume = wizardMusicFadeFromVolume + (wizardMusicTarget - wizardMusicFadeFromVolume) * t;

  if (!isOpen && audio.volume <= 0 && !audio.paused) audio.pause();
}

function wizardDifficulty(now) {
  return Math.min(1, (now - wizardGameStart) / WIZARD_RAMP_MS);
}

function spawnWizardPiece(rect) {
  const filename = WIZARD_PIECE_FILENAMES[Math.floor(Math.random() * WIZARD_PIECE_FILENAMES.length)];
  const img = wizardImage(filename);
  const w = img.width * WIZARD_PIECE_SCALE;
  const h = img.height * WIZARD_PIECE_SCALE;
  const marginX = rect.w * WIZARD_SPAWN_SIDE_MARGIN;
  const minX = rect.x + marginX;
  const maxX = rect.x + rect.w - marginX - w;
  const x = minX + Math.random() * Math.max(0, maxX - minX);
  wizardPieces.push({ img, x, y: rect.y + rect.h * WIZARD_PLAY_TOP_INSET, w, h });
}

// Advances falling pieces, spawns new ones on schedule, and resets the score
// if one reached the bottom — called once per frame while wizardgame is the
// open layer. On a loss, everything (including the piece that just fell
// through) freezes in place for WIZARD_LOSS_FREEZE_MS instead of being
// removed immediately, so drawWizardCursor's flash has something frozen to
// show alongside it.
function updateWizardGame(node) {
  const now = performance.now();
  if (wizardLastFrameTime === 0) wizardLastFrameTime = now;
  const dtSeconds = (now - wizardLastFrameTime) / 1000;
  wizardLastFrameTime = now;

  if (now < wizardFreezeUntil) return;

  const rect = wizardGameRect(node);

  // The freeze just lifted: clear the whole board so the next attempt
  // starts fresh instead of already stacked near the bottom.
  if (wizardPendingClearOnUnfreeze) {
    wizardPieces = [];
    wizardPendingClearOnUnfreeze = false;
  }

  const difficulty = wizardDifficulty(now);
  const fallSpeed = WIZARD_MIN_FALL_SPEED + (WIZARD_MAX_FALL_SPEED - WIZARD_MIN_FALL_SPEED) * difficulty;
  const spawnInterval = WIZARD_MIN_SPAWN_INTERVAL_MS + (WIZARD_MAX_SPAWN_INTERVAL_MS - WIZARD_MIN_SPAWN_INTERVAL_MS) * difficulty;

  if (now >= wizardNextSpawnAt) {
    spawnWizardPiece(rect);
    wizardNextSpawnAt = now + spawnInterval;
  }

  wizardPieces.forEach((piece) => { piece.y += fallSpeed * dtSeconds; });

  const bottom = rect.y + rect.h;
  if (wizardPieces.some((piece) => piece.y + piece.h >= bottom)) {
    wizardScore = 0;
    wizardGameStart = now;
    playSound("Negative guitar");
    wizardFreezeUntil = now + WIZARD_LOSS_FREEZE_MS;
    wizardLossFlashStart = now;
    wizardFreezeCursorPos = { x: mouseX, y: mouseY };
    wizardPendingClearOnUnfreeze = true;
    return; // skip the filter below so the pieces stay put during the freeze
  }
  wizardPieces = wizardPieces.filter((piece) => piece.y + piece.h < bottom);
}

// Draws the falling pieces and the score, in the same handwriting font the
// bank balance uses, inset into the background's own top-right corner.
function drawWizardGame(node) {
  updateWizardGame(node);

  wizardPieces.forEach((piece) => {
    if (!piece.img.complete || piece.img.naturalWidth === 0) return;
    ctx.drawImage(piece.img, piece.x, piece.y, piece.w, piece.h);
  });

  const rect = wizardGameRect(node);
  ctx.save();
  ctx.fillStyle = "black";
  ctx.font = "34px Handwriting, cursive";
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillText(String(wizardScore), rect.x + rect.w - 70, rect.y + rect.h * WIZARD_PLAY_TOP_INSET + 8);
  ctx.restore();
}

// The wizard stands in for the mouse pointer everywhere on the desktop (not
// just inside the game's own background) while the game is open, drawn on
// top of everything else, the same way the carried coffee mug is. During
// the post-loss freeze it holds at wherever it was when the loss happened
// (wizardFreezeCursorPos) instead of following the mouse, and blinks
// on/off a few times to read as a "you lost" flash.
function drawWizardCursor() {
  if (openPath[openPath.length - 1].id !== "wizardgame") return;

  const now = performance.now();
  const frozen = now < wizardFreezeUntil;

  if (frozen) {
    const pulseDuration = WIZARD_LOSS_FREEZE_MS / (WIZARD_LOSS_FLASH_PULSES * 2);
    const elapsed = now - wizardLossFlashStart;
    const visible = Math.floor(elapsed / pulseDuration) % 2 === 0;
    if (!visible) return;
  }

  const img = wizardImage("wizardhimself");
  if (!img.complete || img.naturalWidth === 0) return;

  const w = img.width * WIZARD_CURSOR_SCALE;
  const h = img.height * WIZARD_CURSOR_SCALE;
  const pos = frozen && wizardFreezeCursorPos ? wizardFreezeCursorPos : { x: mouseX, y: mouseY };
  const x = pos.x - WIZARD_STAR_OFFSET.x * WIZARD_CURSOR_SCALE;
  const y = pos.y - WIZARD_STAR_OFFSET.y * WIZARD_CURSOR_SCALE;

  ctx.drawImage(img, x, y, w, h);
}

// Scores a point and removes the piece if the click landed on one; a miss
// is a no-op. Closing the game itself is handled by the generic click logic
// in the mousedown handler below, the same as every other app.
function handleWizardGameClick(x, y) {
  const hitPiece = wizardPieces.find(
    (piece) => x >= piece.x && x <= piece.x + piece.w && y >= piece.y && y <= piece.y + piece.h
  );
  if (hitPiece) {
    wizardPieces = wizardPieces.filter((piece) => piece !== hitPiece);
    wizardScore += 1;
  }
}

// -------------------- JOURNAL MECHANIC --------------------
// Clicking journal opens journalpopup (a single do_dark_background layer,
// the same trick bank_home/coffeecounter/wizardgame use). Its left page is
// blank in the art itself — a loose sheet of journal_paper1/2/3.png is drawn
// on top of it there, cycling 1 -> 2 -> 3 -> 1... on every click, with the
// current JOURNAL_ENTRIES entry's text drawn on top of that. Entries show
// highest-numbered (most recently written) first, counting down to entry 1
// and then looping back to the top — independent of the paper art's own
// 1/2/3 cycle. Closing the popup is handled by the generic click logic in
// the mousedown handler below, the same as every other app.

const JOURNAL_FOLDER = IMAGES_FOLDER + "journal/";
const journalImageCache = {};
function journalImage(filename) {
  if (!journalImageCache[filename]) {
    const img = new Image();
    img.onerror = () => pushError(`Missing image: ${JOURNAL_FOLDER}${filename}.png`);
    img.src = `${JOURNAL_FOLDER}${filename}.png`;
    journalImageCache[filename] = img;
  }
  return journalImageCache[filename];
}
const JOURNAL_PAPER_FILENAMES = ["journal_paper1", "journal_paper2", "journal_paper3"];
JOURNAL_PAPER_FILENAMES.forEach(journalImage);

// Where the loose paper sits on journalpopup's own blank left page, in the
// popup art's native pixel space (1056x921) — scaled by whatever
// journalpopup's own on-canvas scale ends up being, the same way
// WIZARD_STAR_OFFSET scales with WIZARD_CURSOR_SCALE.
const JOURNAL_PAGE_RECT = { x: 80, y: 120, w: 430, h: 610 };
// Matches the left page's own rightward perspective (the art tilts the
// page's near edge to the right) — positive tilts the written text
// clockwise; tweak to taste.
const JOURNAL_TEXT_TILT_DEGREES = 4;
// Small down-right offsets (in page-rect scale) for the other two sheets
// peeking out from behind the current one — purely decorative, drawn
// farthest-back first so the nearer one (and then the top sheet) overlaps it.
const JOURNAL_BEHIND_SHEET_OFFSETS = [
  { dx: 18, dy: 15 },
  { dx: 9, dy: 7 },
];
// Per-paper nudge for where the text block starts, on top of the usual
// marginX/marginTop — journal_paper3's own margin line sits further left
// than paper1/2's, so its text needs an extra push right to line up the same.
const JOURNAL_TEXT_OFFSET_X = {
  journal_paper3: 15,
};

let journalEntryIndex = 0; // counts down from JOURNAL_ENTRIES.length - 1
let journalPaperIndex = 0; // cycles through JOURNAL_PAPER_FILENAMES

// Called when journal is opened, so it always starts on the most recent entry.
function resetJournal() {
  journalEntryIndex = JOURNAL_ENTRIES.length - 1;
  journalPaperIndex = 0;
}

function journalPageRect(node) {
  const w = node.img.width * node.scale;
  const h = node.img.height * node.scale;
  const { x, y } = topLeftFor(node.coordinates_by_percentage, w, h);
  return {
    x: x + JOURNAL_PAGE_RECT.x * node.scale,
    y: y + JOURNAL_PAGE_RECT.y * node.scale,
    w: JOURNAL_PAGE_RECT.w * node.scale,
    h: JOURNAL_PAGE_RECT.h * node.scale,
  };
}

// Draws the current loose paper (cycling 1/2/3) "contain"-fitted into the
// popup's left page — scaled to fit within the page rect while keeping its
// own aspect ratio, then centered there — with the current journal entry's
// text on top, sized to take up most of the sheet.
function drawJournal(node) {
  const rect = journalPageRect(node);

  // The other two sheets, peeking out from behind the current one — just
  // set dressing, not tied to which entries are actually queued up next.
  JOURNAL_BEHIND_SHEET_OFFSETS.forEach(({ dx, dy }, i) => {
    const filename = JOURNAL_PAPER_FILENAMES[(journalPaperIndex + JOURNAL_BEHIND_SHEET_OFFSETS.length - i) % JOURNAL_PAPER_FILENAMES.length];
    const img = journalImage(filename);
    if (!img.complete || img.naturalWidth === 0) return;
    const fitScale = Math.min(rect.w / img.width, rect.h / img.height);
    const w = img.width * fitScale;
    const h = img.height * fitScale;
    const x = rect.x + (rect.w - w) / 2 + dx;
    const y = rect.y + (rect.h - h) / 2 + dy;
    ctx.drawImage(img, x, y, w, h);
  });

  const paperImg = journalImage(JOURNAL_PAPER_FILENAMES[journalPaperIndex]);
  if (!paperImg.complete || paperImg.naturalWidth === 0) return;

  const fitScale = Math.min(rect.w / paperImg.width, rect.h / paperImg.height);
  const pw = paperImg.width * fitScale;
  const ph = paperImg.height * fitScale;
  const px = rect.x + (rect.w - pw) / 2;
  const py = rect.y + (rect.h - ph) / 2;
  ctx.drawImage(paperImg, px, py, pw, ph);

  if (!JOURNAL_ENTRIES.length) return;

  const marginLeft = pw * 0.12;
  const marginRight = pw * 0.06; // narrower than marginLeft so the text box's right edge sits further out
  const marginTop = ph * 0.1;
  const offsetX = JOURNAL_TEXT_OFFSET_X[JOURNAL_PAPER_FILENAMES[journalPaperIndex]] || 0;

  ctx.save();
  ctx.fillStyle = "black";
  ctx.font = "28px Handwriting, cursive";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  // wrapText measures with ctx.font, so it must be set (above) before this call.
  const lines = wrapText(JOURNAL_ENTRIES[journalEntryIndex], pw - marginLeft - marginRight - offsetX);
  const lineHeight = 34;

  // Rotate the whole text block around its own top-left corner, so it
  // tilts to match the page's perspective instead of the canvas's.
  ctx.translate(px + marginLeft + offsetX, py + marginTop);
  ctx.rotate(JOURNAL_TEXT_TILT_DEGREES * Math.PI / 180);
  lines.forEach((line, i) => ctx.fillText(line, 0, lineHeight / 2 + i * lineHeight));
  ctx.restore();
}

// Advances the paper (1 -> 2 -> 3 -> 1...) and descends the entry shown
// (looping back to the top once it passes entry 1) on every click inside
// the popup.
const JOURNAL_PAPER_WOBBLE_SOUNDS = ["Paperwobble1", "Paperwobble2", "Paperwobble3"];

function handleJournalClick() {
  journalPaperIndex = (journalPaperIndex + 1) % JOURNAL_PAPER_FILENAMES.length;
  journalEntryIndex = journalEntryIndex <= 0 ? JOURNAL_ENTRIES.length - 1 : journalEntryIndex - 1;
  playSound(JOURNAL_PAPER_WOBBLE_SOUNDS[Math.floor(Math.random() * JOURNAL_PAPER_WOBBLE_SOUNDS.length)]);
}

// -------------------- FRIDGE MECHANIC --------------------
// Clicking notes opens fridgepopup (a single do_dark_background layer, the
// same trick coffeecounter/bank_home/wizardgame/journalpopup use). Inside it,
// three independent draggable layers live outside the generic popup tree
// (like the coffee items do): a scatter of decorative letter/shape magnets
// stuck to the fridge door, a drawer (fridge_paper drawer.png) that peeks up
// from the bottom of the whole screen and slides open/closed, and a set of
// blank notes (fridge_paper1-6.png) that start scattered inside that drawer.
// Dragging a note out and dropping it on top of a magnet sticks it to the
// fridge door there; dropping it anywhere else just returns it to wherever it
// came from. A single click (no real drag) on a note already on the fridge
// opens it for typing instead of moving it.

const FRIDGE_FOLDER = IMAGES_FOLDER + "fridge/";
const fridgeImageCache = {};
function fridgeImage(filename) {
  if (!fridgeImageCache[filename]) {
    const img = new Image();
    img.onerror = () => pushError(`Missing image: ${FRIDGE_FOLDER}${filename}.png`);
    img.src = `${FRIDGE_FOLDER}${filename}.png`;
    fridgeImageCache[filename] = img;
  }
  return fridgeImageCache[filename];
}

const MAGNET_LETTER_FILENAMES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => `magnet_${l}`);
const MAGNET_DECORATIVE_FILENAMES = ["magnet_SF", "magnet_heart", "magnet_ladybug", "magnet_mermaid", "magnet_mosaic", "magnet_wizard"];
const MAGNET_FILENAMES = [...MAGNET_LETTER_FILENAMES, ...MAGNET_DECORATIVE_FILENAMES];
const FRIDGE_PAPER_FILENAMES = [1, 2, 3, 4, 5, 6].map((n) => `fridge_paper${n}`);
// Each paper is a hand-drawn sheet — often slanted or torn, not a plain
// rectangle — so a single percentage-based margin let text run past the
// drawn edge on some of them. Each one gets its own writable rect instead,
// hand-picked in that file's own native pixel space (same idea as
// JOURNAL_PAGE_RECT).
//
// This is NOT an InDesign-style text box — there is no bottom edge or box
// height to set, and nothing clips. Text just starts at (left, top) and
// flows straight down, one line per `lineHeight` pixels, for as many lines
// as the content needs:
//   - left/top: where the first line starts. Native pixel space of that
//     file (scaled by NOTE_SCALE, so these don't need to change if
//     NOTE_SCALE ever does) — e.g. open the PNG in Preview and read
//     coordinates off it directly.
//   - width: wrap width, same native-pixel space. Smaller width = wraps
//     sooner = MORE lines = text reaches further down the page (for the
//     same amount of typed text). This is the knob for "make it go down
//     further," not a height field.
//   - fontSize: real on-canvas pixels, not scaled.
//   - lineHeight: real on-canvas pixels, the plain distance from one line's
//     baseline to the next. Defaults to fontSize + 4 if omitted — set it
//     directly (e.g. fontSize + 1 or + 2) for tighter spacing.
//   - maxChars: how many characters that paper accepts while typing (see
//     the keydown listener further down). There's still no clipping, so
//     this is the actual guard against a note overflowing past the bottom
//     of its own art — lower it for a small paper, raise it for a big one.
//     Falls back to NOTE_MAX_CHARS if omitted.
// To tune one: open the note in-game (drag it onto a magnet, click it, type
// some filler text) and nudge these until it sits the way you want.
const NOTE_TEXT_BOX = {
  fridge_paper1: { left: 240, top: 160, width: 400, fontSize: 23, lineHeight: 22, maxChars: 90 },
  fridge_paper2: { left: 40, top: 50, width: 366, fontSize: 20, lineHeight: 22, maxChars: 55 },
  fridge_paper3: { left: 60, top: 70, width: 460, fontSize: 20, lineHeight: 22, maxChars: 78 },
  fridge_paper4: { left: 60, top: 60, width: 470, fontSize: 20, lineHeight: 22, maxChars: 200 },
  fridge_paper5: { left: 85, top: 100, width: 630, fontSize: 20, lineHeight: 22, maxChars: 98 },
  fridge_paper6: { left: 98, top: 150, width: 355, fontSize: 20, lineHeight: 22, maxChars: 190 },
};
const FRIDGE_DRAWER_FILENAME = "fridge_paper drawer"; // filename really does have a space in it
const FRIDGE_PEN_FILENAME = "fridge_pen";
[...MAGNET_FILENAMES, ...FRIDGE_PAPER_FILENAMES, FRIDGE_DRAWER_FILENAME, FRIDGE_PEN_FILENAME].forEach(fridgeImage);

// Letter magnets read as clutter at a uniform scale, so they're a size down
// from the decorative ones; the mermaid/wizard art reads as a tiny blob next
// to a letter at that same scale, so they get a size bump instead.
const MAGNET_LETTER_SCALE = 0.24;
const MAGNET_DECORATIVE_SCALE = 0.4;
const MAGNET_BIG_SCALE = 0.58;
function magnetScaleFor(filename) {
  if (filename === "magnet_mermaid" || filename === "magnet_wizard") return MAGNET_BIG_SCALE;
  if (MAGNET_LETTER_FILENAMES.includes(filename)) return MAGNET_LETTER_SCALE;
  return MAGNET_DECORATIVE_SCALE;
}

const NOTE_SCALE = 0.36;
const NOTE_MAX_CHARS = 80;
// A pickup that never moves more than this many pixels before mouseup counts
// as a click (open the note for typing) rather than a drag (re-place it).
const NOTE_CLICK_MOVE_THRESHOLD = 6;

// fridge_paper drawer.png is a top-down look INTO an open drawer (the tan
// band across its own top edge is the drawer's front lip, with the knob
// poking up above that) — natively 1891x1381. Scaled down to less than half
// the canvas's width (rather than filling it) and centered, so only its
// vertical position (fridgeDrawerY) needs to be dragged; peeking at 55px when
// closed shows just that lip + knob, per the "knob and first lip visible" ask.
const FRIDGE_DRAWER_NATIVE_W = 1891;
const FRIDGE_DRAWER_NATIVE_H = 1381;
const FRIDGE_DRAWER_SCALE = (canvas.width * 0.42) / FRIDGE_DRAWER_NATIVE_W;
const FRIDGE_DRAWER_PEEK_PX = 120;

let fridgeMagnets = null; // populated on first open by initFridgeMagnets — persists after that, like coffeeItems
let fridgeNotes = null; // populated on first open by initFridgeNotes — persists after that

let heldMagnet = null;
let magnetDragOffset = { x: 0, y: 0 };

let heldNote = null;
let noteDragStart = { x: 0, y: 0 };
let notePickupOrigin = null; // snapshot of the held note's location/position, to snap back to on an invalid drop

let draggingDrawer = false;
let drawerDragOffsetY = 0;
let fridgeDrawerY = null; // null = closed (peek only); set on first drag

// The drawer bounces (peeking up a little, twice, then pausing) to catch a
// first-time visitor's eye — same idea as machineDiscovered stopping the
// coffee machine's shake once it's been found. Set true the moment the user
// so much as touches the drawer band (dragging the drawer itself, or pulling
// a note out of it), and stays true for good after that.
let fridgeDrawerDiscovered = false;

// Whichever fridge note is currently open for typing — text types into it via
// the keydown listener further down, until a click elsewhere closes it.
let editingNote = null;

function fridgeRect() {
  const w = fridgeNode.img.width * fridgeNode.scale;
  const h = fridgeNode.img.height * fridgeNode.scale;
  const { x, y } = topLeftFor(fridgeNode.coordinates_by_percentage, w, h);
  return { x, y, w, h };
}

function drawerRect() {
  const w = FRIDGE_DRAWER_NATIVE_W * FRIDGE_DRAWER_SCALE;
  const h = FRIDGE_DRAWER_NATIVE_H * FRIDGE_DRAWER_SCALE;
  const y = fridgeDrawerY === null ? canvas.height - FRIDGE_DRAWER_PEEK_PX : fridgeDrawerY;
  return { x: (canvas.width - w) / 2, y, w, h };
}

// "bounce bounce ... pause ... bounce bounce ... pause": two quick pops (each
// a smooth up-and-back-down arc) FRIDGE_DRAWER_BOUNCE_GAP_MS apart, then a
// long pause before the pair repeats. Purely a vertical draw-time offset (see
// drawFridgeDrawer) — doesn't touch fridgeDrawerY or hit-testing.
const FRIDGE_DRAWER_BOUNCE_PERIOD_MS = 1900;
const FRIDGE_DRAWER_BOUNCE_PULSE_MS = 260;
const FRIDGE_DRAWER_BOUNCE_GAP_MS = 160;
const FRIDGE_DRAWER_BOUNCE_HEIGHT_PX = 16;
function fridgeDrawerBounceOffsetY() {
  const t = performance.now() % FRIDGE_DRAWER_BOUNCE_PERIOD_MS;
  const secondPulseStart = FRIDGE_DRAWER_BOUNCE_PULSE_MS + FRIDGE_DRAWER_BOUNCE_GAP_MS;

  let pulseT = -1;
  if (t < FRIDGE_DRAWER_BOUNCE_PULSE_MS) pulseT = t;
  else if (t >= secondPulseStart && t < secondPulseStart + FRIDGE_DRAWER_BOUNCE_PULSE_MS) pulseT = t - secondPulseStart;
  if (pulseT < 0) return 0; // the pause between pairs

  return -Math.sin((pulseT / FRIDGE_DRAWER_BOUNCE_PULSE_MS) * Math.PI) * FRIDGE_DRAWER_BOUNCE_HEIGHT_PX;
}

// Whether (x, y) falls within the drawer's own currently-visible rect —
// unlike the fridge door, the drawer no longer spans the full canvas width,
// so both axes need checking now that it's smaller and centered.
function inDrawerBand(x, y) {
  const r = drawerRect();
  return y >= r.y && x >= r.x && x <= r.x + r.w;
}

function clampDrawerY(y) {
  const h = FRIDGE_DRAWER_NATIVE_H * FRIDGE_DRAWER_SCALE;
  const minY = canvas.height - h; // fully open
  const maxY = canvas.height - FRIDGE_DRAWER_PEEK_PX; // closed
  return Math.min(Math.max(y, minY), maxY);
}

function rectsOverlap(a, b, gap = 0) {
  return !(
    a.x + a.w + gap <= b.x ||
    b.x + b.w + gap <= a.x ||
    a.y + a.h + gap <= b.y ||
    b.y + b.h + gap <= a.y
  );
}

// Scatters every magnet at a random spot inside the fridge door, once. Called
// the first time notes is clicked, same "populate on first open, keep state
// after that" rule coffeeItems follows. Each spot is retried a handful of
// times against whatever's already been placed so magnets start out not
// touching (dragging them into each other afterward is fine) — and the whole
// scatter is kept clear of the fridge's own left edge, which is a decorative
// sliver of the door's side, not part of the front face.
const FRIDGE_LEFT_DECORATIVE_FRACTION = 0.12;
function initFridgeMagnets() {
  const rect = fridgeRect();
  const margin = 20;
  const leftInset = rect.w * FRIDGE_LEFT_DECORATIVE_FRACTION;
  const placedRects = [];

  fridgeMagnets = MAGNET_FILENAMES.map((filename) => {
    const img = fridgeImage(filename);
    const scale = magnetScaleFor(filename);
    const w = img.width * scale;
    const h = img.height * scale;
    const minX = rect.x + leftInset + w / 2;
    const maxX = rect.x + rect.w - margin - w / 2;
    const minY = rect.y + margin + h / 2;
    const maxY = rect.y + rect.h - margin - h / 2;

    let x, y, box;
    for (let attempt = 0; attempt < 40; attempt++) {
      x = minX + Math.random() * Math.max(0, maxX - minX);
      y = minY + Math.random() * Math.max(0, maxY - minY);
      box = { x: x - w / 2, y: y - h / 2, w, h };
      if (!placedRects.some((p) => rectsOverlap(box, p, 10))) break;
    }
    placedRects.push(box);

    return { id: filename, filename, scale, coordinates_by_percentage: pixelsToPercentage(x, y) };
  });
}

// Scatters every note somewhere inside the drawer's own native image space
// (not just whatever sliver is currently visible — the user will drag the
// drawer open to see the rest). marginTop is computed per note (rather than
// one shared constant) from that note's own rendered height, so that however
// tall a given paper's art is, its top edge still lands clear of the drawer's
// closed peek band — otherwise, with notes now sized independently of the
// (much smaller) drawer, a big note could poke up into the knob/lip sliver
// and block clicking it to open the drawer at all.
function initFridgeNotes() {
  const marginX = FRIDGE_DRAWER_NATIVE_W * 0.06;
  const marginBottom = FRIDGE_DRAWER_NATIVE_H * 0.04;
  fridgeNotes = FRIDGE_PAPER_FILENAMES.map((filename, i) => {
    const img = fridgeImage(filename);
    const halfHeightScreen = (img.height * NOTE_SCALE) / 2;
    const marginTop = (FRIDGE_DRAWER_PEEK_PX + halfHeightScreen) / FRIDGE_DRAWER_SCALE + 20;
    return {
      id: `note${i}`,
      filename,
      location: "drawer", // "drawer" | "fridge"
      text: "",
      coordinates_by_percentage: null, // used when location === "fridge"
      drawerOffset: {
        // pixels in the drawer image's own native (unscaled) space
        x: marginX + Math.random() * (FRIDGE_DRAWER_NATIVE_W - marginX * 2),
        y: marginTop + Math.random() * Math.max(0, FRIDGE_DRAWER_NATIVE_H - marginTop - marginBottom),
      },
    };
  });
}

function magnetRect(magnet) {
  const img = fridgeImage(magnet.filename);
  const w = img.width * magnet.scale;
  const h = img.height * magnet.scale;
  const { x, y } = topLeftFor(magnet.coordinates_by_percentage, w, h);
  return { x, y, w, h };
}

function hitTestMagnet(magnet, x, y) {
  const r = magnetRect(magnet);
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

// Catching a note on a magnet (see finalizeNoteDrop) is deliberately more
// forgiving than clicking a magnet to drag it — letter magnets in particular
// are small, and requiring a pixel-precise drop onto one made it hard to
// tell the mechanic even existed on a first try. This pads the magnet's own
// rect out in every direction just for that catch check.
const MAGNET_CATCH_PADDING = 34;
function hitTestMagnetCatch(magnet, x, y) {
  const r = magnetRect(magnet);
  return (
    x >= r.x - MAGNET_CATCH_PADDING &&
    x <= r.x + r.w + MAGNET_CATCH_PADDING &&
    y >= r.y - MAGNET_CATCH_PADDING &&
    y <= r.y + r.h + MAGNET_CATCH_PADDING
  );
}

// Held notes are drawn glued to the mouse (see drawFridgeNote), regardless of
// their own location/drawerOffset/coordinates_by_percentage.
function fridgeNoteScreenRect(note) {
  const img = fridgeImage(note.filename);
  const w = img.width * NOTE_SCALE;
  const h = img.height * NOTE_SCALE;

  if (note === heldNote) return { x: mouseX - w / 2, y: mouseY - h / 2, w, h };

  if (note.location === "fridge") {
    const [xPct, yPct] = note.coordinates_by_percentage;
    const cx = (xPct / 100) * canvas.width;
    const cy = (yPct / 100) * canvas.height;
    return { x: cx - w / 2, y: cy - h / 2, w, h };
  }

  const rect = drawerRect();
  return {
    x: rect.x + note.drawerOffset.x * FRIDGE_DRAWER_SCALE - w / 2,
    y: rect.y + note.drawerOffset.y * FRIDGE_DRAWER_SCALE - h / 2,
    w,
    h,
  };
}

function hitTestFridgeNote(note, x, y) {
  const r = fridgeNoteScreenRect(note);
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function beginDragMagnet(magnet) {
  const r = magnetRect(magnet);
  heldMagnet = magnet;
  magnetDragOffset = { x: mouseX - (r.x + r.w / 2), y: mouseY - (r.y + r.h / 2) };
}

function updateDraggedMagnet() {
  const rect = fridgeRect();
  const img = fridgeImage(heldMagnet.filename);
  const w = img.width * heldMagnet.scale;
  const h = img.height * heldMagnet.scale;
  const targetX = mouseX - magnetDragOffset.x;
  const targetY = mouseY - magnetDragOffset.y;
  const cx = Math.min(Math.max(targetX, rect.x + w / 2), rect.x + rect.w - w / 2);
  const cy = Math.min(Math.max(targetY, rect.y + h / 2), rect.y + rect.h - h / 2);
  heldMagnet.coordinates_by_percentage = pixelsToPercentage(cx, cy);
}

function beginDragNote(note) {
  heldNote = note;
  noteDragStart = { x: mouseX, y: mouseY };
  notePickupOrigin = {
    location: note.location,
    coordinates_by_percentage: note.coordinates_by_percentage,
    drawerOffset: note.drawerOffset ? { ...note.drawerOffset } : null,
  };
  // Bring it to the front of the array so it's both drawn on top and wins
  // hit-testing priority over whichever notes it may now overlap.
  fridgeNotes = fridgeNotes.filter((n) => n !== note);
  fridgeNotes.push(note);
}

// Called on mouseup while a note is held. A drop that never really moved is
// treated as a click (open it for typing, leave it exactly where it was);
// otherwise it sticks to the fridge if dropped on a magnet, returns to the
// drawer if dropped there, or snaps back to wherever it started.
function finalizeNoteDrop() {
  const note = heldNote;
  const moved = Math.hypot(mouseX - noteDragStart.x, mouseY - noteDragStart.y) > NOTE_CLICK_MOVE_THRESHOLD;

  if (!moved) {
    if (note.location === "fridge") editingNote = note;
    return;
  }

  const dRect = drawerRect();
  if (inDrawerBand(mouseX, mouseY)) {
    note.location = "drawer";
    note.drawerOffset = {
      x: (mouseX - dRect.x) / FRIDGE_DRAWER_SCALE,
      y: (mouseY - dRect.y) / FRIDGE_DRAWER_SCALE,
    };
    return;
  }

  const magnet = fridgeMagnets.find((m) => hitTestMagnetCatch(m, mouseX, mouseY));
  if (magnet) {
    // Snaps to the magnet's own position rather than the exact drop point,
    // centered under it with the magnet sitting right at the note's top edge
    // (half on, half off) — like the magnet is pinching the paper up there —
    // regardless of where exactly on the magnet the note was dropped.
    const mRect = magnetRect(magnet);
    const noteImg = fridgeImage(note.filename);
    const noteH = noteImg.height * NOTE_SCALE;
    note.location = "fridge";
    note.coordinates_by_percentage = pixelsToPercentage(mRect.x + mRect.w / 2, mRect.y + mRect.h / 2 + noteH / 2);
    return;
  }

  note.location = notePickupOrigin.location;
  note.coordinates_by_percentage = notePickupOrigin.coordinates_by_percentage;
  note.drawerOffset = notePickupOrigin.drawerOffset;
}

// Draws a note at its current screen rect, plus whatever's been typed on it
// (and a blinking cursor while it's the one being edited) — same handwriting
// font the journal/affirmations use, wrapped to that paper's own text box.
function drawFridgeNote(note) {
  const img = fridgeImage(note.filename);
  if (!img.complete || img.naturalWidth === 0) return;

  const { x, y, w, h } = fridgeNoteScreenRect(note);
  ctx.drawImage(img, x, y, w, h);

  if (!note.text && editingNote !== note) return;

  const box = NOTE_TEXT_BOX[note.filename];
  const boxX = x + box.left * NOTE_SCALE;
  const boxY = y + box.top * NOTE_SCALE;
  const boxW = box.width * NOTE_SCALE;

  ctx.save();
  ctx.fillStyle = "black";
  ctx.font = `${box.fontSize}px Handwriting, cursive`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  let text = note.text;
  if (editingNote === note && Math.floor(performance.now() / 500) % 2 === 0) text += "|";
  // wrapText measures with ctx.font, so it must be set (above) before this call.
  const lines = wrapText(text, boxW);
  const lineHeight = box.lineHeight || box.fontSize + 4;
  lines.forEach((line, i) => ctx.fillText(line, boxX, boxY + i * lineHeight));
  ctx.restore();
}

function drawFridgeDrawer() {
  const rect = drawerRect();
  const bounce = fridgeDrawerDiscovered ? 0 : fridgeDrawerBounceOffsetY();
  const img = fridgeImage(FRIDGE_DRAWER_FILENAME);
  if (img.complete && img.naturalWidth !== 0) ctx.drawImage(img, rect.x, rect.y + bounce, rect.w, rect.h);

  fridgeNotes.forEach((note) => {
    if (note.location === "drawer" && note !== heldNote) drawFridgeNote(note);
  });
}

// Draw order (back to front): notes already stuck to the fridge, then the
// magnets pinning them, then the drawer (it physically sits in front of/below
// the fridge door), then whichever note is currently being dragged, on top of
// everything.
function drawFridgeScene() {
  if (!fridgeMagnets || !fridgeNotes) return;

  fridgeNotes.forEach((note) => {
    if (note.location === "fridge" && note !== heldNote) drawFridgeNote(note);
  });

  fridgeMagnets.forEach((magnet) => {
    safeDrawImage(fridgeImage(magnet.filename), magnet.coordinates_by_percentage, magnet.scale, magnet.id);
  });

  drawFridgeDrawer();

  if (heldNote) drawFridgeNote(heldNote);
}

// fridge_pen.png has already been cropped tight to the pen art and shrunk to
// a base display size (native 19x170) — see the "FRIDGE MECHANIC" intro
// comment's sibling note above about pre-shrunk files. PEN_SCALE is a
// deliberate multiplier on top of that (not a typo/stand-in for 1) since the
// cursor reads as too small at native size. PEN_TIP_OFFSET is the nib's tip
// in that same native pixel space, measured off the cropped file directly —
// it's the pen's hotspot (scaled by PEN_SCALE same as the image itself), the
// same idea as WIZARD_STAR_OFFSET is for the wizard cursor.
const PEN_SCALE = 1.6;
const PEN_TIP_OFFSET = { x: 8, y: 169 };
// Leans the pen's top-left, like a left-handed writing grip (mirror the sign
// for a right-handed lean instead).
const PEN_TILT_DEGREES = 35;

// Replaces the mouse cursor with the pen (nib at the real cursor position,
// tilted) whenever a fridge note is open for typing — same trick
// drawWizardCursor uses, just gated on editingNote instead of which popup is
// open.
function drawFridgePenCursor() {
  if (!editingNote) return;
  if (openPath[openPath.length - 1].id !== "fridgepopup") return;

  const img = fridgeImage(FRIDGE_PEN_FILENAME);
  if (!img.complete || img.naturalWidth === 0) return;

  ctx.save();
  ctx.translate(mouseX, mouseY);
  ctx.rotate((-PEN_TILT_DEGREES * Math.PI) / 180);
  ctx.drawImage(img, -PEN_TIP_OFFSET.x * PEN_SCALE, -PEN_TIP_OFFSET.y * PEN_SCALE, img.width * PEN_SCALE, img.height * PEN_SCALE);
  ctx.restore();
}

// -------------------- BED MECHANIC --------------------
// Clicking bed opens bedpopup (a single do_dark_background layer, the same
// trick fridgepopup/journalpopup use): bedbase.png (the bed itself) under a
// made bed — covers.png over the body with quilt.png folded over its foot
// end, and pillow.png sitting at the head on top of both, itself draggable.
// covers/quilt were shrunk to the exact same footprint as bedbase (see the
// "BED MECHANIC" comment on the bedpopup node up in `images`), so both just
// draw at bedRect() with no per-layer offset math. Dragging anywhere on the
// covers/quilt slides both down together — one rigid "blanket" unit, quilt
// attached to the bottom of the covers, same idea as the fridge drawer's
// vertical-only slide — to reveal the bedbase surface and whatever's
// scattered on it: a set of small props (bedobject_*.png), plus the pillow
// itself, that only become draggable once whatever's on top of them (the
// blanket, or the pillow) has moved out of the way. bedobject_tooth is
// drawn tucked under the pillow's own rest position, tooth-fairy-style —
// it's revealed by dragging the pillow aside, not the blanket.

const BED_FOLDER = IMAGES_FOLDER + "bed/";
const bedImageCache = {};
function bedImage(filename) {
  if (!bedImageCache[filename]) {
    const img = new Image();
    img.onerror = () => pushError(`Missing image: ${BED_FOLDER}${filename}.png`);
    img.src = `${BED_FOLDER}${filename}.png`;
    bedImageCache[filename] = img;
  }
  return bedImageCache[filename];
}

// Every prop's (and the pillow's own) centerFrac is its bounding-box center
// from the original, pre-crop bed illustration (2048x2732), as a fraction of
// that illustration's width/height — so on first open it lands exactly
// where the artist actually drew it, not a random scatter like the fridge
// magnets get.
const PILLOW_CENTER_FRAC = [0.4666, 0.188];

const BED_OBJECTS = [
  { filename: "bedobject_dino", centerFrac: [0.6003, 0.4043] },
  { filename: "bedobject_flower", centerFrac: [0.4519, 0.6698] },
  { filename: "bedobject_key", centerFrac: [0.5979, 0.6715] },
  { filename: "bedobject_pencil", centerFrac: [0.3359, 0.6109] },
  { filename: "bedobject_photo", centerFrac: [0.3271, 0.7432] },
  { filename: "bedobject_popcornbag", centerFrac: [0.4031, 0.4799] },
  { filename: "bedobject_popcornpiece1", centerFrac: [0.4006, 0.3739] },
  { filename: "bedobject_popcornpiece2", centerFrac: [0.4529, 0.3852] },
  { filename: "bedobject_stickers", centerFrac: [0.6506, 0.7599] },
  { filename: "bedobject_tooth", centerFrac: [0.4609, 0.218] },
  { filename: "bedobject_vitamins", centerFrac: [0.5366, 0.7542] },
];
[...BED_OBJECTS.map((o) => o.filename), "pillow", "covers", "quilt"].forEach(bedImage);

// Unlike pillow/covers/quilt (each shrunk to bedbase's own full-illustration
// footprint, so they can just be stretched to fill bedRect directly), the
// bedobject_*.png files were cropped, not resized — their pixel dimensions
// are still real bed-illustration pixels. BED_MASTER_W/H is that original
// illustration's size, so an object's on-screen size can be worked out as
// (its own cropped pixel size) x (bedRect's width / BED_MASTER_W) — the same
// ratio the illustration itself was shrunk by to become bedbase.png.
const BED_MASTER_W = 2048;
const BED_MASTER_H = 2732;

// covers.png's own top edge, as a fraction of the bed art's height — read
// off its pre-crop bounding box, same source as the centerFracs above.
const BED_COVERS_TOP_FRAC = 0.304;

// How far down (as a fraction of the bed art's own on-screen height) the
// covers/quilt can be dragged — far enough to clear the whole base without
// sliding off past the popup's own bottom edge.
const BED_COVERS_MAX_PULL_FRACTION = 0.62;

let bedObjects = null; // populated on first open by initBedObjects — persists after that, like fridgeMagnets
let pillowItem = null; // populated alongside bedObjects — a draggable item in its own right, not part of that array (see drawBedScene for why it needs its own z-order)
let bedCoversPullPx = 0; // 0 = fully up (bed made); grows as the covers are dragged down

let heldBedObject = null; // either a bedObjects entry or pillowItem itself
let bedObjectDragOffset = { x: 0, y: 0 };
let draggingBedCovers = false;
let bedCoversDragOffsetY = 0;

function bedRect() {
  const w = bedNode.img.width * bedNode.scale;
  const h = bedNode.img.height * bedNode.scale;
  const { x, y } = topLeftFor(bedNode.coordinates_by_percentage, w, h);
  return { x, y, w, h };
}

function initBedObjects() {
  const rect = bedRect();
  bedObjects = BED_OBJECTS.map((o) => ({
    id: o.filename,
    filename: o.filename,
    coordinates_by_percentage: pixelsToPercentage(rect.x + o.centerFrac[0] * rect.w, rect.y + o.centerFrac[1] * rect.h),
  }));
  pillowItem = {
    id: "pillow",
    filename: "pillow",
    coordinates_by_percentage: pixelsToPercentage(rect.x + PILLOW_CENTER_FRAC[0] * rect.w, rect.y + PILLOW_CENTER_FRAC[1] * rect.h),
  };
}

function bedObjectRect(obj) {
  const img = bedImage(obj.filename);
  const objectScale = bedRect().w / BED_MASTER_W;
  const w = img.width * objectScale;
  const h = img.height * objectScale;
  const { x, y } = topLeftFor(obj.coordinates_by_percentage, w, h);
  return { x, y, w, h };
}

function hitTestBedObject(obj, x, y) {
  const r = bedObjectRect(obj);
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function bedCoversTopY() {
  const rect = bedRect();
  return rect.y + BED_COVERS_TOP_FRAC * rect.h + bedCoversPullPx;
}

// A prop only counts as grabbable once whatever was drawn on top of it has
// moved out of the way — either the blanket's current top edge has moved
// down past its own center, or (bedobject_tooth's case) the pillow itself
// has been dragged off of it. The overlap check is generic rather than
// tooth-specific, so dragging the pillow on top of any other prop hides that
// one too, same as a real pillow would.
function bedObjectUncovered(obj) {
  const r = bedObjectRect(obj);
  const coveredByBlanket = r.y + r.h / 2 >= bedCoversTopY();
  const coveredByPillow = obj !== pillowItem && rectsOverlap(r, bedObjectRect(pillowItem));
  return !coveredByBlanket && !coveredByPillow;
}

function inBedCoversBand(x, y) {
  const rect = bedRect();
  const topY = bedCoversTopY();
  return x >= rect.x && x <= rect.x + rect.w && y >= topY && y <= rect.y + rect.h;
}

function clampBedCoversPull(px) {
  const rect = bedRect();
  return Math.min(Math.max(px, 0), rect.h * BED_COVERS_MAX_PULL_FRACTION);
}

function beginDragBedObject(obj) {
  const r = bedObjectRect(obj);
  heldBedObject = obj;
  bedObjectDragOffset = { x: mouseX - (r.x + r.w / 2), y: mouseY - (r.y + r.h / 2) };
  // Bring it to the front of the array so it's both drawn on top and wins
  // hit-testing priority over whatever it may now overlap. pillowItem isn't
  // part of this array — it's always drawn/hit-tested last regardless (see
  // drawBedScene) — so there's nothing to reorder for it.
  if (obj !== pillowItem) {
    bedObjects = bedObjects.filter((o) => o !== obj);
    bedObjects.push(obj);
  }
}

function updateDraggedBedObject() {
  const rect = bedRect();
  const img = bedImage(heldBedObject.filename);
  const objectScale = rect.w / BED_MASTER_W;
  const w = img.width * objectScale;
  const h = img.height * objectScale;
  const targetX = mouseX - bedObjectDragOffset.x;
  const targetY = mouseY - bedObjectDragOffset.y;
  const cx = Math.min(Math.max(targetX, rect.x + w / 2), rect.x + rect.w - w / 2);
  const cy = Math.min(Math.max(targetY, rect.y + h / 2), rect.y + rect.h - h / 2);
  heldBedObject.coordinates_by_percentage = pixelsToPercentage(cx, cy);
}

function drawBedObject(obj) {
  const img = bedImage(obj.filename);
  if (!img.complete || img.naturalWidth === 0) return;
  const r = bedObjectRect(obj);
  ctx.drawImage(img, r.x, r.y, r.w, r.h);
}

// Draw order (back to front): bedbase itself (drawn as an ordinary popup-tree
// node, not here), every prop not currently held (this is what puts
// bedobject_tooth underneath the pillow), the covers, the quilt on top of
// the covers, the pillow on top of that (unless it's the one being dragged),
// then whichever item — a prop or the pillow — is being dragged, on top of
// everything so it never disappears back under the blanket/pillow mid-drag.
function drawBedScene() {
  if (!bedObjects || !pillowItem) return;
  const rect = bedRect();

  bedObjects.forEach((obj) => {
    if (obj !== heldBedObject) drawBedObject(obj);
  });

  const coversImg = bedImage("covers");
  if (coversImg.complete && coversImg.naturalWidth !== 0) ctx.drawImage(coversImg, rect.x, rect.y + bedCoversPullPx, rect.w, rect.h);

  const quiltImg = bedImage("quilt");
  if (quiltImg.complete && quiltImg.naturalWidth !== 0) ctx.drawImage(quiltImg, rect.x, rect.y + bedCoversPullPx, rect.w, rect.h);

  if (pillowItem !== heldBedObject) drawBedObject(pillowItem);

  if (heldBedObject) drawBedObject(heldBedObject);
}

// -------------------- CAMERA APP --------------------
// Clicking app_camera opens cameraapp (a single do_dark_background layer, the
// same trick bank_home/coffeecounter/wizardgame/journalpopup use). The photo
// filmstrip lives outside the generic popup tree (like the coffee items and
// fridge notes do): five photos sit in the little boxes along the bottom, the
// current one drawn slightly bigger than the rest, and whichever one is
// current is also shown large in the main viewing area above the filmstrip
// (below the "CAMERA" title bar). Click a thumbnail to jump straight to it,
// or scroll (trackpad or wheel) while the app is open to step forward/back.

const CAMERA_FOLDER = IMAGES_FOLDER + "computer/camera app/";
const cameraImageCache = {};
function cameraImage(filename) {
  if (!cameraImageCache[filename]) {
    const img = new Image();
    img.onerror = () => pushError(`Missing image: ${CAMERA_FOLDER}${filename}.png`);
    img.src = `${CAMERA_FOLDER}${filename}.png`;
    cameraImageCache[filename] = img;
  }
  return cameraImageCache[filename];
}
const CAMERA_PHOTO_FILENAMES = [1, 2, 3, 4, 5].map((n) => `cameraphoto${n}`);
CAMERA_PHOTO_FILENAMES.forEach(cameraImage);

// A plain outline (transparent inside) drawn as a duplicate of the same frame
// each photo was drawn in, so it lines up with any of them — see
// drawCameraApp, which draws it stretched to exactly the main photo's own
// drawn rect rather than "contain"-fit on its own, so it still lines up even
// though the photos aren't all quite the same aspect ratio. Only overlaid on
// the big main photo, not the filmstrip thumbnails — it read as too busy
// shrunk down that small.
const CAMERA_FRAME_FILENAME = "cameraframe";
cameraImage(CAMERA_FRAME_FILENAME);

// Nudge these to line the frame up with the photos exactly — offsets are
// fractions of the main photo's own drawn width/height (not raw canvas
// pixels), so they hold steady whatever size the camera app happens to be
// scaled to. Positive CAMERA_FRAME_OFFSET_X/Y shifts the frame right/down;
// CAMERA_FRAME_SCALE grows (>1) or shrinks (<1) it around the photo's own
// center, in case the frame needs to sit slightly bigger/smaller than the
// photo itself rather than exactly on top of it.
const CAMERA_FRAME_OFFSET_X = 0;
const CAMERA_FRAME_OFFSET_Y = 0;
const CAMERA_FRAME_SCALE = 1.008;

let cameraPhotoIndex = 0;
// Each drawn thumbnail's actual on-screen rect (index-matched to
// CAMERA_PHOTO_FILENAMES), refreshed every frame by drawCameraApp — kept
// separate from the boxes' own fixed layout so a click can hit-test the
// boosted size of whichever thumbnail is currently selected, not just its box.
let cameraThumbRects = [];

// Called when app_camera is opened, so it always starts on the first photo.
function resetCameraApp() {
  cameraPhotoIndex = 0;
}

// Both rects below are fractions (0-1) of cameraapp's own width/height — (0,
// 0) is the popup's own top-left corner and (1, 1) its bottom-right, NOT the
// canvas — hand-picked off the background art the same way
// BANK_BALANCE_RECT/BANK_PRESS_RECT are, so they still line up correctly if
// cameraapp's position/scale ever changes. To nudge one: raise a xMin/yMin to
// move that edge right/down, raise a xMax/yMax to move that edge further
// right/down too (so raise both of a pair to shift the whole box without
// resizing it, or move just one edge to resize it).
//
// CAMERA_MAIN_RECT: the empty area below the title bar and above the
// filmstrip, where the current photo displays large.
//
// CAMERA_THUMB_ROW_RECT: just the vertical (yMin/yMax) span of the filmstrip
// row along the bottom — shared by all 5 boxes.
//
// CAMERA_THUMB_COLUMNS: the 5 boxes' individual horizontal (xMin/xMax) spans,
// left to right. They're not perfectly even widths in the hand-drawn art, so
// each box gets its own measured span rather than dividing the row evenly —
// keep that in mind if nudging one, the others don't auto-adjust to fill the gap.
// yOffset is a per-box vertical nudge (fraction of cameraapp's own height,
// same units as everything else here) on top of CAMERA_THUMB_ROW_RECT's
// shared band — positive moves that one box down, negative moves it up.
// Defaults to 0 (sits exactly in the shared band); only set on the boxes that
// actually need to sit higher/lower than the rest.
const CAMERA_MAIN_RECT = { xMin: 0.0657, xMax: 0.9504, yMin: 0.0804, yMax: 0.746 };
const CAMERA_THUMB_ROW_RECT = { yMin: 0.748, yMax: 0.896 };
const CAMERA_THUMB_COLUMNS = [
  { xMin: 0.0412, xMax: 0.2193, yOffset: 0 }, // box 1 (leftmost)
  { xMin: 0.2193, xMax: 0.4068, yOffset: 0.01 }, // box 2
  { xMin: 0.4068, xMax: 0.5771, yOffset: 0.02 }, // box 3
  { xMin: 0.5771, xMax: 0.7563, yOffset: 0.04 }, // box 4
  { xMin: 0.7563, xMax: 0.919, yOffset: 0.055 }, // box 5 (rightmost)
];

function cameraAppRect(node) {
  const w = node.img.width * node.scale;
  const h = node.img.height * node.scale;
  const { x, y } = topLeftFor(node.coordinates_by_percentage, w, h);
  return { x, y, w, h };
}

function cameraMainRect(node) {
  const { x, y, w, h } = cameraAppRect(node);
  return {
    x: x + CAMERA_MAIN_RECT.xMin * w,
    y: y + CAMERA_MAIN_RECT.yMin * h,
    w: (CAMERA_MAIN_RECT.xMax - CAMERA_MAIN_RECT.xMin) * w,
    h: (CAMERA_MAIN_RECT.yMax - CAMERA_MAIN_RECT.yMin) * h,
  };
}

function cameraThumbRect(node, i) {
  const { x, y, w, h } = cameraAppRect(node);
  const col = CAMERA_THUMB_COLUMNS[i];
  return {
    x: x + col.xMin * w,
    y: y + (CAMERA_THUMB_ROW_RECT.yMin + (col.yOffset || 0)) * h,
    w: (col.xMax - col.xMin) * w,
    h: (CAMERA_THUMB_ROW_RECT.yMax - CAMERA_THUMB_ROW_RECT.yMin) * h,
  };
}

// The current photo's thumbnail is drawn at CAMERA_SELECTED_THUMB_BOOST times
// the size of the others (allowed to bulge slightly outside its box, like it's
// been pulled forward in the filmstrip) rather than being clipped to it.
// Lower CAMERA_THUMB_PADDING/CAMERA_MAIN_PADDING to shrink the photos within
// their boxes (more margin around them); raise toward 1 to fill the box more
// fully. Raise/lower CAMERA_SELECTED_THUMB_BOOST to make the selected
// thumbnail more/less bigger than the rest (1 = same size as the others).
const CAMERA_THUMB_PADDING = 0.75; // fraction of a thumbnail box used at rest
const CAMERA_SELECTED_THUMB_BOOST = 1.2;
const CAMERA_MAIN_PADDING = 0.94; // fraction of CAMERA_MAIN_RECT used by the big photo

// "Contain"-fits img into rect (scaled by paddingFraction), centered — same
// idea as drawJournal's paper-fitting. Returns the on-screen rect actually
// drawn into, so callers can hit-test against exactly what's visible
// (including a boosted thumbnail's bulge past its box).
function drawContainImage(img, rect, paddingFraction = 1) {
  if (!img.complete || img.naturalWidth === 0) return null;
  const availW = rect.w * paddingFraction;
  const availH = rect.h * paddingFraction;
  const fitScale = Math.min(availW / img.width, availH / img.height);
  const w = img.width * fitScale;
  const h = img.height * fitScale;
  const x = rect.x + (rect.w - w) / 2;
  const y = rect.y + (rect.h - h) / 2;
  ctx.drawImage(img, x, y, w, h);
  return { x, y, w, h };
}

// Draws the current photo large in the main viewing area, then the filmstrip
// of all 5 thumbnails along the bottom — returns each thumbnail's actual drawn
// rect (keyed by index) so click handling can hit-test the boosted size of
// whichever one is currently selected, not just its box.
function drawCameraApp(node) {
  const mainPhotoRect = drawContainImage(cameraImage(CAMERA_PHOTO_FILENAMES[cameraPhotoIndex]), cameraMainRect(node), CAMERA_MAIN_PADDING);

  const frameImg = cameraImage(CAMERA_FRAME_FILENAME);
  if (mainPhotoRect && frameImg.complete && frameImg.naturalWidth !== 0) {
    const fw = mainPhotoRect.w * CAMERA_FRAME_SCALE;
    const fh = mainPhotoRect.h * CAMERA_FRAME_SCALE;
    const fx = mainPhotoRect.x + mainPhotoRect.w / 2 - fw / 2 + CAMERA_FRAME_OFFSET_X * mainPhotoRect.w;
    const fy = mainPhotoRect.y + mainPhotoRect.h / 2 - fh / 2 + CAMERA_FRAME_OFFSET_Y * mainPhotoRect.h;
    ctx.drawImage(frameImg, fx, fy, fw, fh);
  }

  CAMERA_PHOTO_FILENAMES.forEach((filename, i) => {
    const selected = i === cameraPhotoIndex;
    const padding = selected ? CAMERA_THUMB_PADDING * CAMERA_SELECTED_THUMB_BOOST : CAMERA_THUMB_PADDING;
    cameraThumbRects[i] = drawContainImage(cameraImage(filename), cameraThumbRect(node, i), padding);
  });
}

// Returns true once it's handled the click (so the generic click logic
// further down knows to do nothing else) — a miss just falls through to that
// generic logic, same as the wizard game/journal do.
function handleCameraAppClick(x, y) {
  for (let i = 0; i < cameraThumbRects.length; i++) {
    const r = cameraThumbRects[i];
    if (r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
      cameraPhotoIndex = i;
      return true;
    }
  }
  return false;
}

// Scrolling (trackpad left/right, or a plain mouse wheel) while the app is
// open steps to the next/previous photo, looping around at either end.
canvas.addEventListener(
  "wheel",
  (e) => {
    if (openPath[openPath.length - 1].id !== "cameraapp") return;
    e.preventDefault();
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (!delta) return;
    const step = delta > 0 ? 1 : -1;
    cameraPhotoIndex = (cameraPhotoIndex + step + CAMERA_PHOTO_FILENAMES.length) % CAMERA_PHOTO_FILENAMES.length;
  },
  { passive: false }
);

// -------------------- DRAW LOOP --------------------

function draw() {
  try {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const hidden = collectHiddenIds();

    // Each opened popup is drawn in order (room_background, then each
    // nested popup opened on top of it), immediately followed by its own
    // children — so z-index increases with nesting depth and every layer's
    // items stack correctly on top of what came before.
    openPath.forEach((node) => {
      if (hidden.has(node.id)) return;

      // Only the topmost/currently-open layer is allowed to shake — e.g.
      // once the laptop's desktop popup is open, the laptop itself (still
      // drawn in the background, as room_background's child) should hold
      // still; only things belonging to the desktop (the active layer)
      // still shake.
      const isActiveLayer = node === openPath[openPath.length - 1];

      // Dims everything drawn so far (the layers behind this node), leaving
      // this node and its own children — drawn next — at full brightness.
      if (node.do_dark_background) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      safeDrawImage(node.img, node.coordinates_by_percentage, node.scale, node.id, node.shake && isActiveLayer ? shakeAngleRadians(node.id) : 0, node.bounce && isActiveLayer ? bounceOffsetY(node.id) : 0);
      if (node.text) safeTry(`affirmation text: ${node.id}`, () => drawAffirmationText(node));
      if (node.id === "coffeecounter") safeTry("coffee counter", drawCoffeeCounter);
      if (node.id === "bank_home") safeTry("bank balance", () => drawBankBalance(node));
      if (node.id === "wizardgame") safeTry("wizard game", () => drawWizardGame(node));
      if (node.id === "journalpopup") safeTry("journal", () => drawJournal(node));
      if (node.id === "fridgepopup") safeTry("fridge", drawFridgeScene);
      if (node.id === "bedpopup") safeTry("bed", drawBedScene);
      if (node.id === "cameraapp") safeTry("camera app", () => drawCameraApp(node));

      node.children.forEach((child) => {
        if (hidden.has(child.id) || !child.img) return;
        safeDrawImage(child.img, child.coordinates_by_percentage, child.scale, child.id, child.shake && isActiveLayer ? shakeAngleRadians(child.id) : 0, child.bounce && isActiveLayer ? bounceOffsetY(child.id) : 0);
      });

      // Drawn as part of the room layer (rather than always-on-top like
      // drawCarriedMug) so it dims/gets covered correctly once a popup opens
      // on top of the room, same as any other room prop.
      if (node.id === "room_background") safeTry("placed mug", drawPlacedMug);
    });

    safeTry("carried mug", drawCarriedMug);
    safeTry("wizard cursor", drawWizardCursor);
    safeTry("fridge pen cursor", drawFridgePenCursor);
    safeTry("wizard music", updateWizardMusic);
    drawErrors();
  } catch (err) {
    pushError(`FATAL DRAW LOOP: ${err.message}`);
  }

  requestAnimationFrame(draw);
}

draw();

// -------------------- DESKTOP ALERT (DRAGGABLE) --------------------
// The "compromised" alert on the desktop has no children of its own — it's
// not clickable/closeable via the normal popup tree — but it can be dragged
// around by the mouse, confined to the desktop's own image bounds, purely as
// a fun detail. It never shakes (no `shake: true` on its tree node).

let draggingAlert = false;
let alertDragOffset = { x: 0, y: 0 }; // mouse position minus the alert's center, in canvas pixels

function desktopRect() {
  const w = desktopNode.img.width * desktopNode.scale;
  const h = desktopNode.img.height * desktopNode.scale;
  const { x, y } = topLeftFor(desktopNode.coordinates_by_percentage, w, h);
  return { x, y, w, h };
}

// x/y is the current mouse position — alertDragOffset (captured on
// mousedown) keeps the alert from jumping to center on the cursor.
function dragAlertTo(x, y) {
  const rect = desktopRect();
  const w = alertNode.img.width * alertNode.scale;
  const h = alertNode.img.height * alertNode.scale;
  const targetX = x - alertDragOffset.x;
  const targetY = y - alertDragOffset.y;
  const cx = Math.min(Math.max(targetX, rect.x + w / 2), rect.x + rect.w - w / 2);
  const cy = Math.min(Math.max(targetY, rect.y + h / 2), rect.y + rect.h - h / 2);
  alertNode.coordinates_by_percentage = pixelsToPercentage(cx, cy);
}

// -------------------- EVENTS --------------------

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  if (draggingAlert) {
    dragAlertTo(mouseX, mouseY);
    canvas.style.cursor = "grabbing";
    return;
  }

  // The coffee counter has its own click handling below, so it gets its own
  // (simpler) cursor rule too: always a pointer while it's open.
  if (openPath[openPath.length - 1].id === "coffeecounter") {
    canvas.style.cursor = "pointer";
    return;
  }

  // The wizard sprite (drawn in drawWizardCursor) follows the mouse as a
  // companion, but the native cursor stays visible too so it's easy to see
  // exactly where the pointer is.
  if (openPath[openPath.length - 1].id === "wizardgame") {
    canvas.style.cursor = "default";
    return;
  }

  if (openPath[openPath.length - 1].id === "desktop" && hitTest(alertNode, mouseX, mouseY)) {
    canvas.style.cursor = "grab";
    return;
  }

  if (openPath[openPath.length - 1].id === "fridgepopup") {
    if (editingNote) {
      canvas.style.cursor = "none"; // replaced by the drawn pen cursor (drawFridgePenCursor)
      return;
    }
    if (draggingDrawer) {
      fridgeDrawerY = clampDrawerY(mouseY - drawerDragOffsetY);
      canvas.style.cursor = "grabbing";
      return;
    }
    if (heldMagnet) {
      updateDraggedMagnet();
      canvas.style.cursor = "grabbing";
      return;
    }
    if (heldNote) {
      canvas.style.cursor = "grabbing";
      return;
    }

    const hovering =
      inDrawerBand(mouseX, mouseY) ||
      fridgeMagnets.some((m) => hitTestMagnet(m, mouseX, mouseY)) ||
      fridgeNotes.some((n) => n.location === "fridge" && hitTestFridgeNote(n, mouseX, mouseY));
    canvas.style.cursor = hovering ? "grab" : "default";
    return;
  }

  if (openPath[openPath.length - 1].id === "bedpopup") {
    if (draggingBedCovers) {
      bedCoversPullPx = clampBedCoversPull(mouseY - bedCoversDragOffsetY);
      canvas.style.cursor = "grabbing";
      return;
    }
    if (heldBedObject) {
      updateDraggedBedObject();
      canvas.style.cursor = "grabbing";
      return;
    }

    const hovering =
      hitTestBedObject(pillowItem, mouseX, mouseY) ||
      inBedCoversBand(mouseX, mouseY) ||
      bedObjects.some((o) => bedObjectUncovered(o) && hitTestBedObject(o, mouseX, mouseY));
    canvas.style.cursor = hovering ? "grab" : "default";
    return;
  }

  if (openPath[openPath.length - 1].id === "cameraapp") {
    const hovering = cameraThumbRects.some(
      (r) => r && mouseX >= r.x && mouseX <= r.x + r.w && mouseY >= r.y && mouseY <= r.y + r.h
    );
    canvas.style.cursor = hovering ? "pointer" : "default";
    return;
  }

  const clickable = getClickableNodeAt(mouseX, mouseY);
  canvas.style.cursor = clickable ? "pointer" : "default";
});

// Debug helper: copies the click's [x%, y%] (percentage of the whole
// canvas — the same system every coordinates_by_percentage in this file
// uses, whether it's a room object or something inside a popup) to the
// clipboard, so it can be pasted straight into the code.
function copyClickCoordinates(x, y) {
  if (!CLICK_TO_SHOW_COORDINATES) return;
  const xPct = (x / canvas.width) * 100;
  const yPct = (y / canvas.height) * 100;
  const coords = `[${xPct.toFixed(1)}, ${yPct.toFixed(1)}]`;
  navigator.clipboard.writeText(coords).catch((err) => pushError(`Clipboard copy failed: ${err.message}`));
}

canvas.addEventListener("mousedown", () => {
  const topNode = openPath[openPath.length - 1];

  // Any click at all closes out an in-progress note edit — if it's actually a
  // (no-move) click back on that same note, finalizeNoteDrop below reopens it
  // in the same frame, so continuing to type on it feels uninterrupted.
  editingNote = null;

  // The compromised alert is a plain decoration (no children, so never
  // "clickable" via the generic popup tree) — clicking it just starts a
  // drag instead of opening or closing anything. Only live while the
  // desktop itself is the topmost layer, same as the app icons around it.
  if (topNode.id === "desktop" && hitTest(alertNode, mouseX, mouseY)) {
    draggingAlert = true;
    const [xPct, yPct] = alertNode.coordinates_by_percentage;
    alertDragOffset = { x: mouseX - (xPct / 100) * canvas.width, y: mouseY - (yPct / 100) * canvas.height };
    return;
  }

  // The calendar has no children to reveal, so it's never a "clickable" node
  // via the generic popup tree — its only job is opening the stuff-to-do
  // page in a new tab, so it's special-cased here instead, the same way the
  // coffee counter/bank/wizard mechanics are. Only live while standing in
  // the main room itself (nothing else open on top of it).
  if (openPath.length === 1 && hitTest(calendarNode, mouseX, mouseY)) {
    window.open("https://alexroginski.com/stuff_to_do/", "_blank", "noopener,noreferrer");
    return;
  }

  // The drawing has no children either — same special-case pattern as the
  // calendar, just linking out to the artist's own site instead.
  if (openPath.length === 1 && hitTest(drawingNode, mouseX, mouseY)) {
    window.open("https://laurenbryantart.com/", "_blank", "noopener,noreferrer");
    return;
  }

  // A click inside the wizard game's own background scores a hit (or misses
  // harmlessly); a click outside it falls through to the generic
  // click-outside-closes-the-popup logic further down, same as every other
  // app — so clicking out of the wizard game's background quits it, back to
  // the desktop.
  if (topNode.id === "wizardgame") {
    const rect = wizardGameRect(topNode);
    const insideGame = mouseX >= rect.x && mouseX <= rect.x + rect.w && mouseY >= rect.y && mouseY <= rect.y + rect.h;
    if (insideGame) {
      handleWizardGameClick(mouseX, mouseY);
      return;
    }
  }

  if (topNode.id === "journalpopup") {
    const w = topNode.img.width * topNode.scale;
    const h = topNode.img.height * topNode.scale;
    const { x, y } = topLeftFor(topNode.coordinates_by_percentage, w, h);
    const insideJournal = mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
    if (insideJournal) {
      handleJournalClick();
      return;
    }
  }

  // Clicking inside the fridge scene checks its layers topmost-first: a note
  // (in the drawer, or already stuck to the fridge) or the drawer itself if
  // the click falls within the drawer's own currently visible rect, then
  // magnets, then notes on the fridge door. A miss on all of those falls
  // through to the generic click-outside-closes-the-popup logic further
  // down, the same as every other app.
  if (topNode.id === "fridgepopup") {
    if (inDrawerBand(mouseX, mouseY)) {
      fridgeDrawerDiscovered = true; // stop bouncing now that the user found it
      const dRect = drawerRect();
      const drawerNote = [...fridgeNotes].reverse().find((n) => n.location === "drawer" && hitTestFridgeNote(n, mouseX, mouseY));
      if (drawerNote) { beginDragNote(drawerNote); return; }
      draggingDrawer = true;
      drawerDragOffsetY = mouseY - dRect.y;
      return;
    }

    const magnet = [...fridgeMagnets].reverse().find((m) => hitTestMagnet(m, mouseX, mouseY));
    if (magnet) { beginDragMagnet(magnet); return; }

    const fridgeNote = [...fridgeNotes].reverse().find((n) => n.location === "fridge" && hitTestFridgeNote(n, mouseX, mouseY));
    if (fridgeNote) { beginDragNote(fridgeNote); return; }
  }

  // Clicking inside the bed scene checks the pillow first (it's always the
  // topmost layer), then the covers/quilt band (drag the blanket), then
  // whichever uncovered prop is topmost. A miss on all of those falls
  // through to the generic click-outside-closes-the-popup logic further
  // down, the same as every other app.
  if (topNode.id === "bedpopup") {
    if (hitTestBedObject(pillowItem, mouseX, mouseY)) { beginDragBedObject(pillowItem); return; }

    if (inBedCoversBand(mouseX, mouseY)) {
      draggingBedCovers = true;
      bedCoversDragOffsetY = mouseY - bedCoversPullPx;
      return;
    }

    const obj = [...bedObjects].reverse().find((o) => bedObjectUncovered(o) && hitTestBedObject(o, mouseX, mouseY));
    if (obj) { beginDragBedObject(obj); return; }
  }

  if (topNode.id === "cameraapp") {
    if (handleCameraAppClick(mouseX, mouseY)) return;
  }

  if (topNode.id === "coffeecounter") {
    const w = topNode.img.width * topNode.scale;
    const h = topNode.img.height * topNode.scale;
    const { x, y } = topLeftFor(topNode.coordinates_by_percentage, w, h);
    const insideCounter = mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;

    if (insideCounter) {
      // Copies coordinates in addition to (not instead of) the normal
      // pick-up/place/brew handling below — same "always copy" rule as
      // everywhere else, so you can still read off counter positions.
      copyClickCoordinates(mouseX, mouseY);
      handleCoffeeCounterClick(mouseX, mouseY);
      return;
    }

    // Clicking outside the counter while carrying something cancels the hold
    // (see cancelHeldItem) instead of leaving it stuck to the cursor with no
    // way out — then falls through to the normal close-the-popup logic below,
    // same as any other miss.
    if (heldItem) cancelHeldItem();
  }

  // The bank's PRESS button is checked regardless of what's on top of it
  // (dollar bills stack on top of bank_home the same way affirmation popups
  // stack on the desktop), so it keeps working even after several presses.
  const bankHomeNode = openPath.find((n) => n.id === "bank_home");
  if (bankHomeNode && handleBankPressClick(bankHomeNode, mouseX, mouseY)) return;

  // A pile of stacked clones (affirmation popups or dollar bills) can still
  // be closed one at a time by clicking just outside the topmost one (the
  // fallback further down handles that) — but clicking anywhere outside the
  // desktop entirely clears the whole pile in one click, landing back at
  // whatever was open right beneath it (the desktop itself for affirmations,
  // bank_home for the bank), instead of needing one click per popup.
  if (openPath[openPath.length - 1].stacked) {
    const w = desktopNode.img.width * desktopNode.scale;
    const h = desktopNode.img.height * desktopNode.scale;
    const { x, y } = topLeftFor(desktopNode.coordinates_by_percentage, w, h);
    const insideDesktop = mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
    if (!insideDesktop) {
      while (openPath.length > 1 && openPath[openPath.length - 1].stacked) openPath.pop();
      return;
    }
  }

  const node = getClickableNodeAt(mouseX, mouseY);
  if (node) {
    if (node.id === "app_affirmations") {
      openPath.push(spawnRandomPopup(desktopNode, [node.children[0]], {
        text: affirmations[Math.floor(Math.random() * affirmations.length)],
      }));
    } else if (node.id === "app_bank") {
      bankBalance = randomBankBalance(); // fresh balance every time it's opened
      openPath.push(...node.children);
    } else if (node.id === "app_wizard") {
      resetWizardGame(); // fresh score/pieces every time it's opened
      startWizardMusic();
      openPath.push(...node.children);
    } else if (node.id === "journal") {
      resetJournal(); // start back on the most recent entry every time it's opened
      openPath.push(...node.children);
    } else if (node.id === "app_camera") {
      resetCameraApp(); // start back on the first photo every time it's opened
      openPath.push(...node.children);
    } else if (node.id === "notes") {
      if (!fridgeMagnets) initFridgeMagnets(); // first open only — state persists after that
      if (!fridgeNotes) initFridgeNotes();
      openPath.push(...node.children);
    } else if (node.id === "bed") {
      if (!bedObjects) initBedObjects(); // first open only — state persists after that
      openPath.push(...node.children);
    } else {
      openPath.push(...node.children);
    }
    return;
  }

  // Debug helper: on any page/popup depth, clicking on non-clickable space
  // also copies the click's [x%, y%] to clipboard, in addition to (not
  // instead of) the normal close-popup navigation below.
  copyClickCoordinates(mouseX, mouseY);

  const top = openPath[openPath.length - 1];
  const w = top.img ? top.img.width * top.scale : 0;
  const h = top.img ? top.img.height * top.scale : 0;
  const { x, y } = top.img ? topLeftFor(top.coordinates_by_percentage, w, h) : { x: 0, y: 0 };

  const inside =
    top.img &&
    mouseX >= x && mouseX <= x + w &&
    mouseY >= y && mouseY <= y + h;

  if (openPath.length > 1 && !inside) closePopup(); // go back one level in the popup chain
});

// Listens on window (not just canvas) so a drag that ends with the mouse
// released outside the canvas still stops instead of sticking to the cursor.
window.addEventListener("mouseup", () => {
  draggingAlert = false;
  draggingDrawer = false;
  heldMagnet = null;
  if (heldNote) {
    finalizeNoteDrop();
    heldNote = null;
  }
  draggingBedCovers = false;
  heldBedObject = null;
});

// Typing on whichever fridge note is currently open for editing (see
// finalizeNoteDrop/editingNote) — a plain keydown buffer, the same idea as
// every other bit of text in this file (affirmations/journal/bank balance)
// just draws to canvas rather than a real input, since there's no other
// keyboard-driven mechanic in the file to conflict with it.
window.addEventListener("keydown", (e) => {
  if (!editingNote) return;

  const maxChars = NOTE_TEXT_BOX[editingNote.filename].maxChars || NOTE_MAX_CHARS;

  if (e.key === "Backspace") {
    editingNote.text = editingNote.text.slice(0, -1);
    e.preventDefault();
  } else if (e.key === "Enter" || e.key === "Escape") {
    editingNote = null;
  } else if (e.key.length === 1 && editingNote.text.length < maxChars) {
    editingNote.text += e.key;
  }
});

// Double-clicking sets the carried coffee mug down on the spot — only while
// standing in the main room itself (openPath.length === 1), not inside the
// laptop, coffee counter, or any other popup/minigame.
canvas.addEventListener("dblclick", (e) => {
  if (openPath.length > 1) return;

  const rect = canvas.getBoundingClientRect();
  setDownCarriedMug(e.clientX - rect.left, e.clientY - rect.top);
});
