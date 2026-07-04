// -------------------- IMAGES --------------------
// Every image on screen — room items, popup screens, and icons drawn on
// top of popups — lives in ONE dict, `images`, keyed by name.
//
// node shape:
//   id          which image asset this node uses (defaults to the dict
//               key below, via the normalization loop after the dict —
//               only set explicitly when the key can't double as the
//               filename, e.g. the three app_file folder instances)
//   path        image file to draw
//   coordinates [x, y] relative to `parent` (relative to the canvas
//               origin if parent is null)
//   scale       relative to `parent`'s scale (root nodes: absolute)
//   parent      key (in `images`) of the node this one is positioned/
//               clipped relative to, or null for root-level nodes
//   popup       true if this node is a full popup screen rather than an
//               always-visible room item (see POPUP TREE below)
//   onClick     attached later, from onClick_actions.js

let images = {
  // ---- room (always visible, parent: null) ----
  room_background: { path: "images/main_room/room_background.png", coordinates: [0, 0], scale: 0.92, parent: null },

  bed: { path: "images/main_room/bed.png", coordinates: [47, 30], scale: 0.45, parent: "room_background" },
  pattern: { path: "images/main_room/pattern.png", coordinates: [680, 29], scale: 0.5, parent: "room_background" },
  calendar: { path: "images/main_room/calendar.png", coordinates: [1240, 43], scale: 0.39, parent: "room_background" },
  flowers: { path: "images/main_room/flowers.png", coordinates: [1300, 150], scale: 0.4, parent: "room_background" },
  books: { path: "images/main_room/books.png", coordinates: [350, 320], scale: 0.45, parent: "room_background" },
  laptop: { path: "images/main_room/laptop.png", coordinates: [555, 60], scale: 0.5, parent: "room_background" },
  teapot: { path: "images/main_room/teapot.png", coordinates: [1287, 360], scale: 0.45, parent: "room_background" },
  notes: { path: "images/main_room/notes.png", coordinates: [1285, 300], scale: 0.4, parent: "room_background" },
  paper: { path: "images/main_room/paper.png", coordinates: [600, 500], scale: 0.5, parent: "room_background" },
  drawing: { path: "images/main_room/drawing.png", coordinates: [677, 160], scale: 0.4, parent: "room_background" },
  laundry: { path: "images/main_room/laundry.png", coordinates: [300, 210], scale: 0.45, parent: "room_background" },

  // no onClick attached below → not clickable
  coffeemaker: { path: "images/main_room/coffeemaker.png", coordinates: [900, 420], scale: 0.5, parent: "room_background" },

  // ---- desktop popup + its icons (parent: "desktop") ----
  desktop: { path: "images/computer/desktop.png", coordinates: [150, 50], scale: 0.42, parent: null, popup: true },

  app_affirmations: { path: "images/computer/app_affirmations.png", coordinates: [800, 350], scale: 0.75, parent: "desktop" },
  app_bank: { path: "images/computer/app_bank.png", coordinates: [900, 200], scale: 0.75, parent: "desktop" },
  app_borders: { path: "images/computer/app_borders.png", coordinates: [1600, 200], scale: 0.75, parent: "desktop" },
  app_camera: { path: "images/computer/app_camera.png", coordinates: [200, 900], scale: 0.75, parent: "desktop" },

  // three folder instances share the app_file.png art — different keys,
  // same `id`, so they still share one cached Image
  app_file_1: { id: "app_file", path: "images/computer/app_file.png", coordinates: [200, 300], scale: 1, parent: "desktop" },
  app_file_2: { id: "app_file", path: "images/computer/app_file.png", coordinates: [200, 600], scale: 1, parent: "desktop" },
  app_file_3: { id: "app_file", path: "images/computer/app_file.png", coordinates: [200, 900], scale: 1, parent: "desktop" },

  app_wizard: { path: "images/computer/app_wizard.png", coordinates: [1600, 900], scale: 0.75, parent: "desktop" },

  // no onClick attached yet → not clickable
  app_wizard22: { id: "alert_compromised_wizard", path: "images/computer/alert_compromised_wizard.png", coordinates: [1000, 900], scale: 0.75, parent: "desktop" }
};

// id defaults to the dict key unless explicitly overridden above
for (const key in images) {
  if (images[key].id === undefined) images[key].id = key;
}

// -------------------- POPUP TREE --------------------
// The room itself is just the first thing shown — `first_image` is the
// permanent base of the popup stack (index 0), never popped. Opening a
// popup (show("desktop")) pushes its key on top; only the top of the
// stack has its children (icons) drawn/clickable, and clicking outside
// its bounds pops back one level — same rule at every depth.

let first_image = "room_background";
let popupStack = [first_image];

function show(key) {
  popupStack.push(key);
}

function hide() {
  if (popupStack.length > 1) popupStack.pop(); // first_image can't be popped
}

function topPopup() {
  return popupStack[popupStack.length - 1] || null;
}

// Absolute canvas position, resolved by walking up `parent` keys.
function getAbsolute(key) {
  const node = images[key];
  if (!node.parent) {
    return { x: node.coordinates[0], y: node.coordinates[1], scale: node.scale };
  }
  const parentAbs = getAbsolute(node.parent);
  return {
    x: parentAbs.x + node.coordinates[0] * parentAbs.scale,
    y: parentAbs.y + node.coordinates[1] * parentAbs.scale,
    scale: node.scale * parentAbs.scale
  };
}

// -------------------- CANVAS --------------------

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1452;
canvas.height = 960;

let mouseX = 0;
let mouseY = 0;
let showGrid = false;

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
// One Image per unique `id`, shared across nodes — app_file_1/2/3 all
// share id "app_file", so it's only fetched once.

function loadImages(dict) {
  const cache = {};

  for (const key in dict) {
    const node = dict[key];

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
  }
}

loadImages(images);

// -------------------- SAFE DRAW --------------------

function safeDrawImage(img, x, y, scale, label) {
  try {
    if (!img) return;
    if (!img.complete || img.naturalWidth === 0) return;

    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
  } catch (err) {
    pushError(`drawImage failed: ${label} (${err.message})`);
  }
}

// -------------------- GRID --------------------

function drawGrid(cellSize = 50) {
  ctx.strokeStyle = "rgba(200,200,200,1)";
  ctx.lineWidth = 1;

  for (let x = 0; x < canvas.width; x += cellSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y < canvas.height; y += cellSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.fillStyle = "black";
  ctx.font = "12px sans-serif";

  for (let x = 0; x < canvas.width; x += 100) {
    for (let y = 0; y < canvas.height; y += 100) {
      ctx.fillText(`${x},${y}`, x + 2, y + 12);
    }
  }
}

// Grid drawn in a node's own native image pixel space (the same space
// child coordinates are defined in), so labels can be read straight off
// the screen and pasted into a child node's `coordinates`.
function drawPopupGrid(key, cellSize = 100) {
  const node = images[key];
  const img = node.img;
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const abs = getAbsolute(key);
  const nativeW = img.naturalWidth;
  const nativeH = img.naturalHeight;

  ctx.strokeStyle = "rgba(255,0,0,0.6)";
  ctx.lineWidth = 1;

  for (let nx = 0; nx <= nativeW; nx += cellSize) {
    const x = abs.x + nx * abs.scale;
    if (x < 0 || x > canvas.width) continue;
    ctx.beginPath();
    ctx.moveTo(x, Math.max(0, abs.y));
    ctx.lineTo(x, Math.min(canvas.height, abs.y + nativeH * abs.scale));
    ctx.stroke();
  }

  for (let ny = 0; ny <= nativeH; ny += cellSize) {
    const y = abs.y + ny * abs.scale;
    if (y < 0 || y > canvas.height) continue;
    ctx.beginPath();
    ctx.moveTo(Math.max(0, abs.x), y);
    ctx.lineTo(Math.min(canvas.width, abs.x + nativeW * abs.scale), y);
    ctx.stroke();
  }

  ctx.fillStyle = "yellow";
  ctx.font = "11px monospace";

  for (let nx = 0; nx <= nativeW; nx += cellSize * 2) {
    for (let ny = 0; ny <= nativeH; ny += cellSize * 2) {
      const x = abs.x + nx * abs.scale;
      const y = abs.y + ny * abs.scale;
      if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) continue;
      ctx.fillText(`${nx},${ny}`, x + 2, y + 12);
    }
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
// Only the top of the popup stack has clickable children — at the base
// level that's first_image's children (bed, laptop, ...), same rule
// used again for desktop's children (app_bank, app_file_1, ...).

function getClickableNodeAt(x, y) {
  const topKey = topPopup();
  if (!topKey) return null;

  for (const key in images) {
    const node = images[key];
    if (node.parent !== topKey) continue;
    if (!node.img) continue;
    if (typeof node.onClick !== "function") continue;

    const abs = getAbsolute(key);
    const w = node.img.width * abs.scale;
    const h = node.img.height * abs.scale;

    const hit =
      x >= abs.x && x <= abs.x + w &&
      y >= abs.y && y <= abs.y + h;

    if (hit) return key;
  }
  return null;
}

// -------------------- DRAW LOOP --------------------

function draw() {
  try {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    popupStack.forEach((key, i) => {
      if (i > 0) {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      const node = images[key];
      const abs = getAbsolute(key);
      safeDrawImage(node.img, abs.x, abs.y, abs.scale, node.id);
    });

    const topKey = topPopup();
    if (topKey) {
      for (const key in images) {
        const node = images[key];
        if (node.parent !== topKey) continue;
        if (!node.img) continue;

        const abs = getAbsolute(key);
        safeDrawImage(node.img, abs.x, abs.y, abs.scale, node.id);
      }
    }

    if (showGrid) {
      if (popupStack.length <= 1) drawGrid(50);
      else drawPopupGrid(topKey, 100);
    }

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

  const clickable = getClickableNodeAt(mouseX, mouseY);
  canvas.style.cursor = clickable ? "pointer" : "default";
});

canvas.addEventListener("mousedown", () => {
  const key = getClickableNodeAt(mouseX, mouseY);
  if (key) {
    images[key].onClick();
    return;
  }

  const topKey = topPopup();
  const node = topKey && images[topKey];
  if (!node || !node.img) return;

  const abs = getAbsolute(topKey);
  const w = node.img.width * abs.scale;
  const h = node.img.height * abs.scale;

  const inside =
    mouseX >= abs.x && mouseX <= abs.x + w &&
    mouseY >= abs.y && mouseY <= abs.y + h;

  if (!inside) hide(); // go back one level in the popup stack
});

window.addEventListener("keydown", (e) => {
  if (e.key === "g") showGrid = !showGrid;
});
