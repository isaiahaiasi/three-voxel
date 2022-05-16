import { Canvas } from "@react-three/fiber";
import Lighting from "./Lighting";
import Controls from "./Controls";
import * as THREE from 'three';
import VoxelWorldRenderer from "./VoxelWorldRenderer";
import { useContext } from "react";
import ActiveVoxelContext from "./ActiveVoxelContext";

export default function VoxelCanvas() {
  const selectedVoxelRef = useContext(ActiveVoxelContext);

  if (!selectedVoxelRef) {
    console.error("could not find context to set UI state for selected voxel type");
    return null;
  }

  return <Canvas id="c">
    <color attach="background" args={["black"]}/>
    <Controls/>
    <Lighting/>

    <primitive object={new THREE.AxesHelper(10)}/>

    <VoxelWorldRenderer selectedVoxelRef={selectedVoxelRef}/>
  </Canvas>
}