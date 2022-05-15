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
  });

  world.initWorld();

  return world;


  // world.generateDefaultWorldData();

  // // actually generate the geo:
  // const { positions, normals, uvs, indices} = world.generateGeometryDataForChunk(new Vector3(0, 0, 0));
  // const geometry = new THREE.BufferGeometry();

  // const positionNumComponents = 3;
  // const normalNumComponents = 3;
  // const uvNumComponents = 2;

  // geometry.setAttribute(
  //   'position',
  //   new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents)
  // );

  // geometry.setAttribute(
  //   'normal',
  //   new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents)
  // );

  // geometry.setAttribute(
  //   'uv',
  //   new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents)
  // );

  // geometry.setIndex(indices);
  
  // return new THREE.Mesh(geometry, material);
}
