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
      { path: "main_room/bed.png", coordinates_by_percentage: [11.3, 28], scale: 1 },
      { path: "main_room/pattern.png", coordinates_by_percentage: [50.1, 8.5], scale: 1 },
      { path: "main_room/calendar.png", coordinates_by_percentage: [88, 8.1], scale: 1 },
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
                    id: "bank_home", path: "computer/bank_home.png",
                    coordinates_by_percentage: [50, 50], scale: 0.49,
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
              { path: "computer/app_camera.png", coordinates_by_percentage: [66.8, 29.7], scale: APP_SIZE },
              { path: "computer/app_wizard.png", coordinates_by_percentage: [53.2, 48.5], scale: APP_SIZE },
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

      { path: "main_room/teapot.png", coordinates_by_percentage: [91.5, 40], scale: 1 },
      { path: "main_room/notes.png", coordinates_by_percentage: [93.2, 35], scale: 1 },
      { path: "main_room/paper.png", coordinates_by_percentage: [34.0, 70.3], scale: 1 },
      { path: "main_room/drawing.png", coordinates_by_percentage: [52.7, 26], scale: 1 },
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
// level — same rule at every depth.

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
function shakeAngleRadians(id) {
  const phase = [...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const t = (performance.now() + phase * 137) / SHAKE_PERIOD_MS;
  return (Math.sin(t * Math.PI * 2) * SHAKE_MAX_DEGREES * Math.PI) / 180;
}

function safeDrawImage(img, coordinates_by_percentage, scale, label, rotationRadians = 0) {
  try {
    if (!img) return;
    if (!img.complete || img.naturalWidth === 0) return;

    const w = img.width * scale;
    const h = img.height * scale;
    const { x, y } = topLeftFor(coordinates_by_percentage, w, h);

    if (rotationRadians) {
      ctx.save();
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate(rotationRadians);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    } else {
      ctx.drawImage(img, x, y, w, h);
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
  { kind: "mug", mugType: "papercup", state: "empty", topping: null, coordinates_by_percentage: [38, 28], scale: 1 },
  { kind: "mug", mugType: "greenmug", state: "empty", topping: null, coordinates_by_percentage: [28, 45], scale: 1 },
  { kind: "mug", mugType: "redmug", state: "empty", topping: null, coordinates_by_percentage: [35, 65], scale: 1 },
  { kind: "mug", mugType: "wavymug", state: "empty", topping: null, coordinates_by_percentage: [47, 70], scale: 1 },
  { kind: "mug", mugType: "yellowmug", state: "empty", topping: null, coordinates_by_percentage: [40, 44], scale: 1 },
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
    }
    return; // no valid mug: stays held, nothing more to do
  }

  let applied = false;
  if (targetMug) {
    if (MILK_LIKE.includes(item.kind) && targetMug.state === "coffee") {
      targetMug.state = "coffee_milk";
      applied = true;
    }
    if (TOPPING_LIKE.includes(item.kind) && targetMug.state !== "empty") {
      targetMug.topping = item.kind;
      applied = true;
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
// just look broken.
function drawCarriedMug() {
  if (!lastCoffeeMug) return;
  if (openPath[openPath.length - 1].id === "coffeecounter") return;

  const img = coffeeImage(itemImagePath(lastCoffeeMug));
  if (!img.complete || img.naturalWidth === 0) return;

  const w = img.width * CARRIED_MUG_SCALE;
  const h = img.height * CARRIED_MUG_SCALE;
  const x = mouseX + CARRIED_MUG_OFFSET.x;
  const y = mouseY + CARRIED_MUG_OFFSET.y;

  ctx.drawImage(img, x, y, w, h);
  drawMugTopping(lastCoffeeMug, x, y, w, h, CARRIED_MUG_SCALE / lastCoffeeMug.scale);
}

function drawCoffeeCounter() {
  safeDrawImage(coffeeImage(machineImagePath()), MACHINE_COORDS, MACHINE_SCALE, "coffee machine", machineDiscovered ? 0 : shakeAngleRadians("coffee_machine"));

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

      safeDrawImage(node.img, node.coordinates_by_percentage, node.scale, node.id, node.shake && isActiveLayer ? shakeAngleRadians(node.id) : 0);
      if (node.text) safeTry(`affirmation text: ${node.id}`, () => drawAffirmationText(node));
      if (node.id === "coffeecounter") safeTry("coffee counter", drawCoffeeCounter);
      if (node.id === "bank_home") safeTry("bank balance", () => drawBankBalance(node));

      node.children.forEach((child) => {
        if (hidden.has(child.id) || !child.img) return;
        safeDrawImage(child.img, child.coordinates_by_percentage, child.scale, child.id, child.shake && isActiveLayer ? shakeAngleRadians(child.id) : 0);
      });
    });

    safeTry("carried mug", drawCarriedMug);
    drawErrors();
  } catch (err) {
    pushError(`FATAL DRAW LOOP: ${err.message}`);
  }

  requestAnimationFrame(draw);
}

draw();

// -------------------- EVENTS --------------------

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  // The coffee counter has its own click handling below, so it gets its own
  // (simpler) cursor rule too: always a pointer while it's open.
  if (openPath[openPath.length - 1].id === "coffeecounter") {
    canvas.style.cursor = "pointer";
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

    // Clicking outside the counter while carrying something would normally
    // close the popup — instead, require setting it down first so nothing
    // gets stranded mid-task.
    if (heldItem) return;
  }

  // The bank's PRESS button is checked regardless of what's on top of it
  // (dollar bills stack on top of bank_home the same way affirmation popups
  // stack on the desktop), so it keeps working even after several presses.
  const bankHomeNode = openPath.find((n) => n.id === "bank_home");
  if (bankHomeNode && handleBankPressClick(bankHomeNode, mouseX, mouseY)) return;

  const node = getClickableNodeAt(mouseX, mouseY);
  if (node) {
    if (node.id === "app_affirmations") {
      openPath.push(spawnRandomPopup(desktopNode, [node.children[0]], {
        text: affirmations[Math.floor(Math.random() * affirmations.length)],
      }));
    } else if (node.id === "app_bank") {
      bankBalance = randomBankBalance(); // fresh balance every time it's opened
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
