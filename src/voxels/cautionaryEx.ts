import * as THREE from "three";
import { createRange, deepLoop, getOffsetFromPosition } from "../utils/basicUtils";

// cautionary ex
export const CHUNK_SIZE = 256;
const yzxRanges = [
  createRange(0, CHUNK_SIZE),
  createRange(0, CHUNK_SIZE),
  createRange(0, CHUNK_SIZE),
];


export function generateHillsData() {
  const chunk = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE);

  deepLoop(yzxRanges, (...[y, z, x]) => {
    const height = (Math.sin(x / CHUNK_SIZE * Math.PI * 4) + Math.sin(z / CHUNK_SIZE * Math.PI * 6)) * 20 + CHUNK_SIZE / 2;

    if (height > y && height < y + 1) {
      const offset = getOffsetFromPosition(x, y, z, CHUNK_SIZE);
      chunk[offset] = 1;
    }
  });

  return chunk;
}

function generateHillsDataRegular() {
  const chunk = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE);

  for (let y = 0; y < CHUNK_SIZE; y++) {
    for (let z = 0; z < CHUNK_SIZE; z++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        const height = (Math.sin(x / CHUNK_SIZE * Math.PI * 4) + Math.sin(z / CHUNK_SIZE * Math.PI * 6)) * 20 + CHUNK_SIZE / 2;

        if (height > y && height < y + 1) {
          const offset = getOffsetFromPosition(x, y, z, CHUNK_SIZE);
          chunk[offset] = 1;
        }
      }
    }
  }

  return chunk;
}


export function getDataMesh(data: Uint8Array, scene: any) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({ color: "green" });

  deepLoop(yzxRanges, (...[y, z, x]) => {
    const offset = getOffsetFromPosition(x, y, z, CHUNK_SIZE);
    const block = data[offset];

    if (block) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      scene.add(mesh);
    }
  });
}
