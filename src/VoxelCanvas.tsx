import { Canvas } from "@react-three/fiber";
import Lighting from "./three-helper-components/Lighting";
import Controls from "./three-helper-components/Controls";
import * as THREE from 'three';
import VoxelWorldRenderer from "./VoxelWorldRenderer";
import { useContext } from "react";
import ActiveVoxelContext from "./contexts/ActiveVoxelContext";
import { Stats } from "@react-three/drei";
import { Vector3 } from "three";

const CHUNK_SIZE = 32;

const cameraDefaults = {
  fov: 75,
  near: 0.1,
  far: 1000,
  position: new Vector3(
    CHUNK_SIZE,
    CHUNK_SIZE,
    CHUNK_SIZE,
  ),
};

export default function VoxelCanvas() {
  const selectedVoxelRef = useContext(ActiveVoxelContext);

  if (!selectedVoxelRef) {
    console.error("could not find context to set UI state for selected voxel type");
    return null;
  }

  return <Canvas id="c" camera={cameraDefaults}>
    <color attach="background" args={["black"]}/>
    <fog attach="fog" color={0x101040} near={1} far={125}/>

    <Controls chunkSize={CHUNK_SIZE}/>
    <Lighting/>

    <primitive object={new THREE.AxesHelper(10)}/>

    <VoxelWorldRenderer
      selectedVoxelRef={selectedVoxelRef}
      chunkSize={CHUNK_SIZE}
    />

    <Stats/>
  </Canvas>
}