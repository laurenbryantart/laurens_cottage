// -------------------- IMAGES --------------------
// Every image on screen — room items, popup screens, and icons drawn on
// top of popups — lives in ONE tree, `images`, rooted at `room_background`.
//
// node shape:
//   id          which image asset this node uses — also the cache key in
//               loadImages, so nodes that share art (e.g. the three
//               app_file folder instances) can reuse the same Image
//   path        image file to draw, relative to the "images/" folder
//               (defaults to that folder — no need to write the prefix)
//   coordinates [x, y] absolute, relative to the ONE grid: the
//               room_background image's own native-pixel grid. Every
//               node uses this same coordinate system regardless of how
//               deeply it's nested — never relative to another image.
//   scale       absolute scale factor applied to the image's native size
//   children    list of nodes nested "inside" this one (defaults to []).
//               Clicking a node reveals its children automatically —
//               there's no separate "opens" pointer. Every image is a
//               popup: revealed children stay on screen alongside
//               whatever was already open (see POPUP TREE below).
//   show_grid   true to overlay the placement grid whenever the "g" key
//               is toggled on — only room_background sets this; it's the
//               one grid every coordinate above is defined against
//   hide        list of node ids to hide from the screen while this node
//               is showing (defaults to []) — e.g. hide: ["app_wizard"]


const affirmations = [
  "I am loved",
  "I am great"
];
const IMAGES_FOLDER = "images/";

let images = {
  room_background: {
    id: "room_background", path: "main_room/room_background.png", coordinates: [0, 0], scale: 0.92, show_grid: true,
    children: [
      { id: "bed", path: "main_room/bed.png", coordinates: [50, 50], scale: 0.414 },
      { id: "pattern", path: "main_room/pattern.png", coordinates: [650, 50], scale: 0.46 },
      { id: "calendar", path: "main_room/calendar.png", coordinates: [1150, 50], scale: 0.3588 },
      { id: "flowers", path: "main_room/flowers.png", coordinates: [1112, 116], scale: 0.368 },
      { id: "books", path: "main_room/books.png", coordinates: [300, 300], scale: 0.414 },

      {
        id: "laptop", path: "main_room/laptop.png", coordinates: [500, 50], scale: 0.46,
        // ---- desktop popup + its icons, revealed by clicking the laptop ----
        children: [
          {
            id: "desktop", path: "computer/desktop.png", coordinates: [150, 50], scale: 0.42,
            children: [
              { id: "app_bank", path: "computer/app_bank.png", coordinates: [550, 150], scale: 0.315 },
              { id: "app_borders", path: "computer/app_borders.png", coordinates: [800, 150], scale: 0.315 },
              { id: "app_camera", path: "computer/app_camera.png", coordinates: [250, 450], scale: 0.315 },

              // three folder instances share the app_file.png art — same
              // `id`, so they still share one cached Image
              { id: "app_file", path: "computer/app_file.png", coordinates: [250, 200], scale: 0.42 },
              { id: "app_file", path: "computer/app_file.png", coordinates: [250, 300], scale: 0.42 },
              { id: "app_file", path: "computer/app_file.png", coordinates: [250, 450], scale: 0.42 },

              { id: "app_wizard", path: "computer/app_wizard.png", coordinates: [800, 450], scale: 0.315 },

              {
                id: "app_affirmations", path: "computer/app_affirmations.png", coordinates: [500, 200], scale: 0.42,
                // `children[0]` below is only ever used as a template — clicking
                // app_affirmations spawns a fresh clone of it at a random spot
                // inside the desktop's bounds instead of pushing it as-is (see
                // the mousedown handler)
                children: [
                  { id: "affirmations_popup", path: "computer/affirmations_popup.png", coordinates: [700, 300], scale: 0.4 },
                ]
              },
            ]
          }
        ]
      },

      { id: "teapot", path: "main_room/teapot.png", coordinates: [1200, 350], scale: 0.414 },
      { id: "notes", path: "main_room/notes.png", coordinates: [1200, 300], scale: 0.368 },
      { id: "paper", path: "main_room/paper.png", coordinates: [550, 450], scale: 0.46 },
      { id: "drawing", path: "main_room/drawing.png", coordinates: [600, 150], scale: 0.368 },
      { id: "laundry", path: "main_room/laundry.png", coordinates: [300, 200], scale: 0.414 },

      // no `children` below → not clickable
      { id: "coffeemaker", path: "main_room/coffeemaker.png", coordinates: [850, 400], scale: 0.46 },
    ]
  }
};

const root = images.room_background;

// Fill in defaults (children/show_grid/dark_background) and resolve the
// image path, walking the whole tree.
function normalize(node) {
  if (node.children === undefined) node.children = [];
  if (node.show_grid === undefined) node.show_grid = false;
  if (node.hide === undefined) node.hide = [];
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
// the ones already open — so `visibleChildren()` is the union of every
// layer's children, not just the most recent one. A node's `hide` list
// removes specific ids from that union while the node is showing.
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

function visibleChildren() {
  const hidden = collectHiddenIds();
  const nodes = [];
  openPath.forEach((node) => nodes.push(...node.children));
  return nodes.filter((node) => !hidden.has(node.id));
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
let showGrid = false;

// When true, clicking the canvas copies the click's [x, y] (room_background's
// native-pixel grid, same one drawNodeGrid labels) to the clipboard instead
// of opening/closing popups — handy for reading off `coordinates` values.
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
// The one grid, drawn in room_background's own native image pixel space,
// so labels can be read straight off the screen and pasted into any
// node's `coordinates` — every node shares this same coordinate system
// regardless of nesting depth.

function drawNodeGrid(node, cellSize = 100) {
  const img = node.img;
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const [x0, y0] = node.coordinates;
  const scale = node.scale;
  const nativeW = img.naturalWidth;
  const nativeH = img.naturalHeight;
  const screenW = nativeW * scale;
  const screenH = nativeH * scale;

  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;

  // Lines are spaced every `cellSize` native image pixels (0, 100, 200, ...)
  // and only then converted to screen space, so grid squares always land on
  // round 100s regardless of scale.
  for (let nx = 0; nx <= nativeW; nx += cellSize) {
    const x = x0 + nx * scale;
    if (x < 0 || x > canvas.width) continue;
    ctx.beginPath();
    ctx.moveTo(x, Math.max(0, y0));
    ctx.lineTo(x, Math.min(canvas.height, y0 + screenH));
    ctx.stroke();
  }

  for (let ny = 0; ny <= nativeH; ny += cellSize) {
    const y = y0 + ny * scale;
    if (y < 0 || y > canvas.height) continue;
    ctx.beginPath();
    ctx.moveTo(Math.max(0, x0), y);
    ctx.lineTo(Math.min(canvas.width, x0 + screenW), y);
    ctx.stroke();
  }

  ctx.fillStyle = "black";
  ctx.font = "14px monospace";

  for (let nx = 0; nx <= nativeW; nx += cellSize * 2) {
    for (let ny = 0; ny <= nativeH; ny += cellSize * 2) {
      const x = x0 + nx * scale;
      const y = y0 + ny * scale;
      if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) continue;
      ctx.fillText(`(${nx},${ny})`, x + 2, y + 12);
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

  const [dx, dy] = desktopNode.coordinates;
  const dw = desktopNode.img.width * desktopNode.scale;
  const dh = desktopNode.img.height * desktopNode.scale;

  // Keep spawned popups off the desktop's edges by a 5% margin on each side.
  const marginX = dw * 0.05;
  const marginY = dh * 0.05;

  const minX = dx + marginX;
  const minY = dy + marginY;
  const maxX = dx + dw - marginX - w;
  const maxY = dy + dh - marginY - h;

  const x = minX + Math.random() * Math.max(0, maxX - minX);
  const y = minY + Math.random() * Math.max(0, maxY - minY);

  return {
    id: template.id,
    path: template.path,
    img: template.img,
    coordinates: [x, y],
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
  const [x, y] = node.coordinates;
  const w = node.img.width * node.scale;
  const h = node.img.height * node.scale;
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

function getClickableNodeAt(x, y) {
  for (const node of visibleChildren()) {
    if (!node.img) continue;
    if (node.children.length === 0) continue;

    const [nx, ny] = node.coordinates;
    const w = node.img.width * node.scale;
    const h = node.img.height * node.scale;

    const hit = x >= nx && x <= nx + w && y >= ny && y <= ny + h;
    if (hit) return node;
  }
  return null;
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

      safeDrawImage(node.img, node.coordinates[0], node.coordinates[1], node.scale, node.id);
      if (node.text) safeTry(`affirmation text: ${node.id}`, () => drawAffirmationText(node));

      node.children.forEach((child) => {
        if (hidden.has(child.id) || !child.img) return;
        safeDrawImage(child.img, child.coordinates[0], child.coordinates[1], child.scale, child.id);
      });
    });

    // The one grid is always the topmost layer, so coordinates can be
    // read straight off the screen no matter what's currently open.
    if (showGrid && root.show_grid) drawNodeGrid(root);

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
  if (CLICK_TO_SHOW_COORDINATES) {
    const coords = `[${Math.round(mouseX)}, ${Math.round(mouseY)}]`;
    navigator.clipboard.writeText(coords).catch((err) => pushError(`Clipboard copy failed: ${err.message}`));
    return;
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

  const top = openPath[openPath.length - 1];
  if (!top.img) return;

  const [x, y] = top.coordinates;
  const w = top.img.width * top.scale;
  const h = top.img.height * top.scale;

  const inside =
    mouseX >= x && mouseX <= x + w &&
    mouseY >= y && mouseY <= y + h;

  if (!inside) closePopup(); // go back one level in the popup chain
});

window.addEventListener("keydown", (e) => {
  if (e.key === "g") showGrid = !showGrid;
});
