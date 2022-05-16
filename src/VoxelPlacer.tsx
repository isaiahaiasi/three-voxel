import { useThree } from "@react-three/fiber";
import { useContext, useEffect, useRef } from "react";
import { Vector3 } from "three";
import ActiveVoxelContext from "./ActiveVoxelContext";
import VoxelWorld from "./voxels/VoxelWorld";

interface VoxelPlacerProps {
  world: VoxelWorld;
  movementSensitivity?: number;
}

export default function VoxelPlacer({world, movementSensitivity=5}:VoxelPlacerProps) {
  const selectedVoxelRef = useContext(ActiveVoxelContext);

  if (!selectedVoxelRef) {
    console.error("could not find context to set UI state for selected voxel type");
    return null;
  }

  const { camera, gl: { domElement: canvas } } = useThree();

  const mouseRef = useRef({
    x: 0, y: 0, moveX: 0, moveY: 0,
  });

  function recordStartPosition(e:PointerEvent) {
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;
    mouseRef.current.moveX = 0;
    mouseRef.current.moveY = 0;
  }
  
  function recordMovement(e:PointerEvent) {
    mouseRef.current.moveX += Math.abs(mouseRef.current.x - e.clientX);
    mouseRef.current.moveY += Math.abs(mouseRef.current.y - e.clientY);
  }

  function getCanvasRelativePosition(e: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * canvas.width / rect.width,
      y: (e.clientY - rect.top) * canvas.height / rect.height,
    }
  }

  function handlePlaceVoxel(e: PointerEvent) {
    const pos = getCanvasRelativePosition(e);
    const x = (pos.x / canvas.width) * 2 - 1;
    const y = (pos.y / canvas.height) * -2 + 1; // y is flipped
    const voxelId = e.shiftKey ? 0 : selectedVoxelRef!.current;

    const start = new Vector3();
    const end = new Vector3();
    start.setFromMatrixPosition(camera.matrixWorld);
    end.set(x, y, 1).unproject(camera);

    const intersection = world.intersectRay(start, end);

    if(intersection) {
      world.placeVoxel(intersection, voxelId);
    }
  }

  function placeVoxelIfNoMovement(e:PointerEvent) {
    if (mouseRef.current.moveX < movementSensitivity
      && mouseRef.current.moveY < movementSensitivity) {
      handlePlaceVoxel(e);
    }

    window.removeEventListener('pointermove', recordMovement);
    window.removeEventListener('pointerup', placeVoxelIfNoMovement);
  }

  function handleCanvasPointerDown(e: PointerEvent) {
    e.preventDefault();
    recordStartPosition(e);
    window.addEventListener('pointermove', recordMovement);
    window.addEventListener('pointerup', placeVoxelIfNoMovement);
  }

  useEffect(() => {
    canvas.removeEventListener('pointerdown', handleCanvasPointerDown);
    canvas.addEventListener('pointerdown', handleCanvasPointerDown, { passive: false });
  
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
    }, { passive: false });
  }, []);

  return null;
}