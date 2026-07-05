const affirmations = [
  "I am loved",
  "I am great",
  "hello"
];

const APP_SIZE = 0.5;

let images = {
  room_background: {
    path: "main_room/room_background.png", coordinates_by_percentage: [0, 0], scale: 0.92,
    children: [
      { path: "main_room/bed.png", coordinates_by_percentage: [11.8, 30.1], scale: 0.414 },
      { path: "main_room/pattern.png", coordinates_by_percentage: [50.1, 8.5], scale: 0.46 },
      { path: "main_room/calendar.png", coordinates_by_percentage: [83.3, 8.1], scale: 0.3588 },
      { path: "main_room/flowers.png", coordinates_by_percentage: [91.9, 25.9], scale: 0.368 },
      { path: "main_room/books.png", coordinates_by_percentage: [32.2, 40.6], scale: 0.414 },

      {
        path: "main_room/laptop.png", coordinates_by_percentage: [44.4, 16.3], scale: 0.46,
        children: [
          {
            path: "computer/desktop.png", coordinates_by_percentage: [50, 50], scale: 0.42,
            do_dark_background: true,
            children: [
              { path: "computer/app_bank.png", coordinates_by_percentage: [48.4, 30.0], scale: APP_SIZE },
              { path: "computer/app_borders.png", coordinates_by_percentage: [65.7, 55.7], scale: APP_SIZE },
              { path: "computer/app_camera.png", coordinates_by_percentage: [66.8, 29.7], scale: APP_SIZE },
              { path: "computer/app_wizard.png", coordinates_by_percentage: [53.2, 48.5], scale: APP_SIZE },
              // app_file.png is reused for multiple items, so its id must be given explicitly to avoid duplicates.
              { id: "app_file1", path: "computer/app_file.png", coordinates_by_percentage: [19.6, 30.2], scale: 0.42 },
              { id: "app_file2", path: "computer/app_file.png", coordinates_by_percentage: [19.6, 45.2], scale: 0.42 },
              { id: "app_file3", path: "computer/app_file.png", coordinates_by_percentage: [19.6, 60.2], scale: 0.42 }, 

              { path: "computer/alert_compromised_wizard.png", coordinates_by_percentage: [33.9, 68.0], scale: APP_SIZE },

              {
                path: "computer/app_affirmations.png", coordinates_by_percentage: [35.5, 30.4], scale: 0.42,
                children: [
                  { path: "computer/affirmations_popup.png", coordinates_by_percentage: [10, 10], scale: 0.4 },
                ]
              },
            ]
          }
        ]
      },

      { path: "main_room/teapot.png", coordinates_by_percentage: [91.5, 42.8], scale: 0.414 },
      { path: "main_room/notes.png", coordinates_by_percentage: [92.7, 34.5], scale: 0.36 },
      { path: "main_room/paper.png", coordinates_by_percentage: [34.0, 70.3], scale: 0.46 },
      { path: "main_room/drawing.png", coordinates_by_percentage: [52.2, 28.5], scale: 0.36 },
      { path: "main_room/laundry.png", coordinates_by_percentage: [26.2, 32.8], scale: 0.41 },

      // Clicking the coffeemaker opens the coffee counter minigame — see
      // the "COFFEE MINIGAME" section further down for how it works.
      { path: "main_room/coffeemaker.png", coordinates_by_percentage: [83.5, 18.7], scale: 0.46, children: [
        {
          // The coffee minigame code below keys off this id — the file is
          // "newnewcounter.png" so it needs to be set explicitly rather
          // than relying on the filename-derived default.
          id: "coffeecounter",
          path: "coffeemaker/newnewcounter.png",
          // Positioned so its right and bottom edges sit flush against the
          // canvas's right and bottom edges (center = canvas edge minus half
          // the scaled image size), rather than centered like other popups.
          // Image is 4461x3326 native; scale 0.277 -> 1236x921 on the canvas.
          coordinates_by_percentage: [57.45, 52.02], scale: 0.277,
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
const CLICK_TO_SHOW_COORDINATES = true;

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

function safeDrawImage(img, coordinates_by_percentage, scale, label) {
  try {
    if (!img) return;
    if (!img.complete || img.naturalWidth === 0) return;

    const w = img.width * scale;
    const h = img.height * scale;
    const { x, y } = topLeftFor(coordinates_by_percentage, w, h);
    ctx.drawImage(img, x, y, w, h);
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

// Clicking app_affirmations doesn't reveal its template child directly —
// it clones the template with a random affirmation and a random position
// inside the desktop's bounds, so every click stacks a brand new popup.
function spawnAffirmationPopup(template) {
  const w = template.img.width * template.scale;
  const h = template.img.height * template.scale;

  const dw = desktopNode.img.width * desktopNode.scale;
  const dh = desktopNode.img.height * desktopNode.scale;
  const { x: dx, y: dy } = topLeftFor(desktopNode.coordinates_by_percentage, dw, dh);

  // Keep spawned popups off the desktop's edges by a 5% margin on each side.
  const marginX = dw * 0.05;
  const marginY = dh * 0.05;

  const minX = dx + marginX;
  const minY = dy + marginY;
  const maxX = dx + dw - marginX - w;
  const maxY = dy + dh - marginY - h;

  const topLeftX = minX + Math.random() * Math.max(0, maxX - minX);
  const topLeftY = minY + Math.random() * Math.max(0, maxY - minY);

  // coordinates_by_percentage store the CENTER, so convert the chosen top-left box back
  // (and from pixels into a percentage of the canvas's width/height).
  const x = topLeftX + w / 2;
  const y = topLeftY + h / 2;
  const xPct = (x / canvas.width) * 100;
  const yPct = (y / canvas.height) * 100;

  return {
    id: template.id,
    path: template.path,
    img: template.img,
    coordinates_by_percentage: [xPct, yPct],
    scale: template.scale,
    children: [],
    hide: [],
    text: affirmations[Math.floor(Math.random() * affirmations.length)],
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
let coffeeItems = [
  { kind: "mug", mugType: "papercup", state: "empty", topping: null, coordinates_by_percentage: [30, 24], scale: 0.32 },
  { kind: "mug", mugType: "greenmug", state: "empty", topping: null, coordinates_by_percentage: [23.4, 39], scale: 0.32 },
  { kind: "mug", mugType: "redmug", state: "empty", topping: null, coordinates_by_percentage: [24, 60], scale: 0.32 },
  { kind: "mug", mugType: "wavymug", state: "empty", topping: null, coordinates_by_percentage: [35, 55], scale: 0.32 },
  { kind: "mug", mugType: "yellowmug", state: "empty", topping: null, coordinates_by_percentage: [32.4, 40], scale: 0.32 },
  { kind: "milk", coordinates_by_percentage: [74.4, 40], scale: 0.26 },
  { kind: "creamer", coordinates_by_percentage: [74.4, 55], scale: 0.26 },
  { kind: "whip", coordinates_by_percentage: [82.6, 50], scale: 0.26 },
  { kind: "cinnamon", coordinates_by_percentage: [82.6, 65], scale: 0.26 },
];

// Toppings (not mugs) snap back to this starting spot once they're
// successfully used on a mug, so the counter resets itself instead of
// toppings piling up wherever they were last used.
coffeeItems.forEach((item) => {
  if (item.kind !== "mug") item.home = item.coordinates_by_percentage;
});

// "empty" -> waiting to brew. "brewing" -> mid-brew, machine not clickable.
// "full" -> ready to pick up and pour. "nocarafe" -> the carafe is out and
// about (held) so the machine itself does nothing until that carafe gets
// poured into a mug and disappears.
let machineState = "empty";
// One shared position + size for the machine, however it currently looks —
// change these two and every state (empty/brewing/full/nocarafe) moves and
// resizes together, since they all share this same footprint.
const MACHINE_COORDS = [57.25, 40];
const MACHINE_SCALE = 0.4;
const CARAFE_SCALE = 0.16;
const BREW_TIME_MS = 2500;

// Milk and creamer both just move a mug from "coffee" to "coffee_milk" —
// two different toppings with the same effect. Whip and cinnamon both sit
// as a dusting/dollop drawn on top of the mug. Since the mugs' rims are all
// different shapes/sizes, each topping's placement is tuned per mug type
// below (rather than needing a hand-drawn combo image for every mug) —
// `default` is used for any mug type that doesn't have its own entry.
// Nudge a mug's `scale`/`offsetX`/`offsetY` (canvas pixels, from the mug's
// own center/top) directly to fix that mug's whipped cream or cinnamon.
const MILK_LIKE = ["milk", "creamer"];
const TOPPING_LIKE = ["whip", "cinnamon"];
const TOPPING_STYLE = {
  whip: {
    image: "topping_output_whippedcream",
    default: { scale: 0.26, offsetX: 0, offsetY: -45 },
    papercup: { scale: 0.26, offsetX: 0, offsetY: -45 },
    greenmug: { scale: 0.26, offsetX: 0, offsetY: -45 },
    redmug: { scale: 0.29, offsetX: -17, offsetY: -28 },
    wavymug: { scale: 0.26, offsetX: 0, offsetY: -45 },
    yellowmug: { scale: 0.26, offsetX: 0, offsetY: -45 },
  },
  cinnamon: {
    image: "topping_output_cinnamon",
    default: { scale: 0.3, offsetX: 0, offsetY: -9 },
    papercup: { scale: 0.3, offsetX: 0, offsetY: -9 },
    greenmug: { scale: 0.3, offsetX: 0, offsetY: -9 },
    redmug: { scale: 0.3, offsetX: 0, offsetY: -9 },
    wavymug: { scale: 0.3, offsetX: 0, offsetY: -9 },
    yellowmug: { scale: 0.3, offsetX: 0, offsetY: -9 },
  },
};

// While held, milk/creamer/whip/cinnamon tilt like they're being poured.
// Positive = tips clockwise; flip the sign if it looks backwards.
const TOPPING_TILT_DEGREES = 25;

// Whichever mug you last poured coffee into, added a topping to, or picked
// up while it already had coffee in it — that mug then follows the cursor
// everywhere outside the coffee counter itself, like you're carrying it
// around the room. CARRIED_MUG_SCALE controls how big it looks; the offset
// keeps it from sitting directly under (and blocking) the cursor.
let lastCoffeeMug = null;
const CARRIED_MUG_SCALE = 0.15;
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
// target still just drops them exactly where you clicked (no snapping back)
// — the carafe is the one exception: it's not allowed to be set down loose,
// so an invalid click just leaves it stuck to the mouse (see
// handleCoffeeCounterClick).
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

  item.coordinates_by_percentage = applied ? item.home : pixelsToPercentage(x, y);
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
  safeDrawImage(coffeeImage(machineImagePath()), MACHINE_COORDS, MACHINE_SCALE, "coffee machine");

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
        ctx.rotate((TOPPING_TILT_DEGREES * Math.PI) / 180);
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

      // Dims everything drawn so far (the layers behind this node), leaving
      // this node and its own children — drawn next — at full brightness.
      if (node.do_dark_background) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      safeDrawImage(node.img, node.coordinates_by_percentage, node.scale, node.id);
      if (node.text) safeTry(`affirmation text: ${node.id}`, () => drawAffirmationText(node));
      if (node.id === "coffeecounter") safeTry("coffee counter", drawCoffeeCounter);

      node.children.forEach((child) => {
        if (hidden.has(child.id) || !child.img) return;
        safeDrawImage(child.img, child.coordinates_by_percentage, child.scale, child.id);
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

canvas.addEventListener("mousedown", () => {
  const topNode = openPath[openPath.length - 1];
  if (topNode.id === "coffeecounter") {
    const w = topNode.img.width * topNode.scale;
    const h = topNode.img.height * topNode.scale;
    const { x, y } = topLeftFor(topNode.coordinates_by_percentage, w, h);
    const insideCounter = mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;

    if (insideCounter) {
      handleCoffeeCounterClick(mouseX, mouseY);
      return;
    }

    // Clicking outside the counter while carrying something would normally
    // close the popup — instead, require setting it down first so nothing
    // gets stranded mid-task.
    if (heldItem) return;
  }

  const node = getClickableNodeAt(mouseX, mouseY);
  if (node) {
    if (node.id === "app_affirmations") {
      openPath.push(spawnAffirmationPopup(node.children[0]));
    } else {
      openPath.push(...node.children);
    }
    return;
  }

  // Debug helper: on any page/popup depth, clicking on non-clickable space
  // also copies the click's [x%, y%] to clipboard, in addition to (not
  // instead of) the normal close-popup navigation below.
  if (CLICK_TO_SHOW_COORDINATES) {
    const xPct = (mouseX / canvas.width) * 100;
    const yPct = (mouseY / canvas.height) * 100;
    const coords = `[${xPct.toFixed(1)}, ${yPct.toFixed(1)}]`;
    navigator.clipboard.writeText(coords).catch((err) => pushError(`Clipboard copy failed: ${err.message}`));
  }

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
