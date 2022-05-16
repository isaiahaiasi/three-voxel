import { Canvas } from "@react-three/fiber";
import Lighting from "./Lighting";
import Controls from "./Controls";
import * as THREE from 'three';
import VoxelWorldRenderer from "./VoxelWorldRenderer";

export default function VoxelCanvas() {
  return <Canvas id="c">
    <color attach="background" args={["black"]}/>
    <Controls/>
    <Lighting/>

    <primitive object={new THREE.AxesHelper(10)}/>

    <VoxelWorldRenderer/>
  </Canvas>
}