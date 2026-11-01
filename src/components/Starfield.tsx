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

export default function Starfield() {
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
      {stars}
    </div>
  );
}
