import React from 'react';
import './FloatingLines.css';

export default function FloatingLines({
  enabledWaves = ['top', 'middle', 'bottom'],
  lineCount = [6],
  lineDistance = [5],
  interactive = true,
  parallax = true,
  animationSpeed = 1,
  linesGradient = undefined,
}) {
  const counts = Array.isArray(lineCount) ? lineCount : [lineCount];
  const distances = Array.isArray(lineDistance) ? lineDistance : [lineDistance];
  const colors = linesGradient || ['#ff6b00', '#ff8c00', '#45b7d1'];

  const waves = [];
  
  if (enabledWaves.includes('top')) {
    waves.push({
      name: 'top',
      position: 'top-20',
      lineCount: counts[0] || 6,
      lineDistance: distances[0] || 5,
      color: colors[0] || '#ff6b00',
      delay: '0s'
    });
  }
  if (enabledWaves.includes('middle')) {
    waves.push({
      name: 'middle',
      position: 'top-1/2',
      lineCount: counts[1] || 6,
      lineDistance: distances[1] || 5,
      color: colors[1] || '#ff8c00',
      delay: '0.5s'
    });
  }
  if (enabledWaves.includes('bottom')) {
    waves.push({
      name: 'bottom',
      position: 'bottom-20',
      lineCount: counts[2] || 6,
      lineDistance: distances[2] || 5,
      color: colors[2] || '#45b7d1',
      delay: '1s'
    });
  }

  return (
    <div className="floating-lines-container" data-interactive={interactive} data-parallax={parallax}>
      {waves.map((wave) => (
        <div key={wave.name} className={`wave ${wave.position}`}>
          {Array.from({ length: wave.lineCount }).map((_, i) => (
            <svg
              key={i}
              className="floating-line"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              style={{
                '--wave-delay': wave.delay,
                '--line-delay': `${i * 0.1}s`,
                '--animation-speed': `${12 / animationSpeed}s`,
                top: `${i * wave.lineDistance}px`,
                filter: `drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))`
              }}
            >
              <defs>
                <linearGradient id={`grad-${wave.name}-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={wave.color} stopOpacity="0.3" />
                  <stop offset="50%" stopColor={wave.color} stopOpacity="0.8" />
                  <stop offset="100%" stopColor={wave.color} stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <path
                d="M 0,60 Q 300,10 600,60 T 1200,60"
                stroke={`url(#grad-${wave.name}-${i})`}
                strokeWidth="2"
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          ))}
        </div>
      ))}
    </div>
  );
}
