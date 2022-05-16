import { useContext } from "react";
import ActiveVoxelContext from "./contexts/ActiveVoxelContext";
import { createRange } from "./utils/basicUtils"

function getVoxelInputElementId(voxelId: number) {
  return "voxel" + voxelId;
}

export default function VoxSelectorUI() {
  const selectedVoxelRef = useContext(ActiveVoxelContext);

  if (!selectedVoxelRef) {
    console.error("could not find context to set UI state for active voxel");
    return <div className="error">ERROR</div>;
  }

  function handleClick(voxelId: number) {
    // this is a little awkward b/c I'm trying to avoid Canvas re-renders
    if (selectedVoxelRef!.current !== voxelId) {
      selectedVoxelRef!.current = voxelId;
    } else {
      selectedVoxelRef!.current = 0;
      const selector = "#" + getVoxelInputElementId(voxelId);
      const radio = document.querySelector(selector) as HTMLInputElement;
      radio.checked = false;
      console.log(radio);
    }
  }

  return (<div id="canvas-ui">
    {[0, 1].map(i => {
      return (<div className="canvas-ui__tiles" key={i}>
        {[...createRange(1, 9)].map(j => {
          const index = i * 8 + j; // 1-16, inclusive
          return <UIVoxelInput
            index={index}
            handleClick={handleClick}
            key={index}
          />
        })}
      </div>)
    })}
  </div>)
}

interface UIVoxelInputProps {
  index: number;
  handleClick: (voxelId: number) => void;
}

function UIVoxelInput({index, handleClick}: UIVoxelInputProps) {
  const backgroundPosition = "-" + (index - 1) * 100 + "% -0%";
  return (
    <>
      <input
        type="radio"
        name="voxel"
        id={getVoxelInputElementId(index)}
        value={index}
        onClick={() => handleClick(index)}
        readOnly
      />
      <label
        htmlFor={"voxel" + index}
        style={{backgroundPosition}}
      />
    </>
  )
}
