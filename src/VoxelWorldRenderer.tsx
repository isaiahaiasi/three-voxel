import VoxelMaterial from "./VoxelMaterial";
import VoxelWorld, { TileDimensions } from "./voxels/VoxelWorld";
import textureAtlas from "./assets/flourish-cc-by-nc-sa.png";
import VoxelPlacer from "./VoxelPlacer";
import ActiveVoxelContext from "./ActiveVoxelContext";
import { useEffect, useState } from "react";
import { Mesh } from "three";

interface VoxelWorldProps {
  chunkSize?: number;
  tileDimensions?: TileDimensions;
  selectedVoxelRef: React.MutableRefObject<number> | null;
}

export default function VoxelWorldRenderer({
  chunkSize = 32,
  tileDimensions = {
    size: 16,
    textureWidth: 256,
    textureHeight: 64,
  },
  selectedVoxelRef,
}: VoxelWorldProps) {

  const [world] = useState(new VoxelWorld({ chunkSize, tileDimensions}));
  const [meshes, setMeshes] = useState<Mesh[]>(world.getMeshes());

  useEffect(() => {
    world.onMeshUpdate(() => {
      setMeshes(world.getMeshes());
    });
    world.init();
  }, []);

  // return:
  //   get the meshes from world
  //     render the material as a child of each
  return (
      <ActiveVoxelContext.Provider value={selectedVoxelRef}>
      <VoxelPlacer world={world}/>
      {meshes.map(mesh => {
        return (
          <primitive object={mesh} key={mesh.id}>
            <VoxelMaterial textureAtlasPath={textureAtlas}/>
          </primitive>
        )
      })}
      </ActiveVoxelContext.Provider>
  )
}
