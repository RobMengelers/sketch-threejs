import * as THREE from 'three';
import debounce from 'js-util/debounce';

import WebGLContent from './WebGLContent';
import Drag from './Drag';

export default async function () {
  let coordX = 0; // Moving from the left side of the screen
  let coordY = window.innerHeight / 2; // Moving in the center

  var isAutoMoving = false;

  const webglContent = new WebGLContent();
  const resolution = new THREE.Vector2();
  const panPosition = new THREE.Vector3();
  const canvas = document.getElementById('canvas-webgl');
  const preloader = document.querySelector('.p-preloader');
  const dd = new Drag(resolution);
  const button = document.getElementById("simulate-dnm")

  const resizeWindow = () => {
    resolution.set(document.body.clientWidth, window.innerHeight);
    canvas.width = resolution.x;
    canvas.height = resolution.y;
    webglContent.resize(resolution);
  };
  const touchstart = (e) => {
    dd.touchStart(e);
  }
  const touchmove = (e) => {
    dd.touchMove(e);
  }
  const touchend = (e) => {
    dd.touchEnd(e);
  }

  const move = () => {
    // Move step = 20 pixels
    coordX += 20;
    // Create new mouse event
    let ev = new MouseEvent("mousemove", {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: coordX,
      clientY: coordY
    });

    // Send event
    canvas.dispatchEvent(ev);
    // If the current position of the fake "mouse" is less than the width of the screen - let's move
    if (coordX < 6000) {
      console.log("hoi")
      setTimeout(() => {
        move();
      }, 10);
    } else {
      panPosition.set(0, 0, 0);
      webglContent.pan(panPosition);
      console.log("done")
    }
  }

  const on = () => {
    if (!isAutoMoving) {
      canvas.addEventListener('mousedown', touchstart, { passive: false });
      window.addEventListener('mousemove', (e) => {
        touchmove(e);
        panPosition.set(
          (e.clientX / resolution.x * 2 - 1) * 0.1,
          (-e.clientY / resolution.y * 2 + 1) * 0.1,
          0
        );
        webglContent.pan(panPosition);
      });
      document.addEventListener('mouseleave', (e) => {
        panPosition.set(0, 0, 0);
        webglContent.pan(panPosition);
      });
      window.addEventListener('mouseup', touchend);
      canvas.addEventListener('touchstart', touchstart, { passive: false });
      window.addEventListener('touchmove', touchmove, { passive: false });
      window.addEventListener('touchend', touchend);
      window.addEventListener('resize', debounce(resizeWindow, 100));
    }
    button.addEventListener('click', (e) => {
      isAutoMoving = true;
      move()
    })
  };
  const update = () => {
    dd.update(resolution);
    webglContent.update(dd);
    requestAnimationFrame(update);
  };

  await webglContent.start(canvas);

  on();
  resizeWindow();
  preloader.classList.add('is-hidden');
  webglContent.play(dd);
  update();

}