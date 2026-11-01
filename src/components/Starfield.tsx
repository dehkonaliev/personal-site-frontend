const STAR_POSITIONS = [
  [8, 14],
  [21, 8],
  [38, 18],
  [56, 9],
  [73, 16],
  [91, 11],
  [14, 33],
  [31, 42],
  [48, 31],
  [67, 39],
  [84, 29],
  [5, 58],
  [24, 67],
  [43, 55],
  [61, 70],
  [78, 59],
  [95, 73],
  [12, 88],
  [52, 91],
  [88, 92],
] as const;

export default function Starfield() {
  const stars = STAR_POSITIONS.map(([x, y], index) => {
    const size = index % 7 === 0 ? 4 : 2;

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
