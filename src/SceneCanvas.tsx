import { useEffect, useRef } from "react";
import main from "./voxels/voxel";

export default function SceneCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mountRef.current) {
      const renderer = main(mountRef);

      return () => {
        if (mountRef.current && renderer)
          mountRef.current?.removeChild(renderer.domElement);
      };
    }
  }, []);

  return <div ref={mountRef} />;
}
