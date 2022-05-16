import { OrbitControls } from '@react-three/drei';

const DEFAULT_MIN_DISTANCE = 1;
const DEFAULT_MAX_DISTANCE = 2000;

export default function Controls() {
  return <OrbitControls
    target={[0, 0, 0]}
    minDistance={DEFAULT_MIN_DISTANCE}
    maxDistance={DEFAULT_MAX_DISTANCE}
    enableDamping
  />
}
