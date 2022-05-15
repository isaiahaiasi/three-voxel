import { createRange } from "../utils/basicUtils"

export default function VoxSelectorUI() {
  return (<div id="canvas-ui">
    {[1, 0].map(i => {
      return (<div className="canvas-ui__tiles">
        {[...createRange(1, 9)].map(j => {
          const index = i * j; // 1-16, inclusive
          const backgroundPosition = "-" + (index - 1) * 100 + "% -0%";
          return (
            <>
            <input
              type="radio"
              name="voxel"
              id={"voxel" + index}
              value={index}
            />
            <label
              htmlFor={"voxel" + index}
              style={{backgroundPosition}}
            />
            </>
          )
        })}
      </div>)
    })}
  </div>)
}