import * as THREE from "three";

export const vec3NeighborOffsets = {
  self: [0, 0, 0],
  left: [-1, 0, 0],
  right: [1, 0, 0],
  down: [0, -1, 0],
  up: [0, 1, 0],
  back: [0, 0, -1],
  front: [0, 0, 1],
}

export function loadTexture(path: string, onLoad?: any) {
  const loader = new THREE.TextureLoader();
  const texture = onLoad ? loader.load(path, onLoad) : loader.load(path);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

export function getVoxelMaterial(path: string) {
  const texture = loadTexture(path);
  return new THREE.MeshLambertMaterial({
    map: texture,
    side: THREE.DoubleSide,
    alphaTest: 0.1,
    transparent: true,
  });
}