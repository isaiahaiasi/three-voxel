import * as THREE from 'three';
import { Vector3 } from "three";
import { deepLoop, getRangesFromMax } from "../utils/basicUtils";
import VoxelWorld from "./VoxelWorld";

export function getWorld(chunkSize: number) {
  const world = new VoxelWorld(chunkSize);

  setWorldData(world, chunkSize);
  
  // actually generate the geo:
  const { positions, normals, indices} = world.generateGeometryDataForChunk(new Vector3(0, 0, 0));
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.MeshLambertMaterial({color: "green"});

  const positionNumComponents = 3;
  const normalNumComponents = 3;
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents)
  );
    geometry.setAttribute(
      'normal',
      new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents)
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
        world.setVoxel(x, y, z, 1);
      }
  });
}