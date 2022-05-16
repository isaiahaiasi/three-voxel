import VoxelMaterial from "./VoxelMaterial";
import VoxelWorld, { TileDimensions } from "./voxels/VoxelWorld";
import textureAtlas from "./assets/flourish-cc-by-nc-sa.png";

interface VoxelWorldProps {
  chunkSize?: number;
  tileDimensions?: TileDimensions;
}

export default function VoxelWorldRenderer({
  chunkSize = 64,
  tileDimensions = {
    size: 16,
    textureWidth: 256,
    textureHeight: 64,
  },
}: VoxelWorldProps) {
  const world = new VoxelWorld({
    chunkSize,
    tileDimensions
  });
  world.init();

  // return:
  //   get the meshes from world
  //     render the material as a child of each
  return (
    <>
      {world.getMeshes().map(mesh => {
        return (
          <primitive object={mesh} key={mesh.id}>
            <VoxelMaterial textureAtlasPath={textureAtlas}/>
          </primitive>
        )
      })}
    </>
  )
}
