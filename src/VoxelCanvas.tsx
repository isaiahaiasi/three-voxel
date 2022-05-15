import { Canvas } from "@react-three/fiber";
import Lighting from "./Lighting";
import textureAtlas from "./assets/flourish-cc-by-nc-sa.png";
import VoxelMaterial from "./VoxelMaterial";
import Controls from "./Controls";
import * as THREE from 'three';

export default function VoxelCanvas() {
  return <Canvas id="c">
    <Controls/>
    <Lighting/>

    <primitive object={new THREE.AxesHelper(10)}/>

    <mesh>
      <sphereBufferGeometry />
      <VoxelMaterial textureAtlasPath={textureAtlas}/>
    </mesh>
  </Canvas>
}