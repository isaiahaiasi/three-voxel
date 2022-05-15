import { useLoader } from "@react-three/fiber";
import * as THREE from 'three';

interface VoxelMaterialProps {
  textureAtlasPath: string;
}

export default function VoxelMaterial({textureAtlasPath}:VoxelMaterialProps) {
  const colorMap = useLoader(THREE.TextureLoader, textureAtlasPath);
  colorMap.magFilter = THREE.NearestFilter;
  colorMap.minFilter = THREE.NearestFilter;

  return <meshLambertMaterial
    map={colorMap}
    side={THREE.DoubleSide}
    alphaTest={0.1}
    transparent
  />
}
