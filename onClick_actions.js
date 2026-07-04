// -------------------- CLICK ACTIONS --------------------
// IMPORTANT: attach everything to window explicitly

window.bed_onClick = function () {
  console.log("Bed clicked");
};

window.pattern_onClick = function () {
  console.log("Pattern clicked");
};

window.calendar_onClick = function () {
  console.log("Calendar clicked");
};

window.flowers_onClick = function () {
  console.log("Flowers clicked");
};

window.books_onClick = function () {
  console.log("Books clicked");
};

window.laptop_onClick = function () {
  show("desktop");
};

// -------------------- DESKTOP APP ICONS --------------------
// Placeholders — replace with real behavior per app.

window.app_affirmations_onClick = function () {
  console.log("app_affirmations clicked");
};

window.app_bank_onClick = function () {
  console.log("app_bank clicked");
};

window.app_borders_onClick = function () {
  console.log("app_borders clicked");
};

window.app_camera_onClick = function () {
  console.log("app_camera clicked");
};

window.app_file_onClick = function () {
  console.log("app_file clicked");
};

// To reuse the app_file.png icon for a second folder that opens a
// different popup: add the instance to `iconInstances` in sketch.js
// (id: "app_file_2", image: "app_file", onPopup: "desktop", ...), add
// its target to `popups`, then give it its own handler here — any
// handler can itself call show("someOtherPopupId") to link onward:
//
// window.app_file_2_onClick = function () {
//   show("folder_photos");
// };

window.app_wizard_onClick = function () {
  console.log("app_wizard clicked");
};

window.teapot_onClick = function () {
  console.log("Teapot clicked");
};

window.notes_onClick = function () {
  console.log("Notes clicked");
};

window.paper_onClick = function () {
  console.log("Paper clicked");
};

window.drawing_onClick = function () {
  console.log("Drawing clicked");
};

window.laundry_onClick = function () {
  console.log("Laundry clicked");
};

// coffeemaker intentionally not defined