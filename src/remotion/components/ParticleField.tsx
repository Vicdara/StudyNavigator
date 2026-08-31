import React, { useMemo } from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { Particle } from '../types';

interface ParticleFieldProps {
  count?: number;
  speedMultiplier?: number;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({
  count = 45,
  speedMultiplier = 1,
}) => {
  const frame = useCurrentFrame();

  // Deterministic particle generation
  const particles: Particle[] = useMemo(() => {
    const list: Particle[] = [];
    const colors = [
      'rgba(99, 102, 241, 0.6)',
      'rgba(56, 189, 248, 0.6)',
      'rgba(168, 85, 247, 0.6)',
      'rgba(255, 255, 255, 0.5)',
    ];

    for (let i = 0; i < count; i++) {
      // Deterministic pseudorandom generator based on index
      const pseudoRand1 = ((i * 9301 + 49297) % 233280) / 233280;
      const pseudoRand2 = (((i + 1) * 9301 + 49297) % 233280) / 233280;
      const pseudoRand3 = (((i + 2) * 9301 + 49297) % 233280) / 233280;
      const pseudoRand4 = (((i + 3) * 9301 + 49297) % 233280) / 233280;

      list.push({
        x: pseudoRand1 * 1920,
        y: pseudoRand2 * 1080,
        size: 1.5 + pseudoRand3 * 3,
        speed: (0.3 + pseudoRand4 * 0.8) * speedMultiplier,
        opacity: 0.15 + pseudoRand1 * 0.45,
        color: colors[i % colors.length],
      });
    }
    return list;
  }, [count, speedMultiplier]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {particles.map((p, idx) => {
        // Floating upwards with slight sinusoidal wobble
        const currentY = (p.y - frame * p.speed * 1.2) % 1080;
        const normalizedY = currentY < 0 ? currentY + 1080 : currentY;
        const currentX = p.x + Math.sin((frame + idx * 20) / 40) * 15;
        const pulse = interpolate(Math.sin((frame + idx * 10) / 25), [-1, 1], [0.5, 1]);

        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: `${currentX}px`,
              top: `${normalizedY}px`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: '50%',
              backgroundColor: p.color || 'white',
              opacity: p.opacity * pulse,
              boxShadow: `0 0 ${p.size * 3}px ${p.color || 'white'}`,
            }}
          />
        );
      })}
    </div>
  );
};
