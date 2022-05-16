import { Canvas } from "@react-three/fiber";
import Lighting from "./three-helper-components/Lighting";
import Controls from "./three-helper-components/Controls";
import * as THREE from 'three';
import VoxelWorldRenderer from "./VoxelWorldRenderer";
import { useContext } from "react";
import ActiveVoxelContext from "./contexts/ActiveVoxelContext";

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