// -------------------- ITEMS --------------------
// NOTE: no onClick inside items anymore

let items = {
  "room_background": { "coordinates": [0, 0], "scale": 1, fullscreen: true },

  "bed": { "coordinates": [47, 30], "scale": 0.45 },
  "pattern": { "coordinates": [680, 29], "scale": 0.5 },
  "calendar": { "coordinates": [1240, 43], "scale": 0.39 },
  "flowers": { "coordinates": [1300, 150], "scale": 0.4 },
  "books": { "coordinates": [350, 320], "scale": 0.45 },
  "laptop": { "coordinates": [555, 60], "scale": 0.5 },
  "teapot": { "coordinates": [1287, 360], "scale": 0.45 },
  "notes": { "coordinates": [1285, 300], "scale": 0.4 },
  "paper": { "coordinates": [600, 500], "scale": 0.5 },
  "drawing": { "coordinates": [677, 160], "scale": 0.4 },
  "laundry": { "coordinates": [300, 210], "scale": 0.45 },

  // no handler exists → not clickable
  "coffeemaker": { "coordinates": [900, 420], "scale": 0.5 }
};

// -------------------- POPUPS --------------------
// Registry of every popup screen. Each popup is a full image with its own
// coordinates/scale. Popups can link to one another — an icon's onClick
// handler (in onClick_actions.js) just calls show("someOtherPopupId"),
// and popups stack: clicking outside a popup goes back one level (see
// hide()/popupStack below) rather than closing everything at once.

let popups = {
  "desktop": {
    path: "images/computer/desktop.png",
    coordinates: [150, 50],
    scale: 0.42
  }

  // Add more popups here, e.g.:
  // "folder_photos": { path: "images/computer/folder_photos.png", coordinates: [0, 0], scale: 0.5 },
};

// -------------------- ICON INSTANCES --------------------
// Icons drawn on top of a popup. Multiple instances can reuse the same
// underlying png (`image`) — give each instance a unique `id` (used to
// look up its onClick handler as `${id}_onClick`), its own coordinates/
// scale, and `onPopup` saying which popup (key in `popups` above) it's
// drawn/clickable on. coordinates/scale are placeholders in the popup
// image's own native pixel space (desktop.png is 2732x2048) — nudge them
// once the popup is visible (press "g" for the grid overlay).

let iconInstances = [
  { id: "app_affirmations", image: "app_affirmations", onPopup: "desktop", coordinates: [800, 350], scale: 0.75 },
  { id: "app_bank", image: "app_bank", onPopup: "desktop", coordinates: [900, 200], scale: 0.75 },
  { id: "app_borders", image: "app_borders", onPopup: "desktop", coordinates: [1600, 200], scale: 0.75 },
  { id: "app_camera", image: "app_camera", onPopup: "desktop", coordinates: [200, 900], scale: 0.75 },
  { id: "app_file1", image: "app_file", onPopup: "desktop", coordinates: [200, 300], scale: 1 },
  { id: "app_file2", image: "app_file", onPopup: "desktop", coordinates: [200, 600], scale: 1 },
  { id: "app_file3", image: "app_file", onPopup: "desktop", coordinates: [200, 900], scale: 1 },
  { id: "app_wizard", image: "app_wizard", onPopup: "desktop", coordinates: [1600, 900], scale: 0.75 },
  { id: "app_wizard22", image: "alert_compromised_wizard", onPopup: "desktop", coordinates: [1000, 900], scale: 0.75 }

  // DEMO of multiple instances of the same png pointing to different
  // popups — remove/replace once real folder art + popups exist:
  // { id: "app_file_2", image: "app_file", onPopup: "desktop", coordinates: [1600, 550], scale: 0.75 },
];

// -------------------- CANVAS --------------------

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1452;
canvas.height = 960;

let mouseX = 0;
let mouseY = 0;
let showGrid = false;
let popupStack = []; // stack of { id, path, coordinates, scale, img } — top of stack is what's visible


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

function loadImages(items, directory) {
  for (let key in items) {
    const img = new Image();

    img.onload = () => {};
    img.onerror = () => {
      pushError(`Missing image: ${directory}/${key}.png`);
    };

    img.src = `${directory}/${key}.png`;
    items[key].img = img;
  }
}

function loadIconInstances(instances, directory) {
  const cache = {}; // one Image per unique filename, shared across instances

  for (const inst of instances) {
    if (!cache[inst.image]) {
      const img = new Image();

      img.onload = () => {};
      img.onerror = () => {
        pushError(`Missing image: ${directory}/${inst.image}.png`);
      };

      img.src = `${directory}/${inst.image}.png`;
      cache[inst.image] = img;
    }

    inst.img = cache[inst.image];
  }
}

loadImages(items, "images/main_room");
loadIconInstances(iconInstances, "images/computer");

// -------------------- POPUP SYSTEM --------------------
// Generic popup used by all onClick handlers, e.g.: show("desktop")
// Popups stack — show() pushes, hide() pops one level, so any popup can
// link to another and clicking outside walks back down the chain.

function show(popupId) {
  const def = popups[popupId];
  if (!def) {
    pushError(`Unknown popup: ${popupId}`);
    return;
  }

  const img = new Image();

  img.onload = () => {};
  img.onerror = () => {
    pushError(`Missing image: ${def.path}`);
  };

  img.src = def.path;
  popupStack.push({ id: popupId, path: def.path, coordinates: def.coordinates, scale: def.scale, img });
}

function hide() {
  popupStack.pop();
}

function topPopup() {
  return popupStack[popupStack.length - 1] || null;
}

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

// -------------------- CLICK DETECTION HELPERS --------------------

function getClickableKeyAt(x, y) {
  for (let key in items) {
    const item = items[key];
    if (!item.img) continue;

    const fn = window[`${key}_onClick`];
    if (typeof fn !== "function") continue;

    const [ix, iy] = item.coordinates;
    const w = item.img.width * item.scale;
    const h = item.img.height * item.scale;

    const hit =
      x >= ix && x <= ix + w &&
      y >= iy && y <= iy + h;

    if (hit) return key;
  }
  return null;
}

function getClickableIconKeyAt(x, y) {
  const popup = topPopup();
  if (!popup) return null;

  const [px, py] = popup.coordinates;

  for (const inst of iconInstances) {
    if (inst.onPopup !== popup.id) continue;
    if (!inst.img) continue;

    const fn = window[`${inst.id}_onClick`];
    if (typeof fn !== "function") continue;

    const [ix, iy] = inst.coordinates;
    const iconX = px + ix * popup.scale;
    const iconY = py + iy * popup.scale;
    const w = inst.img.width * inst.scale * popup.scale;
    const h = inst.img.height * inst.scale * popup.scale;

    const hit =
      x >= iconX && x <= iconX + w &&
      y >= iconY && y <= iconY + h;

    if (hit) return inst.id;
  }
  return null;
}

// -------------------- DRAW LOOP --------------------

function draw() {
  try {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let key in items) {
      const item = items[key];
      const [x, y] = item.coordinates;

      if (item.fullscreen) {
        safeDrawImage(item.img, 0, 0, 1, key);
        continue;
      }

      safeDrawImage(item.img, x, y, item.scale, key);
    }

    if (showGrid) drawGrid(50);
    drawErrors();
  } catch (err) {
    pushError(`FATAL DRAW LOOP: ${err.message}`);
  }

  const popup = topPopup();
  if (popup) {
    const [px, py] = popup.coordinates;

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    safeDrawImage(popup.img, px, py, popup.scale, popup.path);

    for (const inst of iconInstances) {
      if (inst.onPopup !== popup.id) continue;
      if (!inst.img) continue;

      const [ix, iy] = inst.coordinates;
      const x = px + ix * popup.scale;
      const y = py + iy * popup.scale;

      safeDrawImage(inst.img, x, y, inst.scale * popup.scale, inst.id);
    }
  }


  requestAnimationFrame(draw);
}

draw();

// -------------------- EVENTS --------------------

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  const clickable = topPopup()
    ? getClickableIconKeyAt(mouseX, mouseY)
    : getClickableKeyAt(mouseX, mouseY);
  canvas.style.cursor = clickable ? "pointer" : "default";
});

canvas.addEventListener("mousedown", () => {
  const popup = topPopup();
  if (popup) {
    const iconKey = getClickableIconKeyAt(mouseX, mouseY);
    if (iconKey) {
      const fn = window[`${iconKey}_onClick`];
      if (typeof fn === "function") fn();
      return;
    }

    const [px, py] = popup.coordinates;
    const w = popup.img.width * popup.scale;
    const h = popup.img.height * popup.scale;

    const inside =
      mouseX >= px &&
      mouseX <= px + w &&
      mouseY >= py &&
      mouseY <= py + h;

    if (!inside) hide(); // go back one level in the popup stack
    return;
  }

  const key = getClickableKeyAt(mouseX, mouseY);
  if (!key) return;

  const fn = window[`${key}_onClick`];
  if (typeof fn === "function") fn();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "g") showGrid = !showGrid;
});