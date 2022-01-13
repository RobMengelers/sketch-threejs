require("@babel/polyfill");

const page = document.querySelector('.l-page');
const pageId = page.dataset.id;

const canvas = document.getElementById('canvas-webgl');
canvas.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});
canvas.addEventListener('selectstart', function (event) {
    event.preventDefault();
});

switch (pageId) {
    case "crystal": require('./sketch/crystal/init.js').default(); break;
    case "game": require('./sketch/crystal/initOnlyBG.js').default(); require('./sketch/crystal/MouseSimulator.js'); break;
    default:
}

