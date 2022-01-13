import * as THREE from 'three';
import MathEx from 'js-util/MathEx';

import Camera from './Camera';
import Fog from './Fog';
import Background from './Background';
import PostEffectBright from './PostEffectBright';
import PostEffectBlur from './PostEffectBlur';
import PostEffectBloom from './PostEffectBloom';

// ==========
// Define common variables
//
let renderer;
const scene = new THREE.Scene();
const camera = new Camera();
const clock = new THREE.Clock({
    autoStart: false
});
const texLoader = new THREE.TextureLoader();

const page = document.querySelector('.l-page');
const pageHex = Number(page.dataset.hex);

// For the post effect.
const renderTarget1 = new THREE.WebGLRenderTarget();
const renderTarget2 = new THREE.WebGLRenderTarget();
const renderTarget3 = new THREE.WebGLRenderTarget();
const scenePE = new THREE.Scene();
const cameraPE = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 2);

// ==========
// Define unique variables
//
const FOGS_COUNT = 40;
const fogs = [];


const bg = new Background();

// For the post effect.
const postEffectBright = new PostEffectBright();
const postEffectBlurX = new PostEffectBlur();
const postEffectBlurY = new PostEffectBlur();
const postEffectBloom = new PostEffectBloom();

export default class WebGLContent {
    constructor() {
    }
    async start(canvas) {
        renderer = new THREE.WebGL1Renderer({
            alpha: true,
            antialias: true,
            canvas: canvas,
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x0e0e0e, 1.0);

        camera.start();

        postEffectBright.start(renderTarget1.texture);
        postEffectBlurX.start(renderTarget2.texture, 1, 0);
        postEffectBlurY.start(renderTarget3.texture, 0, 1);
        postEffectBloom.start(renderTarget1.texture, renderTarget2.texture);

        let crystalFogTex;

        await Promise.all([
            texLoader.loadAsync('/sketch-threejs/img/sketch/crystal/fog.jpg'),
        ])
            .then((response) => {
                crystalFogTex = response[0];
                crystalFogTex.wrapS = THREE.RepeatWrapping;
                crystalFogTex.wrapT = THREE.RepeatWrapping;
            })
            .catch((error) => {
                console.log(error)
            });
        for (var i = 0; i < FOGS_COUNT; i++) {
            const radian1 = MathEx.radians(i / FOGS_COUNT * 360);
            const radian2 = MathEx.radians(i / FOGS_COUNT * -360 - 90);
            const radius = 100;
            fogs[i] = new Fog();
            fogs[i].position.set(
                Math.cos(radian1) * radius,
                -18 - Math.sin(MathEx.radians(i / FOGS_COUNT * 360 * 8)) * 8,
                Math.sin(radian1) * radius
            );
            fogs[i].rotation.set(0, radian2, 0);
            fogs[i].start((i / FOGS_COUNT) + pageHex, crystalFogTex);
            scene.add(fogs[i]);
        }

        scene.add(bg);
    }
    stop() {
        this.pause();
    }
    play(dd) {
        clock.start();
        this.update(dd);
    }
    pause() {
        clock.stop();
    }
    update(dd) {
        // When the clock is stopped, it stops the all rendering too.
        if (clock.running === false) return;

        // Calculate msec for this frame.
        const time = clock.getDelta();

        // Update each objects.
        for (var i = 0; i < fogs.length; i++) {
            fogs[i].update(time);
        }
        bg.update(
            time, pageHex

        );

        camera.update();

        // Render the main scene to frame buffer.
        renderer.setRenderTarget(renderTarget1);
        renderer.render(scene, camera);

        // // Render the post effect.
        scenePE.add(postEffectBright);
        renderer.setRenderTarget(renderTarget2);
        renderer.render(scenePE, cameraPE);
        scenePE.remove(postEffectBright);
        scenePE.add(postEffectBlurX);
        renderer.setRenderTarget(renderTarget3);
        renderer.render(scenePE, cameraPE);
        scenePE.remove(postEffectBlurX);
        scenePE.add(postEffectBlurY);
        renderer.setRenderTarget(renderTarget2);
        renderer.render(scenePE, cameraPE);
        scenePE.remove(postEffectBlurY);
        scenePE.add(postEffectBloom);
        renderer.setRenderTarget(null);
        renderer.render(scenePE, cameraPE);
        scenePE.remove(postEffectBloom);
    }
    resize(resolution) {
        camera.resize(resolution);
        renderer.setSize(resolution.x, resolution.y);
        renderTarget1.setSize(resolution.x * renderer.getPixelRatio(), resolution.y * renderer.getPixelRatio());
        renderTarget2.setSize(resolution.x * renderer.getPixelRatio(), resolution.y * renderer.getPixelRatio());
        renderTarget3.setSize(resolution.x * renderer.getPixelRatio(), resolution.y * renderer.getPixelRatio());
        postEffectBlurY.resize(resolution.x / 3, resolution.y / 3);
        postEffectBlurX.resize(resolution.x / 3, resolution.y / 3);
    }
}
