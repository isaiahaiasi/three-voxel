import { RefObject } from "react";
import * as THREE from "three";
import { Renderer, WebGLBufferRenderer } from "three";

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

// cautionary ex

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

function createCamera() {
  const fov = 75;
  const aspect = 2;
  const near = 0.1;
  const far = 5;
  return new THREE.PerspectiveCamera(fov, aspect, near, far);
}

function createDirectionalLight(pos: Vec3) {
  const col = 0xffffff;
  const intensity = 1;
  const light = new THREE.DirectionalLight(col, intensity);

  const { x: px, y: py, z: pz } = pos;
  light.position.set(px, py, pz);

  return light;
}

const renderFrameActions: any[] = [];

function createCube(size: number, color: number) {
  const geo = new THREE.BoxGeometry(size, size, size);
  const mat = new THREE.MeshPhongMaterial({ color });
  const cube = new THREE.Mesh(geo, mat);

  // anim actions
  const seed = Math.random() + 0.5;
  renderFrameActions.push((time: number) => {
    cube.rotation.x = time * 0.001 * seed;
    cube.rotation.y = time * 0.001 * seed;
  });

  return cube;
}

function main(mountRef: RefObject<HTMLElement>) {
  if (!mountRef?.current) {
    return;
  }

  const renderer = new THREE.WebGLRenderer();
  mountRef.current.appendChild(renderer.domElement);

  const camera = createCamera();
  camera.position.z = 2;

  const scene = new THREE.Scene();

  const cube = createCube(1, 0x44aa88);
  const light = createDirectionalLight({ x: -1, y: 2, z: 4 });

  scene.add(cube);
  scene.add(light);

  renderer.setAnimationLoop((time) => {
    renderFrameActions.forEach((action) => action(time));
    renderer.render(scene, camera);
  });

  return renderer;
}

export default main;
