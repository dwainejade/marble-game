import { Physics } from "@react-three/rapier";
import useGame from "./stores/useGame";
import Lights from "./Lights";
import { Level } from "./Level";
import Player from "./Player";

export default function Experience() {
  const blocksCount = useGame((state) => state.blocksCount);
  const blocksSeed = useGame((state) => state.blocksSeed);

  return (
    <>
      <color args={["#bdedfc"]} attach="background" />

      <Physics debug={false}>
        <Lights />
        <Level count={blocksCount} seed={blocksSeed} />
        <Player />
      </Physics>
    </>
  );
}
