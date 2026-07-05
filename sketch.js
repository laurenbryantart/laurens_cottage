
const affirmations = [
  "I am loved",
  "I am great",
  "hello"
];
const IMAGES_FOLDER = "images/";

const APP_SIZE = 0.5;

let images = {
  room_background: {
    id: "room_background", path: "main_room/room_background.png", coordinates_by_percentage: [0, 0], scale: 0.92,
    children: [
      { id: "bed", path: "main_room/bed.png", coordinates_by_percentage: [11.8, 30.1], scale: 0.414 },
      { id: "pattern", path: "main_room/pattern.png", coordinates_by_percentage: [50.1, 8.5], scale: 0.46 },
      { id: "calendar", path: "main_room/calendar.png", coordinates_by_percentage: [83.3, 8.1], scale: 0.3588 },
      { id: "flowers", path: "main_room/flowers.png", coordinates_by_percentage: [91.9, 25.9], scale: 0.368 },
      { id: "books", path: "main_room/books.png", coordinates_by_percentage: [32.2, 40.6], scale: 0.414 },

      {
        id: "laptop", path: "main_room/laptop.png", coordinates_by_percentage: [44.4, 16.3], scale: 0.46
        // ---- desktop popup + its icons, revealed by clicking the laptop ----
        children: [
          {
            id: "desktop", path: "computer/desktop.png", coordinates_by_percentage: [50, 50], scale: 0.42,
            children: [
              { id: "app_bank", path: "computer/app_bank.png", coordinates_by_percentage: [48.4, 30.0], scale: APP_SIZE },
              { id: "app_borders", path: "computer/app_borders.png", coordinates_by_percentage: [65.7, 55.7], scale: APP_SIZE },
              { id: "app_camera", path: "computer/app_camera.png", coordinates_by_percentage: [66.8, 29.7], scale: APP_SIZE },
              { id: "app_wizard", path: "computer/app_wizard.png", coordinates_by_percentage: [53.2, 48.5], scale: APP_SIZE },

              // three folder instances share the app_file.png art — same
              // `id`, so they still share one cached Image
              { id: "app_file", path: "computer/app_file.png", coordinates_by_percentage: [19.6, 30.2], scale: 0.42 },
              { id: "app_file", path: "computer/app_file.png", coordinates_by_percentage: [19.6, 45.2], scale: 0.42 },
              { id: "app_file", path: "computer/app_file.png", coordinates_by_percentage: [19.6, 60.2], scale: 0.42 },

              
              {
                id: "app_affirmations", path: "computer/app_affirmations.png", coordinates_by_percentage: [35.5, 30.4], scale: 0.42,
                children: [
                  { id: "affirmations_popup", path: "computer/affirmations_popup.png", coordinates_by_percentage: [10, 10], scale: 0.4 },
                ]
              },
            ]
          }
        ]
      },

      { id: "teapot", path: "main_room/teapot.png", coordinates_by_percentage: [91.5, 42.8], scale: 0.414 },
      { id: "notes", path: "main_room/notes.png", coordinates_by_percentage: [92.7, 34.5], scale: 0.36 },
      { id: "paper", path: "main_room/paper.png", coordinates_by_percentage: [34.0, 70.3], scale: 0.46 },
      { id: "drawing", path: "main_room/drawing.png", coordinates_by_percentage: [52.2, 28.5], scale: 0.36 },
      { id: "laundry", path: "main_room/laundry.png", coordinates_by_percentage: [26.2, 32.8], scale: 0.41 },

      // no `children` below → not clickable
      { id: "coffeemaker", path: "main_room/coffeemaker.png", coordinates_by_percentage: [83.5, 18.7], scale: 0.46 },
    ]
  }
};

const root = images.room_background;

// Fill in defaults (children/hide) and resolve the image path, walking
// the whole tree.
function normalize(node) {
  if (node.children === undefined) node.children = [];
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

function getClickableNodeAt(x, y) {
  for (const node of visibleChildren()) {
    if (!node.img) continue;
    if (node.children.length === 0) continue;

    const w = node.img.width * node.scale;
    const h = node.img.height * node.scale;
    const { x: nx, y: ny } = topLeftFor(node.coordinates_by_percentage, w, h);

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

      safeDrawImage(node.img, node.coordinates_by_percentage, node.scale, node.id);
      if (node.text) safeTry(`affirmation text: ${node.id}`, () => drawAffirmationText(node));

      node.children.forEach((child) => {
        if (hidden.has(child.id) || !child.img) return;
        safeDrawImage(child.img, child.coordinates_by_percentage, child.scale, child.id);
      });
    });

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
  const node = getClickableNodeAt(mouseX, mouseY);
  if (node) {
    if (node.id === "app_affirmations") {
      openPath.push(spawnAffirmationPopup(node.children[0]));
    } else {
      openPath.push(...node.children);
    }
    return;
  }

  if (CLICK_TO_SHOW_COORDINATES) {
    const xPct = (mouseX / canvas.width) * 100;
    const yPct = (mouseY / canvas.height) * 100;
    const coords = `[${xPct.toFixed(1)}, ${yPct.toFixed(1)}]`;
    navigator.clipboard.writeText(coords).catch((err) => pushError(`Clipboard copy failed: ${err.message}`));
    return;
  }

  const top = openPath[openPath.length - 1];
  if (!top.img) return;

  const w = top.img.width * top.scale;
  const h = top.img.height * top.scale;
  const { x, y } = topLeftFor(top.coordinates_by_percentage, w, h);

  const inside =
    mouseX >= x && mouseX <= x + w &&
    mouseY >= y && mouseY <= y + h;

  if (!inside) closePopup(); // go back one level in the popup chain
});
