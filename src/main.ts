import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { World } from "./core/World";
import { CSS2DRenderer } from "three/examples/jsm/Addons.js";
import { AlphaFactory } from "./factories/AlphaFactory";

import "./style.css";
import { GCharge, GPos } from "./utils/constants";
import { Force } from "./core/Force";
import { BigN } from "./utils/generics";
import { ForceTransition } from "./core/ForceTransition";
// import { Force } from "./core/Force";
// import { BigN } from "./utils/generics";

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 4;
camera.position.y = 1;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("app")!.appendChild(renderer.domElement);

const textRenderer = new CSS2DRenderer();
textRenderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("app")!.appendChild(textRenderer.domElement);

const world = new World();

const controls = new OrbitControls(camera, renderer.domElement);

// // const alpha1 = AlphaFactory.generate(world, { [GPos.UP]: GCharge.NEG, [GPos.EAST]: GCharge.POS }, "left");
// // const alpha2 = AlphaFactory.generate(world, { [GPos.UP]: GCharge.POS, [GPos.WEST]: GCharge.NEG }, "right");
// // // const alpha3 = AlphaFactory.generate(world, { [GPos.DOWN]: GCharge.POS, [GPos.UP]: GCharge.POS }, "up");
// // const alpha4 = AlphaFactory.generate(world, { [GPos.UP]: GCharge.NEG, [GPos.DOWN]: GCharge.POS }, "down");

// // alpha1.position.set(-2, 0, 0);
// // alpha2.position.set(2, 0, 0);
// // // alpha3.position.set(0, 2, 0);
// // alpha4.position.set(0, -2, 0);

const alpha1 = AlphaFactory.generate(world, { [GPos.EAST]: GCharge.POS, [GPos.UP]: GCharge.NEG }, "left");
const alpha2 = AlphaFactory.generate(world, { [GPos.WEST]: GCharge.NEG, [GPos.UP]: GCharge.POS }, "right");

// alpha1.speeds.addOrUpdate(new Force('', 'constant', new THREE.Vector3(1, 0, 0).normalize(), new BigN(0.05)))
alpha1.position.set(-2, 0, 0);
alpha2.position.set(2, 0, 0);

// Testing ForceTransition..
// const f1 = new Force("f1", "test", new THREE.Vector3(1, 0, 0).normalize(), new BigN(2));
// const f2 = new Force("f2", "test", new THREE.Vector3(0, 1, 0).normalize(), new BigN(3));

// const anim = new ForceTransition('f1-f2', f1, f2, 50, 50);

window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  textRenderer.setSize(window.innerWidth, window.innerHeight);

  render();
}

function animate() {
  requestAnimationFrame(animate);

  world.update();

  controls.update();
  render();
}

function render() {
  renderer.render(world, camera);
  textRenderer.render(world, camera);
}

animate();
