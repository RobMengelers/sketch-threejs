// Timer ID holder
let linearSimulationTimer;

// Simulation X/Y calculation
let calcX = 0, calcY = 0;

// Simulation X/Y axis orientation to handle parent collisions
let xAxisOrientation = 1, yAxisOrientation = 1;

// How many pixels to move the element for X/Y axis
const pixelsShift = 3;

// Elements
const simulateButton = document.getElementById('simulate-dnm');



// Mouse capture and drag handler (https://javascript.info/mouse-drag-and-drop)
document.onmousedown = function(event) {
  let shiftX = event.clientX - document.getBoundingClientRect().left;

  moveAt(event.pageX, event.pageY);

  function moveAt(pageX, pageY) {
    document.style.left = pageX - shiftX - document.offsetLeft + 'px';
    document.style.top = pageY - shiftY - document.offsetTop + 'px';
  }

  function onMouseMove(event) {
    moveAt(event.pageX, event.pageY);
  }

  document.addEventListener('mousemove', onMouseMove);

  document.onmouseup = function() {
    document.removeEventListener('mousemove', onMouseMove);
    document.onmouseup = null;
  }
}

document.ondragstart = function() {
  return false;
}