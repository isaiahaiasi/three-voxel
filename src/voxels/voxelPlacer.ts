import * as THREE from "three";
import VoxelWorld from "./VoxelWorld";

interface VoxelPlacerOptions {
  canvas: HTMLCanvasElement;
  camera: THREE.Camera;
  world: VoxelWorld;
  uiState: {
    currentVoxel: number;
  };
}

export default function createVoxelPlacer(options: VoxelPlacerOptions) {
  const movementSensitivity = 5;
  const { canvas, camera, world, uiState } = options;

  const mouse = {
    x: 0,
    y: 0,
    moveX: 0,
    moveY: 0,
  };
  
  function recordStartPosition(e:PointerEvent) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.moveX = 0;
    mouse.moveY = 0;
  }
  
  function recordMovement(e:PointerEvent) {
    mouse.moveX += Math.abs(mouse.x - e.clientX);
    mouse.moveY += Math.abs(mouse.y - e.clientY);
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
    const voxelId = e.shiftKey ? 0 : uiState.currentVoxel;

    console.log("currentVoxel", uiState.currentVoxel);

    const start = new THREE.Vector3();
    const end = new THREE.Vector3();
    start.setFromMatrixPosition(camera.matrixWorld);
    end.set(x, y, 1).unproject(camera);

    const intersection = world.intersectRay(start, end);

    if(intersection) {
      world.placeVoxel(intersection, voxelId);
    }
  }

  function placeVoxelIfNoMovement(e:PointerEvent) {
    if (mouse.moveX < movementSensitivity && mouse.moveY < movementSensitivity) {
      handlePlaceVoxel(e);
    }

    window.removeEventListener('pointermove', recordMovement);
    window.removeEventListener('pointerup', placeVoxelIfNoMovement);
  }

  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    recordStartPosition(e);
    window.addEventListener('pointermove', recordMovement);
    window.addEventListener('pointerup', placeVoxelIfNoMovement);
  }, { passive: false });

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
  }, { passive: false });

}