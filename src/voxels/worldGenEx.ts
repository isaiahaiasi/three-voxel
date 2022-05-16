import * as THREE from 'three';
import { loadTexture } from './voxelUtils';
import VoxelWorld from "./VoxelWorld";
import textureAtlas from "./assets/flourish-cc-by-nc-sa.png";

const tileSize = 16;
const tileTextureWidth = 256;
const tileTextureHeight = 64;

export function getWorld(
  chunkSize: number,
  requestRender:()=>void,
  addMeshToScene:(mesh:THREE.Mesh)=>void,
) {
  const texture = loadTexture(textureAtlas, requestRender);

  const material = new THREE.MeshLambertMaterial({
    map: texture,
    side: THREE.DoubleSide,
    alphaTest: 0.1,
    transparent: true,
  });

  const world = new VoxelWorld({
    chunkSize,
    tileSize,
    tileTextureHeight,
    tileTextureWidth,
    material,
    addMeshToScene,
    requestRender,
  });

  world.init();

  return world;
}
