import * as THREE from 'three';
import debounce from 'js-util/debounce';

import WebGLContent from './WebGLContent';
import Drag from './Drag';

export default async function () {
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

  const on = () => {
    canvas.addEventListener('mousedown', touchstart, { passive: false });
    canvas.addEventListener('mousemove', (e) => {
      touchmove(e);
      if (!isAutoMoving) {
        panPosition.set(
          (e.clientX / resolution.x * 2 - 1) * 0.1,
          (-e.clientY / resolution.y * 2 + 1) * 0.1,
          0
        );
        webglContent.pan(panPosition);
      }
    });
    document.addEventListener('mouseleave', (e) => {
      panPosition.set(0, 0, 0);
      webglContent.pan(panPosition);
    });
    canvas.addEventListener('mouseup', touchend);
    canvas.addEventListener('touchstart', touchstart, { passive: false });
    window.addEventListener('touchmove', touchmove, { passive: false });
    window.addEventListener('touchend', touchend);
    window.addEventListener('resize', debounce(resizeWindow, 100));

    let linearSimulationTimer;
    let calcX = 0, calcY = window.innerHeight / 2;

    button.addEventListener('click', (e) => {
      isAutoMoving = true;
      if (linearSimulationTimer) {
        clearInterval(linearSimulationTimer);
        linearSimulationTimer = null;

        const mouseUpEvent = new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
        });

        canvas.style.pointerEvents = ""
        canvas.dispatchEvent(mouseUpEvent);
        isAutoMoving = false

      } else {
        const mouseDownEvent = new MouseEvent('mousedown', {
          clientX: calcX,
          clientY: calcY,
          pageX: 0,
          pageY: 0,
          bubbles: true,
          cancelable: true,
          view: window
        });
        canvas.dispatchEvent(mouseDownEvent);
        panPosition.set(0, 0, 0);
        webglContent.pan(panPosition);

        canvas.style.pointerEvents = "none"

        linearSimulationTimer = setInterval(() => {
          calcX += 40;
          console.log(MouseEvent(clientX))
          const mouseMoveEvent = new MouseEvent('mousemove', {
            clientX: calcX,
            clientY: calcY,
            pageX: 0,
            pageY: 0,
            bubbles: true,
            cancelable: true,
            view: window
          });
          canvas.dispatchEvent(mouseMoveEvent);
        }, 50);
      }
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