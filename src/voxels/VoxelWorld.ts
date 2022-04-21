import * as THREE from "three";
import { Vector3 } from "three";
import { createRange, deepLoop, getOffsetFromPosition } from "../utils/basicUtils";

// size of each "chunk" to divide the world into
// eg, a 32^3 cube of voxel data which is a subset of a larger "world"
export default class VoxelWorld {
  static faces: { dir: number[]; corners: [number, number, number][]}[];

  chunkSize: number;
  chunk: Uint8Array;

  constructor(chunkSize: number) {
    this.chunkSize = chunkSize;
    this.chunk = new Uint8Array(chunkSize * chunkSize * chunkSize);
  }

  getChunkForVoxel(x:number, y:number, z:number) {
    const { chunkSize } = this;
    const chunkX = Math.floor(x / chunkSize);
    const chunkY = Math.floor(y / chunkSize);
    const chunkZ = Math.floor(z / chunkSize);

    if (chunkX !== 0 || chunkY !== 0 || chunkZ !== 0) {
      return null;
    } else {
      return this.chunk;
    }
  }

  getVoxel(x: number, y: number, z: number) {
    const chunk = this.getChunkForVoxel(x, y, z);

    if (!chunk) {
      return 0;
    }

    const { chunkSize } = this;
    const [voxelX, voxelY, voxelZ] = [x, y, z].map(n => 
      THREE.MathUtils.euclideanModulo(n, chunkSize) | 0
    );

    const voxelOffset = getOffsetFromPosition(voxelX, voxelY, voxelZ, chunkSize);

    return chunk[voxelOffset];
  };

  setVoxel(x: number, y: number, z: number, v: number) {
    const chunk = this.getChunkForVoxel(x, y, z);

    if (!chunk) {
      return; // TODO: add new chunk?
    }

    const { chunkSize } = this;
    const voxelX = THREE.MathUtils.euclideanModulo(x, chunkSize) | 0;
    const voxelY = THREE.MathUtils.euclideanModulo(y, chunkSize) | 0;
    const voxelZ = THREE.MathUtils.euclideanModulo(z, chunkSize) | 0;
    const voxelOffset = getOffsetFromPosition(voxelX, voxelY, voxelZ, chunkSize);

    chunk[voxelOffset] = v;
  }

  generateGeometryDataForChunk(chunkPos: Vector3) {
    const { chunkSize } = this;
    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    const [startX, startY, startZ] = chunkPos.toArray()
                                     .map(chunkAxis => chunkAxis * chunkSize);

    deepLoop(
      [
        createRange(0, chunkSize),
        createRange(0, chunkSize),
        createRange(0, chunkSize),
      ],
      (...[y, z, x]) => {
        const voxY = startY + y;
        const voxZ = startZ + z;
        const voxX = startX + x;

        const voxel = this.getVoxel(voxX, voxY, voxZ);

        if (voxel) {
          VoxelWorld.faces.forEach(({dir, corners}) => {
            const neighbor = this.getVoxel(
              voxX + dir[0],
              voxY + dir[1],
              voxZ + dir[2],
            );

            if (!neighbor) {
              // no neighbor, so need to render face
              const ndx = positions.length / 3;
              corners.forEach(pos => {
                positions.push(pos[0] + x, pos[1] + y, pos[2] + z );
                normals.push(...dir);
              });

              indices.push(
                ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3,
              )
            }
          })
        }
      }
    );

    return {
      positions,
      normals,
      indices
    }
  }
}

VoxelWorld.faces = [
  { // left
    dir: [ -1,  0,  0, ],
    corners: [
      [ 0, 1, 0 ],
      [ 0, 0, 0 ],
      [ 0, 1, 1 ],
      [ 0, 0, 1 ],
    ],
  },
  { // right
    dir: [  1,  0,  0, ],
    corners: [
      [ 1, 1, 1 ],
      [ 1, 0, 1 ],
      [ 1, 1, 0 ],
      [ 1, 0, 0 ],
    ],
  },
  { // bottom
    dir: [  0, -1,  0, ],
    corners: [
      [ 1, 0, 1 ],
      [ 0, 0, 1 ],
      [ 1, 0, 0 ],
      [ 0, 0, 0 ],
    ],
  },
  { // top
    dir: [  0,  1,  0, ],
    corners: [
      [ 0, 1, 1 ],
      [ 1, 1, 1 ],
      [ 0, 1, 0 ],
      [ 1, 1, 0 ],
    ],
  },
  { // back
    dir: [  0,  0, -1, ],
    corners: [
      [ 1, 0, 0 ],
      [ 0, 0, 0 ],
      [ 1, 1, 0 ],
      [ 0, 1, 0 ],
    ],
  },
  { // front
    dir: [  0,  0,  1, ],
    corners: [
      [ 0, 0, 1 ],
      [ 1, 0, 1 ],
      [ 0, 1, 1 ],
      [ 1, 1, 1 ],
    ],
  },
];