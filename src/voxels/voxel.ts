import { RefObject } from "react";
import * as THREE from "three";
import { Camera, PerspectiveCamera, Renderer, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// cautionary ex
{
  const cellSize = 128;

  function getDataArray() {
    const cell = new Uint8Array(cellSize * cellSize * cellSize);

    for (let y = 0; y < cellSize; y++) {
      for (let z = 0; z < cellSize; z++) {
        for (let x = 0; x < cellSize; x++) {
          const height =
            Math.sin((x / cellSize) * Math.PI * 4) *
              Math.sin((z / cellSize) * Math.PI * 6) *
              20 +
            cellSize / 2;
          if (height > y && height < y + 1) {
            const offset = y * cellSize * cellSize + z * cellSize + x;
            cell[offset] = 1;
          }
        }
      }
    }

    return cell;
  }

  function getDataMesh(data: Uint8Array, scene: any) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: "green" });

    for (let y = 0; y < cellSize; ++y) {
      for (let z = 0; z < cellSize; ++z) {
        for (let x = 0; x < cellSize; ++x) {
          const offset = y * cellSize * cellSize + z * cellSize + x;
          const block = data[offset];
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(x, y, z);
          scene.add(mesh);
        }
      }
    }
  }
}

function createCamera() {
  const fov = 75;
  const aspect = 2;
  const near = 0.1;
  const far = 5;
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

  const renderer = new THREE.WebGLRenderer();
  mountRef.current.appendChild(renderer.domElement);

  const camera = createCamera();
  camera.position.z = 2.5;

  // set up controls
  // ok but WHY does
  const controls = initControls(camera, renderer);
  controls.addEventListener("change", requestRenderIfNotRequested);
  window.addEventListener("resize", requestRenderIfNotRequested);

  const scene = new THREE.Scene();

  const cubes = [
    createCube(1, getRandomColor(), new Vector3(-2, 0, 0)),
    createCube(1, getRandomColor(), new Vector3(0, 0, 0)),
    createCube(1, getRandomColor(), new Vector3(2, 0, 0)),
  ];

  const dirLight = createDirectionalLight(new Vector3(-1, 2, 4));
  const ambLight = new THREE.AmbientLight(0x404040);

  cubes.forEach((cube) => scene.add(cube));
  scene.add(dirLight);
  scene.add(ambLight);

  let renderRequested = false;

  function render() {
    renderRequested = false;
    handleCanvasScaling(camera, renderer);
    controls.update();
    renderFrameActions.forEach((action) => action());
    renderer.render(scene, camera);
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
