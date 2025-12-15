'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Target } from 'lucide-react';
import { GameStatus, type Coordinate, type ImageDimensions } from './types';

interface GameImageCanvasProps {
  imageUrl: string;
  coord: Coordinate | null;
  onCoordSelect: (coord: Coordinate) => void;
  isDisabled: boolean;
  gameStatus: GameStatus | null;
}

// Magnifier size and zoom level
const MAGNIFIER_SIZE = 120;
const ZOOM_LEVEL = 2.5;

/**
 * GameImageCanvas - Touch-optimized image display with coordinate selection
 * Features:
 * - Full-width image with maintained aspect ratio
 * - Single tap OR drag to select/adjust coordinates
 * - Zoom magnifier while dragging for precise selection
 * - Handles responsive scaling and letterboxing
 * - Visual marker at selected position (when not dragging)
 * - Disabled state overlay when game inactive
 */
export const GameImageCanvas: React.FC<GameImageCanvasProps> = ({
  imageUrl,
  coord,
  onCoordSelect,
  isDisabled,
  gameStatus,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showTapHint, setShowTapHint] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null);

  // Hide tap hint after first selection
  useEffect(() => {
    if (coord) {
      setShowTapHint(false);
    }
  }, [coord]);

  // Calculate image dimensions on load and resize
  const calculateDimensions = useCallback(() => {
    if (!imgRef.current || !containerRef.current) return;

    const img = imgRef.current;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    const imageAspect = naturalWidth / naturalHeight;
    const containerAspect = containerWidth / containerHeight;

    let renderWidth: number;
    let renderHeight: number;
    let offsetX: number;
    let offsetY: number;

    if (imageAspect > containerAspect) {
      renderWidth = containerWidth;
      renderHeight = containerWidth / imageAspect;
      offsetX = 0;
      offsetY = (containerHeight - renderHeight) / 2;
    } else {
      renderHeight = containerHeight;
      renderWidth = containerHeight * imageAspect;
      offsetX = (containerWidth - renderWidth) / 2;
      offsetY = 0;
    }

    setImageDimensions({
      natural: { width: naturalWidth, height: naturalHeight },
      rendered: { width: renderWidth, height: renderHeight },
      offset: { x: offsetX, y: offsetY },
      scale: {
        x: naturalWidth / renderWidth,
        y: naturalHeight / renderHeight,
      },
    });
  }, []);

  // Handle image load
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    calculateDimensions();
  }, [calculateDimensions]);

  // Recalculate on resize
  useEffect(() => {
    if (!imageLoaded) return;

    const handleResize = () => calculateDimensions();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imageLoaded, calculateDimensions]);

  // Convert screen coordinates to canonical image coordinates
  const screenToCanonical = useCallback(
    (clientX: number, clientY: number, allowClamp: boolean = false): Coordinate | null => {
      if (!imageDimensions || !containerRef.current) return null;

      const containerRect = containerRef.current.getBoundingClientRect();
      const x = clientX - containerRect.left;
      const y = clientY - containerRect.top;

      const { offset, rendered, scale, natural } = imageDimensions;

      // Check if position is within actual image area (not letterbox)
      const isOutside = 
        x < offset.x ||
        x > offset.x + rendered.width ||
        y < offset.y ||
        y > offset.y + rendered.height;

      if (isOutside && !allowClamp) {
        return null;
      }

      // Clamp position to image bounds
      const clampedX = Math.max(offset.x, Math.min(x, offset.x + rendered.width));
      const clampedY = Math.max(offset.y, Math.min(y, offset.y + rendered.height));

      // Convert to image-relative coordinates
      const imageX = clampedX - offset.x;
      const imageY = clampedY - offset.y;

      // Convert to canonical (natural) coordinates
      const canonicalX = Math.round(imageX * scale.x);
      const canonicalY = Math.round(imageY * scale.y);

      // Clamp to valid range
      const finalX = Math.max(0, Math.min(canonicalX, natural.width - 1));
      const finalY = Math.max(0, Math.min(canonicalY, natural.height - 1));

      return { x: finalX, y: finalY };
    },
    [imageDimensions]
  );

  // Handle touch/mouse start
  const handlePointerDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      if (isDisabled || !imageDimensions) return;

      let clientX: number;
      let clientY: number;

      if ('touches' in e) {
        if (e.touches.length === 0) return;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        e.preventDefault();
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const newCoord = screenToCanonical(clientX, clientY);
      if (newCoord) {
        setIsDragging(true);
        // Store position relative to container for magnifier
        const containerRect = containerRef.current!.getBoundingClientRect();
        setTouchPosition({
          x: clientX - containerRect.left,
          y: clientY - containerRect.top,
        });
        onCoordSelect(newCoord);
      }
    },
    [isDisabled, imageDimensions, screenToCanonical, onCoordSelect]
  );

  // Handle touch/mouse move (drag)
  const handlePointerMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      if (!isDragging || isDisabled || !imageDimensions) return;

      let clientX: number;
      let clientY: number;

      if ('touches' in e) {
        if (e.touches.length === 0) return;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        e.preventDefault();
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      // Update touch position for magnifier (clamped to container)
      const containerRect = containerRef.current!.getBoundingClientRect();
      const { offset, rendered } = imageDimensions;
      
      // Clamp touch position to image bounds for visual feedback
      const rawX = clientX - containerRect.left;
      const rawY = clientY - containerRect.top;
      const clampedTouchX = Math.max(offset.x, Math.min(rawX, offset.x + rendered.width));
      const clampedTouchY = Math.max(offset.y, Math.min(rawY, offset.y + rendered.height));
      
      setTouchPosition({
        x: clampedTouchX,
        y: clampedTouchY,
      });

      // Use allowClamp=true when dragging so coordinates clamp to edges
      const newCoord = screenToCanonical(clientX, clientY, true);
      if (newCoord) {
        onCoordSelect(newCoord);
      }
    },
    [isDragging, isDisabled, imageDimensions, screenToCanonical, onCoordSelect]
  );

  // Handle touch/mouse end
  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setTouchPosition(null);
  }, []);

  // Add global mouse up listener to handle drag ending outside container
  useEffect(() => {
    const handleGlobalUp = () => {
      setIsDragging(false);
      setTouchPosition(null);
    };
    window.addEventListener('mouseup', handleGlobalUp);
    window.addEventListener('touchend', handleGlobalUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchend', handleGlobalUp);
    };
  }, []);

  // Determine if game is not playable
  const isGameInactive = gameStatus !== GameStatus.Started;

  // Calculate magnifier background position
  const getMagnifierStyle = () => {
    if (!touchPosition || !imageDimensions || !imageLoaded) return {};

    const { offset, rendered } = imageDimensions;

    // Calculate position within the image
    const imageX = touchPosition.x - offset.x;
    const imageY = touchPosition.y - offset.y;

    // Background position (zoomed)
    const bgX = -(imageX * ZOOM_LEVEL - MAGNIFIER_SIZE / 2);
    const bgY = -(imageY * ZOOM_LEVEL - MAGNIFIER_SIZE / 2);

    return {
      backgroundImage: `url(${imageUrl})`,
      backgroundPosition: `${bgX}px ${bgY}px`,
      backgroundSize: `${rendered.width * ZOOM_LEVEL}px ${rendered.height * ZOOM_LEVEL}px`,
      backgroundRepeat: 'no-repeat',
    };
  };

  return (
    <div
      ref={containerRef}
      className={`
        relative w-full h-full
        bg-[hsl(var(--secondary))]/50 rounded-2xl overflow-hidden
        border border-[hsl(var(--border))]/30
        select-none touch-none
        ${!isDisabled ? 'cursor-crosshair' : 'cursor-not-allowed'}
      `}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    >
      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: "40px 40px"
        }}
      />

      {/* Loading skeleton */}
      {!imageLoaded && imageUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-[hsl(var(--primary))]/20 border-2 border-[hsl(var(--primary))]/50 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
            </div>
            <p className="text-[hsl(var(--muted-foreground))] text-sm">Loading...</p>
          </div>
        </div>
      )}

      {/* Game Image */}
      {imageUrl && (
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Find the ball"
          className={`
            absolute inset-0 w-full h-full
            object-contain
            transition-opacity duration-300
            pointer-events-none
            ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            ${isDisabled ? 'brightness-50' : ''}
          `}
          onLoad={handleImageLoad}
          draggable={false}
        />
      )}

      {/* Simple crosshair marker when NOT dragging */}
      {coord && imageDimensions && !isDragging && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left: imageDimensions.offset.x + (coord.x / imageDimensions.natural.width) * imageDimensions.rendered.width,
            top: imageDimensions.offset.y + (coord.y / imageDimensions.natural.height) * imageDimensions.rendered.height,
          }}
        >
          {/* Crosshair lines - centered on the point */}
          <div
            className="absolute bg-red-500"
            style={{ width: '32px', height: '2px', left: '-16px', top: '-1px' }}
          />
          <div
            className="absolute bg-red-500"
            style={{ width: '2px', height: '32px', left: '-1px', top: '-16px' }}
          />
          {/* Center dot - exactly centered */}
          <div
            className="absolute bg-red-500 rounded-full border border-white"
            style={{ width: '8px', height: '8px', left: '-4px', top: '-4px' }}
          />
        </div>
      )}

      {/* Zoom Magnifier - Show while dragging */}
      {isDragging && touchPosition && imageDimensions && (
        <div
          className="absolute z-40 pointer-events-none"
          style={{
            left: touchPosition.x - MAGNIFIER_SIZE / 2,
            top: touchPosition.y - MAGNIFIER_SIZE - 30, // Position above finger
            width: MAGNIFIER_SIZE,
            height: MAGNIFIER_SIZE,
          }}
        >
          {/* Magnifier circle */}
          <div
            className="w-full h-full rounded-full border-4 border-white shadow-2xl overflow-hidden"
            style={getMagnifierStyle()}
          >
            {/* Crosshair overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Horizontal line */}
              <div className="absolute w-full h-0.5 bg-red-500/70" />
              {/* Vertical line */}
              <div className="absolute w-0.5 h-full bg-red-500/70" />
              {/* Center dot */}
              <div className="absolute w-2 h-2 rounded-full bg-red-500 border border-white" />
            </div>
          </div>

          {/* Coordinates display below magnifier */}
          {coord && (
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div className="bg-slate-900/95 px-2 py-1 rounded-md border border-white/20">
                <span className="text-white text-xs font-mono">
                  {coord.x}, {coord.y}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Small crosshair at actual touch point while dragging */}
      {isDragging && touchPosition && (
        <div
          className="absolute z-30 pointer-events-none"
          style={{
            left: touchPosition.x,
            top: touchPosition.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-6 h-6 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 -translate-y-1/2" />
            <div className="absolute left-1/2 top-0 h-full w-0.5 bg-red-500 -translate-x-1/2" />
          </div>
        </div>
      )}

      {/* Tap Hint Overlay - shown when no selection */}
      {showTapHint && !coord && imageLoaded && !isDisabled && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="
              flex flex-col items-center gap-3
              bg-slate-900/90 backdrop-blur-sm
              px-6 py-5 rounded-2xl
              border border-white/10
              shadow-2xl
              animate-pulse
            "
          >
            <div
              className="
                w-14 h-14 rounded-full
                bg-gradient-to-br from-purple-500 to-pink-500
                flex items-center justify-center
                shadow-lg shadow-purple-500/30
              "
            >
              <Target className="w-7 h-7 text-white" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-base">
                Tap or drag to select
              </p>
              <p className="text-slate-400 text-sm mt-0.5">
                Where is the ball?
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Game Inactive Overlay */}
      {isGameInactive && imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div
            className="
              flex flex-col items-center gap-2
              bg-slate-900/95 backdrop-blur-sm
              px-6 py-4 rounded-2xl
              border border-white/10
            "
          >
            <div
              className={`
                w-3 h-3 rounded-full
                ${gameStatus === GameStatus.Claim ? 'bg-red-500' : 'bg-amber-500'}
              `}
            />
            <p className="text-white font-medium">
              {gameStatus === GameStatus.Claim
                ? 'Game has ended'
                : 'Game not started yet'}
            </p>
          </div>
        </div>
      )}

      {/* No Image State */}
      {!imageUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No game image available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameImageCanvas;
