// -------------------- CLICK ACTIONS --------------------
// Attach handlers directly onto entries of the `images` dict declared
// in sketch.js (loaded before this file — see index.html), by key.

images.bed.onClick = function () {
  console.log("Bed clicked");
};

images.pattern.onClick = function () {
  console.log("Pattern clicked");
};

images.calendar.onClick = function () {
  console.log("Calendar clicked");
};

images.flowers.onClick = function () {
  console.log("Flowers clicked");
};

images.books.onClick = function () {
  console.log("Books clicked");
};

images.laptop.onClick = function () {
  show("desktop");
};

// coffeemaker intentionally left without an onClick → not clickable

// -------------------- DESKTOP APP ICONS --------------------
// Placeholders — replace with real behavior per app.

images.app_affirmations.onClick = function () {
  console.log("app_affirmations clicked");
};

images.app_bank.onClick = function () {
  console.log("app_bank clicked");
};

images.app_borders.onClick = function () {
  console.log("app_borders clicked");
};

images.app_camera.onClick = function () {
  console.log("app_camera clicked");
};

images.app_file_1.onClick = function () {
  console.log("app_file_1 clicked");
};

images.app_file_2.onClick = function () {
  console.log("app_file_2 clicked");
};

images.app_file_3.onClick = function () {
  console.log("app_file_3 clicked");
};

// To point one of the app_file instances at its own popup instead of a
// console.log, add the popup to the `images` dict in sketch.js and call
// show() with its key, e.g.:
//
// images.folder_photos = { path: "images/computer/folder_photos.png", coordinates: [0, 0], scale: 0.5, parent: null, popup: true, id: "folder_photos", img: /* load it */ };
// images.app_file_2.onClick = function () {
//   show("folder_photos");
// };

images.app_wizard.onClick = function () {
  console.log("app_wizard clicked");
};

// app_wizard22 intentionally left without an onClick → not clickable yet

images.teapot.onClick = function () {
  console.log("Teapot clicked");
};

images.notes.onClick = function () {
  console.log("Notes clicked");
};

images.paper.onClick = function () {
  console.log("Paper clicked");
};

images.drawing.onClick = function () {
  console.log("Drawing clicked");
};

images.laundry.onClick = function () {
  console.log("Laundry clicked");
};
