// import { OrbitControls } from "@react-three/drei";
import Lights from "./Lights.jsx";
import { BlockAxe, BlockLimbo, BlockSpinner, Level } from "./Level";
import { Physics } from "@react-three/rapier";
import Player from "./Player.js";

export default function Experience() {
  return (
    <>
      {/* <OrbitControls makeDefault /> */}

      <Physics debug={false}>
        <Lights />
        <Level />
        <Player />
      </Physics>
    </>
  );
}
