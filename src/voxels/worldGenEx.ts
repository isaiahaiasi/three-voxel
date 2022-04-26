import * as THREE from 'three';
import { Texture, Vector3 } from "three";
import { deepLoop, getRangesFromMax, randInt } from "../utils/basicUtils";
import VoxelWorld from "./VoxelWorld";

const tileSize = 16;
const tileTextureWidth = 256;
const tileTextureHeight = 64;

export function getWorld(chunkSize: number, texture: Texture) {
  const world = new VoxelWorld({
    chunkSize,
    tileSize,
    tileTextureHeight,
    tileTextureWidth,
  });

  setWorldData(world, chunkSize);
  
  // actually generate the geo:
  const { positions, normals, uvs, indices} = world.generateGeometryDataForChunk(new Vector3(0, 0, 0));
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.MeshLambertMaterial({
    map: texture,
    side: THREE.DoubleSide,
    alphaTest: 0.1,
    transparent: true,
  });

  const positionNumComponents = 3;
  const normalNumComponents = 3;
  const uvNumComponents = 2;

  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents)
  );

  geometry.setAttribute(
    'normal',
    new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents)
  );

  geometry.setAttribute(
    'uv',
    new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents)
  );

  geometry.setIndex(indices);
  
  return new THREE.Mesh(geometry, material);
}

function setWorldData(world: VoxelWorld, chunkSize: number) {
  deepLoop(
    getRangesFromMax(...[chunkSize, chunkSize, chunkSize]),
    (y, z, x) => {
      const height = (Math.sin(x / chunkSize * Math.PI * 2) + Math.sin(z / chunkSize * Math.PI * 3)) * (chunkSize / 6) + (chunkSize / 2);
      if (y < height) {
        world.setVoxel(x, y, z, randInt(1, 17));
      }
  });
}