export default function Crewmate({ color = '#555', size = 80, className = '', style = {} }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 1.3)}
      viewBox="0 0 100 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {/* Body */}
      <path
        d="M22 62 C22 44 34 34 50 34 C66 34 78 44 78 62 L78 96 C78 107 70 114 60 114 L40 114 C30 114 22 107 22 96 Z"
        fill={color}
      />
      {/* Head / helmet */}
      <ellipse cx="50" cy="30" rx="27" ry="28" fill={color} />
      {/* Visor */}
      <path
        d="M30 15 Q50 7 70 15 Q70 35 50 39 Q30 35 30 15 Z"
        fill="#7FDBFF"
        fillOpacity="0.6"
      />
      {/* Visor shine */}
      <path
        d="M36 13 Q44 9 55 12"
        stroke="white"
        strokeWidth="2"
        strokeOpacity="0.45"
        strokeLinecap="round"
      />
      {/* Backpack */}
      <rect x="76" y="54" width="16" height="26" rx="7" fill={color} />
      {/* Legs */}
      <rect x="26" y="106" width="19" height="18" rx="7" fill={color} />
      <rect x="55" y="106" width="19" height="18" rx="7" fill={color} />
    </svg>
  );
}
