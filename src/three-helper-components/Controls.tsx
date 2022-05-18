import { OrbitControls } from '@react-three/drei';

const DEFAULT_MIN_DISTANCE = 1;
const DEFAULT_MAX_DISTANCE = 2000;

interface ControlsProps {
  chunkSize: number;
}

export default function Controls({chunkSize}:ControlsProps) {
  return <OrbitControls
    target={[
      chunkSize / 2,
      chunkSize / 3,
      chunkSize / 2,
    ]}
    minDistance={DEFAULT_MIN_DISTANCE}
    maxDistance={DEFAULT_MAX_DISTANCE}
    enableDamping
  />
}
