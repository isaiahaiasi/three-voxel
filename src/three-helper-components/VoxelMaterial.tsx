import { useLoader } from "@react-three/fiber";
import * as THREE from 'three';

interface VoxelMaterialProps {
  textureAtlasPath: string;
}

// This is probably super inefficient, but it's easy.
// In the future, I might make a dict of created textures in global state
// And then pull from that if the given path has already been provided
export default function VoxelMaterial({textureAtlasPath}:VoxelMaterialProps) {
  const colorMap = useLoader(THREE.TextureLoader, textureAtlasPath);
  colorMap.magFilter = THREE.NearestFilter;
  // colorMap.minFilter = THREE.NearestFilter;

  return <meshLambertMaterial
    map={colorMap}
    side={THREE.DoubleSide}
    alphaTest={0.1}
    transparent
  />
}
