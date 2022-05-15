import { useRef } from "react";
import ActiveVoxelContext from "./ActiveVoxelContext";
import "./App.css";
import VoxelCanvas from "./VoxelCanvas";
import VoxSelectorUI from "./voxels/VoxSelectorUI";

function App() {
  const selectedVoxelRef = useRef(0);
  return (
    <ActiveVoxelContext.Provider value={selectedVoxelRef}>
    <div className="App">
      <VoxSelectorUI/>
      <VoxelCanvas/>
    </div>
    </ActiveVoxelContext.Provider>
  );
}

export default App;
