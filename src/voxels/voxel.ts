// https://threejs.org/manual/#en/voxel-geometry

import { RefObject } from "react";
import * as THREE from "three";
import { Camera, PerspectiveCamera, Renderer, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { getWorld } from "./worldGenEx";

import Stats from 'stats.js';
import createVoxelPlacer from "./voxelPlacer";

const CHUNK_SIZE = 32;
const ASPECT = 1;

interface UIState {
  currentVoxel: number;
}

function createVoxelSelectorUI(uiState: UIState) {
  let currentId: string | undefined;

  const uiDOMID = "canvas-ui";

  const existingSelectorUI = document.querySelector(`#${uiDOMID}`);
  if (existingSelectorUI) {
    if (existingSelectorUI.parentNode) {
      existingSelectorUI.parentNode.removeChild(existingSelectorUI);
    } else {
      console.error("Could not remove existing selector UI!");
      return;
    }
  }

  const ui = document.createElement("div");
  ui.id = uiDOMID;
  const row1 = document.createElement("div");
  row1.classList.add("canvas-ui__tiles");
  const row2 = document.createElement("div");
  row2.classList.add("canvas-ui__tiles");

  const uiStateReader = document.createElement('p');
  uiStateReader.setAttribute("style", "position: absolute; z-index: 30;");
  uiStateReader.textContent = "" + uiState.currentVoxel;
  ui.appendChild(uiStateReader);

  for (let i = 1; i <= 16; i++) {
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "voxel";
    radio.id = "voxel" + i;
    radio.value = "" + i;

    radio.addEventListener('click', () => {
      if (radio.id === currentId) {
        radio.checked = false;
        currentId = undefined;
        uiState.currentVoxel = 0;
        console.log("uncheck")
      } else {
        currentId = radio.id;
        uiState.currentVoxel = i;
        uiStateReader.textContent = "" + uiState.currentVoxel;
        console.log("check", uiState.currentVoxel);
      }
    })

    const radioLabel = document.createElement("label");
    radioLabel.setAttribute("for", "voxel" + i);
    radioLabel.setAttribute("style", `background-position: -${(i - 1) * 100}% -0%`)

    // add to either row1 or row2 depending on i
    const inputParent = i <= 8 ? row1 : row2;
    inputParent.appendChild(radio);
    inputParent.appendChild(radioLabel);
  }

  ui.appendChild(row1);
  ui.appendChild(row2);
  return ui;
}

function createCamera() {
  const fov = 75;
  const aspect = ASPECT;
  const near = 0.1;
  const far = 600;
  const cam = new THREE.PerspectiveCamera(fov, aspect, near, far);
  cam.position.set(-CHUNK_SIZE * 1, CHUNK_SIZE * 1, -CHUNK_SIZE * 0.8);
  return cam;
}

function createDirectionalLight(pos: Vector3) {
  const col = 0xffffff;
  const intensity = 1;
  const light = new THREE.DirectionalLight(col, intensity);

  light.position.set(...pos.toArray());

  return light;
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

function initStats() {
  const statsDomID = "three-canvas-stats";
  
  if (document.querySelector(`#${statsDomID}`)) {
    return;
  }

  const stats = new Stats();
  stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
  stats.dom.id = statsDomID;
  document.body.appendChild( stats.dom );

  return stats;
}

function initControls(
  renderer:THREE.Renderer,
  camera:THREE.Camera,
  onChange:()=>void
) {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;

  controls.update();
  controls.addEventListener("change", onChange);
  return controls;
}


// function main(mountRef: RefObject<HTMLElement>) {
//   if (!mountRef?.current) {
//     return;
//   }

//   const mountGroup = document.createElement("div");

//   const stats = initStats();

//   const renderer = new THREE.WebGLRenderer();

//   mountGroup.appendChild(renderer.domElement);
//   mountRef.current.appendChild(mountGroup);

//   // add UI as *sibling* of canvas
//   const selectorUI = createVoxelSelectorUI();
//   if (selectorUI) {
//     mountRef.current.appendChild(selectorUI);
//   }

//   const camera = createCamera();
//   camera.position.set(-CHUNK_SIZE * 1, CHUNK_SIZE * 1, -CHUNK_SIZE * 0.8);

//   // set up controls
//   const controls = initControls(camera, renderer);
//   controls.addEventListener("change", requestRenderIfNotRequested);
//   window.addEventListener("resize", requestRenderIfNotRequested);

//   const tex = loadTexture(textureAtlas, render);

//   const scene = new THREE.Scene();

//   scene.add(getWorld(CHUNK_SIZE, tex));

//   const dirLight = createDirectionalLight(new Vector3(-1, 2, 4));
//   const ambLight = new THREE.AmbientLight(0x404040);

//   scene.add(dirLight);
//   scene.add(ambLight);

//   let renderRequested = false;

//   function render() {
//     stats?.begin();
//     renderRequested = false;
//     handleCanvasScaling(camera, renderer);
//     controls.update();
//     renderer.render(scene, camera);
//     stats?.end();
//   }

//   render();

//   function requestRenderIfNotRequested() {
//     if (!renderRequested) {
//       renderRequested = true;
//       requestAnimationFrame(render);
//     }
//   }

//   return mountGroup;
// }

// TODO: figure out how to organize stuff properly...

function createVoxelApplication(mountRef:RefObject<HTMLElement>) {
  if (!mountRef?.current) {
    return;
  }

  // TODO: replace with resizeObserver
  window.addEventListener("resize", requestRenderIfNotRequested);

  const renderer = new THREE.WebGLRenderer();

  const stats = initStats();
  const camera = createCamera();
  const controls = initControls(renderer, camera, requestRenderIfNotRequested);
  const scene = new THREE.Scene();

  const mountGroup = document.createElement("div");
  mountGroup.appendChild(renderer.domElement);
  mountRef.current.appendChild(mountGroup);

  const uiState = {
    currentVoxel: 0
  };

  const selectorUI = createVoxelSelectorUI(uiState);

  if (selectorUI) {
    mountRef.current.appendChild(selectorUI);
  }

  function initScene() {
    const world = getWorld(
      CHUNK_SIZE,
      requestRenderIfNotRequested,
      (mesh) => scene.add(mesh)
    );

    createVoxelPlacer({
      canvas: renderer.domElement,
      camera,
      world,
      uiState
    });

    // lighting
    const dirLight = createDirectionalLight(new Vector3(-1, 2, 4));
    const ambLight = new THREE.AmbientLight(0x404040);
    scene.add(dirLight);
    scene.add(ambLight);
  }

  let renderRequested = false;

  function render() {
    stats?.begin();
    renderRequested = false;
    handleCanvasScaling(camera, renderer);
    controls.update();
    renderer.render(scene, camera);
    stats?.end();
  }

  function requestRenderIfNotRequested() {
    if (!renderRequested) {
      renderRequested = true;
      requestAnimationFrame(render);
    }
  }

  initScene();
  render();

  return {mountGroup};
}

export default createVoxelApplication;
