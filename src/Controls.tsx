import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { OrbitControls } from 'three-stdlib';

const DEFAULT_MIN_DISTANCE = 1;
const DEFAULT_MAX_DISTANCE = 20;

export default function Controls() {
  const { camera, gl } = useThree();
  useEffect(
    () => {
      const controls = new OrbitControls(camera, gl.domElement);
      controls.target.set(0, 0, 0);
      controls.enableDamping = true;
      controls.minDistance = DEFAULT_MIN_DISTANCE;
      controls.maxDistance = DEFAULT_MAX_DISTANCE;

      return () => {
        controls.dispose();
      }
    },
    [camera, gl]
  );
  return null;
}
