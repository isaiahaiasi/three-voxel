interface TileDimensions {
  size: number;
  textureHeight: number;
  textureWidth: number;
}

interface VoxelWorldProps {
  chunkSize: number;
  tileDimensions: TileDimensions;
  material: THREE.Material;
}

export default function VoxelWorld({
  chunkSize = 32,
  tileDimensions = {
    size: 16,
    textureHeight: 256,
    textureWidth: 64,
  },
  material
}: VoxelWorldProps) {
  // create a world
  // create a voxelPlacer (ugh)
  // return:
  //   get the meshes from world
  //     render the material as a child of each
}
