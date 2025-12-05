'use client';

import { useEffect, useState } from 'react';
import type { Coordinate, ImageDimensions } from './types';

interface CoordinateMarkerProps {
  coord: Coordinate;
  imageDimensions: ImageDimensions;
}

/**
 * CoordinateMarker - Visual indicator for selected tap position
 * Features:
 * - Small, precise circular marker with center dot
 * - Pulsing ring animation for visibility
 * - High contrast colors for any background
 * - Does not obscure selected area
 */
export const CoordinateMarker: React.FC<CoordinateMarkerProps> = ({
  coord,
  imageDimensions,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Animate in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Calculate display position from canonical coordinates
  const displayX =
    imageDimensions.offset.x +
    (coord.x / imageDimensions.natural.width) * imageDimensions.rendered.width;
  const displayY =
    imageDimensions.offset.y +
    (coord.y / imageDimensions.natural.height) * imageDimensions.rendered.height;

  return (
    <div
      className={`
        absolute pointer-events-none z-20
        transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
      `}
      style={{
        left: `${displayX}px`,
        top: `${displayY}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Outer pulsing ring */}
      <div
        className="
          absolute inset-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2
          left-1/2 top-1/2
          rounded-full border-2 border-red-500/60
          animate-ping
        "
        style={{ animationDuration: '1.5s' }}
      />

      {/* Secondary ring */}
      <div
        className="
          absolute inset-0 w-10 h-10 -translate-x-1/2 -translate-y-1/2
          left-1/2 top-1/2
          rounded-full border border-red-400/40
          animate-pulse
        "
      />

      {/* Main marker circle */}
      <div
        className="
          relative w-8 h-8
          rounded-full
          bg-red-500/20 backdrop-blur-sm
          border-2 border-red-500
          shadow-lg shadow-red-500/50
          flex items-center justify-center
        "
      >
        {/* Center dot - precise selection point */}
        <div
          className="
            w-2 h-2 rounded-full
            bg-white
            shadow-sm shadow-red-500/80
          "
        />

        {/* Crosshair lines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Horizontal line */}
          <div className="absolute w-full h-px bg-red-400/60" />
          {/* Vertical line */}
          <div className="absolute w-px h-full bg-red-400/60" />
        </div>
      </div>

      {/* Glow effect */}
      <div
        className="
          absolute inset-0 w-8 h-8
          rounded-full
          bg-red-500/30 blur-md
          -z-10
        "
      />
    </div>
  );
};

export default CoordinateMarker;
