import { useEffect, useRef } from "react";
import main from "./voxels/voxel";

export default function SceneCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);
  


  useEffect(() => {
    if (!mountRef.current) {
      return;
    }

    mountRef.current.id = "canvas-grp-mountref-target";

    const mountGroup = main(mountRef);

    if (!mountGroup) {
      return;
    }

    mountGroup.id = "canvas-grp"
    mountGroup.querySelector("canvas")?.setAttribute("id", "c");

    return () => {
      if (mountRef.current && mountGroup)
        mountRef.current?.removeChild(mountGroup);
    };
  }, []);

  return <div ref={mountRef}/>;
}
