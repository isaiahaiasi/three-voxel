import { useEffect, useRef } from "react";
import main from "./voxels/voxel";

export default function SceneCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) {
      return;
    }

    const renderer = main(mountRef);

    if (!renderer) {
      return;
    }

    renderer.domElement.id = "c";

    return () => {
      if (mountRef.current && renderer)
        mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef}/>;
}
