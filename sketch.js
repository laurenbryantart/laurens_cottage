// -------------------- ITEMS --------------------

let items = {
  room_background: { coordinates: [0, 0], scale: 1, fullscreen: true },

  bed: { coordinates: [47, 30], scale: 0.45, onClick: () => {} },
  pattern: { coordinates: [680, 29], scale: 0.5, onClick: () => {} },
  calendar: { coordinates: [950, 120], scale: 0.35, onClick: () => {} },

  flowers: { coordinates: [600, 400], scale: 0.4, onClick: () => {} },
  books: { coordinates: [400, 300], scale: 0.45, onClick: () => {} },

  laptop: { coordinates: [555, 60], scale: 0.5, onClick: () => {} },
  teapot: { coordinates: [850, 420], scale: 0.35, onClick: () => {} },

  notes: { coordinates: [730, 440], scale: 0.4, onClick: () => {} },
  paper: { coordinates: [700, 520], scale: 0.38, onClick: () => {} },

  drawing: { coordinates: [250, 170], scale: 0.4, onClick: () => {} },
  laundry: { coordinates: [160, 700], scale: 0.5, onClick: () => {} }
};

//



const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1452;
canvas.height = 960;

let mouseX = 0;
let mouseY = 0;
let showGrid = true;

// -------------------- ERROR SYSTEM --------------------

let errors = [];

function pushError(msg) {
  console.warn("[Captured Error]", msg); // optional safety log (not main UI)
  errors.push(String(msg));

  if (errors.length > 8) {
    errors.shift();
  }
}

// Catch runtime JS errors
window.onerror = function (message, source, lineno, colno, error) {
  pushError(`${message} (${lineno}:${colno})`);
  return true; // suppress default console error UI
};

// Catch async errors
window.onunhandledrejection = function (event) {
  pushError(event.reason?.message || String(event.reason));
  return true;
};

// Catch manual logging of unexpected states
function safeTry(label, fn) {
  try {
    return fn();
  } catch (err) {
    pushError(`${label}: ${err.message || err}`);
  }
}



// -------------------- IMAGE LOADING --------------------

function loadImages(items) {
  const directory = "main_images";

  for (let key in items) {
    const img = new Image();

    img.onload = () => {
      // success (optional)
    };

    img.onerror = () => {
      pushError(`Missing image: ${directory}/${key}.png`);
    };

    // IMPORTANT: template string fixed
    img.src = `${directory}/${key}.png`;

    items[key].img = img;
  }
}

loadImages(items);

// -------------------- SAFE DRAW --------------------

function safeDrawImage(img, x, y, scale, label) {
  try {
    if (!img) {
      pushError(`Image undefined: ${label}`);
      return;
    }

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
  if (errors.length === 0) return;

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

  requestAnimationFrame(draw);
}

draw();

// -------------------- EVENTS --------------------

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

canvas.addEventListener("mousedown", () => {
  for (let key in items) {
    const item = items[key];

    if (!item.img || typeof item.onClick !== "function") continue;

    const [x, y] = item.coordinates;
    const w = item.img.width * item.scale;
    const h = item.img.height * item.scale;

    const hit =
      mouseX >= x &&
      mouseX <= x + w &&
      mouseY >= y &&
      mouseY <= y + h;

    if (hit) item.onClick();
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key === "g") {
    showGrid = !showGrid;
  }
});