import { useEffect, useRef } from "react";
import { animateMountainMist } from "../lib/mountainMist";

const STAR_POSITIONS = [
  [88, 30],
  [78, 40],
  [60, 54],
  [38, 66],
  [20, 73],
  [11, 72],
  [15, 65],
  [30, 53],
  [52, 40],
  [72, 30],
  [86, 26],
  [4, 18],
  [96, 86],
] as const;

interface StarfieldProps {
  home: boolean;
}

export default function Starfield({ home }: StarfieldProps) {
  const skyRef = useRef<HTMLDivElement>(null);
  const backgroundMistRef = useRef<HTMLCanvasElement>(null);
  const foregroundMistRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const sky = skyRef.current;
    const backgroundMist = backgroundMistRef.current;
    const foregroundMist = foregroundMistRef.current;
    if (!home || !sky || !backgroundMist || !foregroundMist) return;

    return animateMountainMist(sky, [backgroundMist, foregroundMist]);
  }, [home]);

  const stars = STAR_POSITIONS.map(([x, y], index) => {
    const size = [2, 5, 8, 10].includes(index) ? 5 : 2;

    return (
      <span
        key={index}
        className={`starfield-star ${
          index % 3 === 0 ? "starfield-star-fade" : "starfield-star-pulse"
        }`}
        style={{
          left: `${x}%`,
          top: `${y}%`,
          width: `${size}px`,
          height: `${size}px`,
          animationDuration: `${2.4 + (index % 6) * 0.55}s`,
          animationDelay: `${-((index * 17) % 65) / 10}s`,
        }}
      />
    );
  });

  return (
    <div className="starfield" aria-hidden="true">
      <div className="light-sky" ref={skyRef}>
        {home && (
          <>
            <canvas
              ref={backgroundMistRef}
              className="mist-canvas mist-canvas-background"
            />
            <canvas
              ref={foregroundMistRef}
              className="mist-canvas mist-canvas-foreground"
            />
          </>
        )}
      </div>
      {stars}
    </div>
  );
}
