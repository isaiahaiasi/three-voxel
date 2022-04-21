import { RefObject } from "react";
import * as THREE from "three";
import { Camera, PerspectiveCamera, Renderer, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { getWorld } from "./worldGenEx";

import Stats from 'stats.js';

const CHUNK_SIZE = 128;
const ASPECT = 1;

function createCamera() {
  const fov = 75;
  const aspect = ASPECT;
  const near = 0.1;
  const far = 600;
  return new THREE.PerspectiveCamera(fov, aspect, near, far);
}

function createDirectionalLight(pos: Vector3) {
  const col = 0xffffff;
  const intensity = 1;
  const light = new THREE.DirectionalLight(col, intensity);

  light.position.set(...pos.toArray());

  return light;
}

const renderFrameActions: any[] = [];

function createCube(size: number, color: number, position: Vector3) {
  const geo = new THREE.BoxGeometry(size, size, size);
  const mat = new THREE.MeshPhongMaterial({ color });
  const cube = new THREE.Mesh(geo, mat);

  cube.position.set(...position.toArray());

  return cube;
}

function handleCanvasScaling(camera: PerspectiveCamera, renderer: Renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  const needResize = canvas.width !== width || canvas.height !== height;

  if (needResize) {
    console.log("need resize");
    renderer.setSize(width, width / camera.aspect, true);
    camera.updateProjectionMatrix();
  }
}

function getRandomColor() {
  return Math.ceil(Math.random() * 255 * 255 * 255);
}

function initControls(camera: Camera, renderer: Renderer) {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;

  controls.update();

  return controls;
}

function main(mountRef: RefObject<HTMLElement>) {
  if (!mountRef?.current) {
    return;
  }

  // init stats
  const stats = new Stats();
  stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild( stats.dom );

  const renderer = new THREE.WebGLRenderer();
  mountRef.current.appendChild(renderer.domElement);

  const camera = createCamera();
  camera.position.set(-CHUNK_SIZE * .3, CHUNK_SIZE * .8, -CHUNK_SIZE * .3);

  // set up controls
  const controls = initControls(camera, renderer);
  controls.addEventListener("change", requestRenderIfNotRequested);
  window.addEventListener("resize", requestRenderIfNotRequested);

  const scene = new THREE.Scene();

  scene.add(getWorld(CHUNK_SIZE));

  const dirLight = createDirectionalLight(new Vector3(-1, 2, 4));
  const ambLight = new THREE.AmbientLight(0x404040);

  scene.add(dirLight);
  scene.add(ambLight);

  let renderRequested = false;

  function render() {
    stats.begin();
    renderRequested = false;
    handleCanvasScaling(camera, renderer);
    controls.update();
    renderFrameActions.forEach((action) => action());
    renderer.render(scene, camera);
    stats.end();
  }

  render();

  function requestRenderIfNotRequested() {
    if (!renderRequested) {
      renderRequested = true;
      requestAnimationFrame(render);
    }
  }

  return renderer;
}

export default main;
