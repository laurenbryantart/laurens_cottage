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
  const img = new Image();
  img.src = "images/computer/desktop.png";

  img.onload = () => {
    popupImage = img;
  };
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