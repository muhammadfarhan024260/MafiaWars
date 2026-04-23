'use client';

import { useState, useEffect } from 'react';

export default function StarField() {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    setStars(
      Array.from({ length: 100 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() < 0.6 ? 1 : Math.random() < 0.9 ? 1.5 : 2.5,
        opacity: 0.15 + Math.random() * 0.65,
        dur: `${2 + Math.random() * 4}s`,
        delay: `${Math.random() * 6}s`,
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            animation: `twinkle ${s.dur} ease-in-out ${s.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}
