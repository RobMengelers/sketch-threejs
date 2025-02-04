import * as THREE from 'three';
import debounce from 'js-util/debounce';

import WebGLContentOnlyBG from './WebGLContentOnlyBG';

export default async function() {
  const webglContentOnlyBG = new WebGLContentOnlyBG();
  const resolution = new THREE.Vector2();
  const canvas = document.getElementById('canvas-webgl');
  const preloader = document.querySelector('.p-preloader');

  const resizeWindow = () => {
    resolution.set(document.body.clientWidth, window.innerHeight);
    canvas.width = resolution.x;
    canvas.height = resolution.y;
    webglContentOnlyBG.resize(resolution);
  };
  const on = () => {
    window.addEventListener('resize', debounce(resizeWindow, 100));
  };
  const update = () => {
    webglContentOnlyBG.update();
    requestAnimationFrame(update);
  };

  await webglContentOnlyBG.start(canvas);

  on();
  resizeWindow();
  preloader.classList.add('is-hidden');
  webglContentOnlyBG.play();
  update();
}