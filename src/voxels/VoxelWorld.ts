import * as THREE from "three";
import { Vector3 } from "three";
import { createRange, deepLoop, getOffsetFromPosition, getRangesFromMax, randInt } from "../utils/basicUtils";
import { vec3NeighborOffsets } from "./voxelUtils";

export interface TileDimensions {
  size: number;
  textureHeight: number;
  textureWidth: number;
}

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
  tileDimensions: TileDimensions;
}

interface RayData {
  position: [number, number, number];
  normal: [number, number, number];
  voxel: number;
}

// TODO: major refactor would be to make voxel position relative to Chunk,
// to avoid situations where world size would be prematurely capped by large numbers
export default class VoxelWorld {
  static faces: Face[];

  private chunkSize;
  private tileDimensions;

  // contains data for what voxel is at each point in a chunk
  private chunks: Map<string, Uint8Array>;
  // TODO: Create a Chunk struct that contains both voxel data and mesh?
  private chunkMeshes: Map<string, THREE.Mesh>;

  constructor({
    chunkSize,
    tileDimensions,
  }: VoxelWorldOptions) {
    this.chunkSize = chunkSize;
    this.tileDimensions = {...tileDimensions};
    this.chunks = new Map();
    this.chunkMeshes = new Map();
  }

  // from
  // https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.42.3443&rep=rep1&type=pdf
  public intersectRay(start: Vector3, end: Vector3): RayData | null {
    let dx = end.x - start.x;
    let dy = end.y - start.y;
    let dz = end.z - start.z;
    const lenSq = dx * dx + dy * dy + dz * dz;
    const len = Math.sqrt(lenSq);

    dx /= len;
    dy /= len;
    dz /= len;

    let t = 0.0;
    let ix = Math.floor(start.x);
    let iy = Math.floor(start.y);
    let iz = Math.floor(start.z);

    const stepX = (dx > 0) ? 1 : -1;
    const stepY = (dy > 0) ? 1 : -1;
    const stepZ = (dz > 0) ? 1 : -1;

    const txDelta = Math.abs(1 / dx);
    const tyDelta = Math.abs(1 / dy);
    const tzDelta = Math.abs(1 / dz);

    const xDist = (stepX > 0) ? (ix + 1 - start.x) : (start.x - ix);
    const yDist = (stepY > 0) ? (iy + 1 - start.y) : (start.y - iy);
    const zDist = (stepZ > 0) ? (iz + 1 - start.z) : (start.z - iz);

    // location of nearest voxel boundary, in units of t
    let txMax = (txDelta < Infinity) ? txDelta * xDist : Infinity;
    let tyMax = (tyDelta < Infinity) ? tyDelta * yDist : Infinity;
    let tzMax = (tzDelta < Infinity) ? tzDelta * zDist : Infinity;

    let steppedIndex = -1;

    // main loop along raycast vector
    while (t <= len) {
      const voxel = this.getVoxel(ix, iy, iz);
      if (voxel) {
        return {
          position: [
            start.x + t * dx,
            start.y + t * dy,
            start.z + t * dz,
          ],
          normal: [
            steppedIndex === 0 ? -stepX : 0,
            steppedIndex === 1 ? -stepY : 0,
            steppedIndex === 2 ? -stepZ : 0,
          ],
          voxel,
        };
      }

      // advance t to next nearest voxel boundary
      if (txMax < tyMax) {
        if (txMax < tzMax) {
          ix += stepX;
          t = txMax;
          txMax += txDelta;
          steppedIndex = 0;
        } else {
          iz += stepZ;
          t = tzMax;
          tzMax += tzDelta;
          steppedIndex = 2;
        }
      } else {
        if (tyMax < tzMax) {
          iy += stepY;
          t = tyMax;
          tyMax += tyDelta;
          steppedIndex = 1;
        } else {
          iz += stepZ;
          t = tzMax;
          tzMax += tzDelta;
          steppedIndex = 2;
        }
      }
    }
    return null;
  }

  public placeVoxel(intersection:RayData, voxelId:number) {
    // intersection point is on a face, but could be on either side
    // so go half a normal into voxel if removing (currentVoxel = 0)
    // or out of the voxel if adding
    const pos = intersection.position.map((v, ndx) => {
      return v + intersection.normal[ndx] * (voxelId > 0 ? 0.5 : -0.5);
    }) as [number, number, number];

    this.setVoxel(...pos, voxelId);
    this.updateVoxelGeometry(...pos);
    // this.requestRender();
  }

  public init() {
    const firstChunkIndices:THREE.Vector3Tuple = [0, 0, 0];
    this.generateDefaultWorldData();
    this.updateChunkGeometry(...firstChunkIndices);
  }

  public getMeshes() {
    return [...this.chunkMeshes.values()];
  }

  private generateDefaultWorldData() {
    const { chunkSize } = this;
    deepLoop(
      getRangesFromMax(...[chunkSize, chunkSize, chunkSize]),
      (y, z, x) => {
        const height = (Math.sin(x / chunkSize * Math.PI * 2) + Math.sin(z / chunkSize * Math.PI * 3)) * (chunkSize / 6) + (chunkSize / 2);
        if (y < height) {
          const voxelId = randInt(0, 17);
          // const voxelId = 4;
          this.setVoxel(x, y, z, voxelId);
        }
    });
  }

  // gets chunk x, y, z indices from Voxel position
  private getChunkIndices(x: number, y: number, z: number):THREE.Vector3Tuple {
    const { chunkSize } = this;
    return [
      Math.floor(x / chunkSize),
      Math.floor(y / chunkSize),
      Math.floor(z / chunkSize),
    ];
  }

  // gets chunkId from VOXEL position
  private getChunkId(x: number, y: number, z: number) {
    const [chunkX, chunkY, chunkZ] = this.getChunkIndices(x, y, z);
    return `${chunkX},${chunkY},${chunkZ}`;
  }

  private getChunkByVoxelPosition(x: number, y: number, z: number) {
    return this.chunks.get(this.getChunkId(x, y, z));
  }

  private getVoxelOffset(x: number, y: number, z: number) {
    const { chunkSize } = this;
    const voxelX = THREE.MathUtils.euclideanModulo(x, chunkSize) | 0;
    const voxelY = THREE.MathUtils.euclideanModulo(y, chunkSize) | 0;
    const voxelZ = THREE.MathUtils.euclideanModulo(z, chunkSize) | 0;
    return getOffsetFromPosition(voxelX, voxelY, voxelZ, chunkSize);
  }

  private getVoxel(x: number, y: number, z: number) {
    const chunk = this.getChunkByVoxelPosition(x, y, z);

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

  private setVoxel(x: number, y: number, z: number, v: number) {
    let chunk = this.getChunkByVoxelPosition(x, y, z);

    if (chunk === undefined) {
      chunk = this.addChunkForVoxel(x, y, z);
    }

    const voxelOffset = this.getVoxelOffset(x, y, z);

    chunk[voxelOffset] = v;
  }

  private addChunkForVoxel(x: number, y: number, z: number) {
    const chunkId = this.getChunkId(x, y, z);
    let chunk = this.chunks.get(chunkId);
    
    if (!chunk) {
      const { chunkSize } = this;
      chunk = new Uint8Array(chunkSize * chunkSize * chunkSize);
      this.chunks.set(chunkId, chunk);
    }

    return chunk;
  }

  private generateGeometryDataForChunk(x: number, y: number, z: number) {
    const { chunkSize, tileDimensions } = this;
    const {
      size: tileSize,
      textureHeight: tileTextureHeight,
      textureWidth: tileTextureWidth 
    } = tileDimensions;

    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const [startX, startY, startZ] = [x, y, z].map(axis => axis * chunkSize);

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

  private updateVoxelGeometry(x: number, y: number, z: number) {
    const updatedChunkIds: any = {}; // not sure where this should be...
    Object.values(vec3NeighborOffsets).map(([xoff, yoff, zoff]) => {
      const xsum = x + xoff;
      const ysum = y + yoff;
      const zsum = z + zoff;
      const chunkId = this.getChunkId(xsum, ysum, zsum);
      if (!updatedChunkIds[chunkId]) {
        updatedChunkIds[chunkId] = true;
        this.updateChunkGeometry(xsum, ysum, zsum);
      }
    });
  }

  private updateChunkGeometry(x:number, y:number, z:number) {
    const chunkId = this.getChunkId(x, y, z);
    const chunkVector = new THREE.Vector3(...this.getChunkIndices(x, y, z));
    let mesh = this.chunkMeshes.get(chunkId);

    const geometry = mesh ? mesh.geometry : new THREE.BufferGeometry();

    const {
      positions,
      normals,
      uvs,
      indices
    } = this.generateGeometryDataForChunk(...this.getChunkIndices(x, y, z));

    const posNumComponents = 3;
    const normalNumComponents = 3;
    const uvNumComponents = 2;

    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(positions), posNumComponents),
    );

    geometry.setAttribute(
      'normal',
      new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents),
    );

    geometry.setAttribute(
      'uv',
      new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents),
    );

    geometry.setIndex(indices);
    geometry.computeBoundingSphere();

    if (!mesh) {
      mesh = new THREE.Mesh(geometry);
      mesh.name = chunkId;

      // get world space position of chunk mesh (chunk indices * chunkSize)
      const meshPosition = chunkVector.multiplyScalar(this.chunkSize).toArray();
      mesh.position.set(...meshPosition);

      this.chunkMeshes.set(chunkId, mesh);
    }

    console.log("chunk mesh updated");
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