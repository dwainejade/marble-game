import { useKeyboardControls } from "@react-three/drei";
import useGame from "./stores/useGame";
import { useRef } from "react";
import { useEffect } from "react";
import { addEffect } from "@react-three/fiber";

export default function Interface() {
  const { phase, restart } = useGame();
  const time = useRef();

  const { forward, backward, leftward, rightward, jump } =
    useKeyboardControls();

  useEffect(() => {
    const unsubscribeEffect = addEffect(() => {
      const { phase, startTime, endTime } = useGame.getState();
      let elapsedTime = 0;
      if (phase === "playing") {
        elapsedTime = Date.now() - startTime;
      } else if (phase === "ended") {
        elapsedTime = endTime - startTime;
      }
      elapsedTime /= 1000;
      elapsedTime = elapsedTime.toFixed(2);

      if (time.current) {
        time.current.textContent = elapsedTime;
      }
    });

    return () => unsubscribeEffect();
  }, []);

  return (
    <div className={`interface ${phase === "ended" ? "" : ""}`}>
      {/* time */}
      <div className="time" ref={time}>
        {time.current?.textContent}
      </div>
      {phase === "ended" && (
        <div className="restart zoom-out" onClick={restart}>
          Restart
        </div>
      )}
      {/* {phase === "ready" && <div className="instructions">Ready</div>} */}

      {/* Controls */}
      <div className="controls">
        <div className="raw">
          <div className={`key ${forward ? "active" : ""}`}></div>
        </div>
        <div className="raw">
          <div className={`key ${leftward ? "active" : ""}`}></div>
          <div className={`key ${backward ? "active" : ""}`}></div>
          <div className={`key ${rightward ? "active" : ""}`}></div>
        </div>
        <div className="raw">
          <div className={`key large ${jump ? "active" : ""}`}></div>
        </div>
      </div>
    </div>
  );
}
