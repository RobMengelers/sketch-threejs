require("@babel/polyfill");

const page = document.querySelector('.l-page');
const pageId = page.dataset.id;
require('./sketch/crystal/init.js').default();
