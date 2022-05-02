import * as THREE from "three";
import { Vector3 } from "three";
import { createRange, deepLoop, getOffsetFromPosition } from "../utils/basicUtils";

// size of each "chunk" to divide the world into
// eg, a 32^3 cube of voxel data which is a subset of a larger "world"

interface Face {
  uvRow: number;
  dir: number[];
  corners: {
    pos: [ number, number, number ],
    uv: [ number, number ],
  }[];
};

interface VoxelWorldOptions {
  chunkSize: number;
  tileSize: number;
  tileTextureWidth: number;
  tileTextureHeight: number;
}

export default class VoxelWorld {
  static faces: Face[];

  private chunkSize: number;
  private tileSize: number;
  private tileTextureWidth: number;
  private tileTextureHeight: number;
  private chunkSliceSize: number;
  private chunks: Map<string, Uint8Array>;

  constructor({
    chunkSize,
    tileSize,
    tileTextureWidth,
    tileTextureHeight,
  }: VoxelWorldOptions) {
    this.chunkSize = chunkSize;
    this.tileSize = tileSize;
    this.tileTextureWidth = tileTextureWidth;
    this.tileTextureHeight = tileTextureHeight;
  
    this.chunkSliceSize = chunkSize * chunkSize;
    this.chunks = new Map();
  }

  computeChunkId(x: number, y: number, z: number) {
    const { chunkSize } = this;
    const chunkX = Math.floor(x / chunkSize);
    const chunkY = Math.floor(y / chunkSize);
    const chunkZ = Math.floor(z / chunkSize);
    return `${chunkX},${chunkY},${chunkZ}`;
  }

  computeVoxelOffset(x: number, y: number, z: number) {
    const { chunkSize } = this;
    const voxelX = THREE.MathUtils.euclideanModulo(x, chunkSize) | 0;
    const voxelY = THREE.MathUtils.euclideanModulo(y, chunkSize) | 0;
    const voxelZ = THREE.MathUtils.euclideanModulo(z, chunkSize) | 0;
    return getOffsetFromPosition(voxelX, voxelY, voxelZ, chunkSize);
  }

  getChunkForVoxel(x:number, y:number, z:number) {
    return this.chunks.get(this.computeChunkId(x, y, z));
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
  }

  setVoxel(x: number, y: number, z: number, v: number) {
    let chunk = this.getChunkForVoxel(x, y, z);

    if (chunk === undefined) {
      chunk = this.addChunkForVoxel(x, y, z);
    }

    const voxelOffset = this.computeVoxelOffset(x, y, z);

    chunk[voxelOffset] = v;
  }

  addChunkForVoxel(x: number, y: number, z: number) {
    const chunkId = this.computeChunkId(x, y, z);
    let chunk = this.chunks.get(chunkId);
    
    if (!chunk) {
      const { chunkSize } = this;
      chunk = new Uint8Array(chunkSize * chunkSize * chunkSize);
      this.chunks.set(chunkId, chunk);
    }

    return chunk;
  }

  generateGeometryDataForChunk(chunkPos: Vector3) {
    const { chunkSize, tileSize, tileTextureWidth, tileTextureHeight } = this;
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
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
          const uvVoxel = voxel - 1; // voxel 0 is sky so for UVs we start at 0

          // there is a voxel, but do we need faces for it?
          VoxelWorld.faces.forEach(({dir, corners, uvRow}) => {
            const neighbor = this.getVoxel(
              voxX + dir[0],
              voxY + dir[1],
              voxZ + dir[2],
            );

            if (!neighbor) {
              // no neighbor, so need to render face
              const ndx = positions.length / 3;
              corners.forEach(({pos, uv}) => {
                positions.push(pos[0] + x, pos[1] + y, pos[2] + z );
                normals.push(...dir);

                uvs.push(
                  (uvVoxel + uv[0]) * tileSize / tileTextureWidth,
                  1 - (uvRow + 1 - uv[1]) * tileSize / tileTextureHeight
                );
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
      uvs,
      indices,
    }
  }
}

VoxelWorld.faces = [
  { // left
    uvRow: 0,
    dir: [ -1,  0,  0, ],
    corners: [
      { pos: [ 0, 1, 0 ], uv: [ 0, 1 ], },
      { pos: [ 0, 0, 0 ], uv: [ 0, 0 ], },
      { pos: [ 0, 1, 1 ], uv: [ 1, 1 ], },
      { pos: [ 0, 0, 1 ], uv: [ 1, 0 ], },
    ],
  },
  { // right
    uvRow: 0,
    dir: [  1,  0,  0, ],
    corners: [
      { pos: [ 1, 1, 1 ], uv: [ 0, 1 ], },
      { pos: [ 1, 0, 1 ], uv: [ 0, 0 ], },
      { pos: [ 1, 1, 0 ], uv: [ 1, 1 ], },
      { pos: [ 1, 0, 0 ], uv: [ 1, 0 ], },
    ],
  },
  { // bottom
    uvRow: 1,
    dir: [  0, -1,  0, ],
    corners: [
      { pos: [ 1, 0, 1 ], uv: [ 1, 0 ], },
      { pos: [ 0, 0, 1 ], uv: [ 0, 0 ], },
      { pos: [ 1, 0, 0 ], uv: [ 1, 1 ], },
      { pos: [ 0, 0, 0 ], uv: [ 0, 1 ], },
    ],
  },
  { // top
    uvRow: 2,
    dir: [  0,  1,  0, ],
    corners: [
      { pos: [ 0, 1, 1 ], uv: [ 1, 1 ], },
      { pos: [ 1, 1, 1 ], uv: [ 0, 1 ], },
      { pos: [ 0, 1, 0 ], uv: [ 1, 0 ], },
      { pos: [ 1, 1, 0 ], uv: [ 0, 0 ], },
    ],
  },
  { // back
    uvRow: 0,
    dir: [  0,  0, -1, ],
    corners: [
      { pos: [ 1, 0, 0 ], uv: [ 0, 0 ], },
      { pos: [ 0, 0, 0 ], uv: [ 1, 0 ], },
      { pos: [ 1, 1, 0 ], uv: [ 0, 1 ], },
      { pos: [ 0, 1, 0 ], uv: [ 1, 1 ], },
    ],
  },
  { // front
    uvRow: 0,
    dir: [  0,  0,  1, ],
    corners: [
      { pos: [ 0, 0, 1 ], uv: [ 0, 0 ], },
      { pos: [ 1, 0, 1 ], uv: [ 1, 0 ], },
      { pos: [ 0, 1, 1 ], uv: [ 0, 1 ], },
      { pos: [ 1, 1, 1 ], uv: [ 1, 1 ], },
    ],
  },
];