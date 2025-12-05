"use client";

/**
 * MobileGameView - Legacy compatibility wrapper
 *
 * This component is deprecated in favor of the new modular architecture.
 * The main SpotTheBall component now handles all mobile-first functionality
 * directly through:
 * - GameHeader
 * - GameImageCanvas
 * - GameControls
 * - SuccessModal
 * - ErrorToast
 *
 * This file is kept for backwards compatibility but simply re-exports
 * a simplified version of the game view.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Target, Zap, Loader2, RotateCcw, Move } from "lucide-react";
import type { Coordinate, ImageDimensions } from "./types";
import { GameStatus } from "./types";
import { CoordinateMarker } from "./CoordinateMarker";

interface MobileGameViewProps {
  imageUrl: string;
  gameData: {
    title: string;
    description: string;
  };
  coord: Coordinate | null;
  setCoord: (coord: Coordinate | null) => void;
  isPlaying: boolean;
  onPlay: () => void;
  gameAddress: `0x${string}` | null;
  mintPrice: bigint | null;
  gameStatus?: number | null;
}

/**
 * MobileGameView - Standalone mobile game view component
 * For use when you need a self-contained game view without the full
 * SpotTheBall wrapper.
 */
const MobileGameView: React.FC<MobileGameViewProps> = ({
  imageUrl,
  coord,
  setCoord,
  isPlaying,
  onPlay,
  gameAddress,
  mintPrice,
  gameStatus,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageDimensions, setImageDimensions] =
    useState<ImageDimensions | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  console.log("Meeeee");
  // Format ETH value
  const formatEth = (value: bigint | null): string => {
    if (value === null) return "—";
    const ethValue = Number(value) / 1e18;
    return ethValue < 0.0001 ? "<0.0001" : ethValue.toFixed(4);
  };

  // Calculate image dimensions on load
  const handleImageLoad = useCallback(() => {
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
    setImageLoaded(true);
  }, []);

  // Convert screen coordinates to canonical
  const screenToCanonical = useCallback(
    (clientX: number, clientY: number): Coordinate | null => {
      if (!imageDimensions || !containerRef.current) return null;

      const containerRect = containerRef.current.getBoundingClientRect();
      const x = clientX - containerRect.left;
      const y = clientY - containerRect.top;

      const { offset, rendered, scale, natural } = imageDimensions;

      if (
        x < offset.x ||
        x > offset.x + rendered.width ||
        y < offset.y ||
        y > offset.y + rendered.height
      ) {
        return null;
      }

      const imageX = x - offset.x;
      const imageY = y - offset.y;

      const canonicalX = Math.round(imageX * scale.x);
      const canonicalY = Math.round(imageY * scale.y);

      const clampedX = Math.max(0, Math.min(canonicalX, natural.width - 1));
      const clampedY = Math.max(0, Math.min(canonicalY, natural.height - 1));

      return { x: clampedX, y: clampedY };
    },
    [imageDimensions]
  );

  // Handle pointer down (tap/click start)
  const handlePointerDown = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
    ) => {
      if (!imageDimensions || gameStatus !== GameStatus.Started) return;

      let clientX: number;
      let clientY: number;

      if ("touches" in e) {
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
        setCoord(newCoord);
      }
    },
    [imageDimensions, gameStatus, screenToCanonical, setCoord]
  );

  // Handle pointer move (drag)
  const handlePointerMove = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
    ) => {
      if (!isDragging || !imageDimensions || gameStatus !== GameStatus.Started)
        return;

      let clientX: number;
      let clientY: number;

      if ("touches" in e) {
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
        setCoord(newCoord);
      }
    },
    [isDragging, imageDimensions, gameStatus, screenToCanonical, setCoord]
  );

  // Handle pointer up
  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Global listeners for drag end
  useEffect(() => {
    const handleGlobalUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleGlobalUp);
    window.addEventListener("touchend", handleGlobalUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalUp);
      window.removeEventListener("touchend", handleGlobalUp);
    };
  }, []);

  const isGameActive = gameStatus === GameStatus.Started;
  const canSubmit =
    coord && isGameActive && !isPlaying && gameAddress && mintPrice;

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Image Container */}
      <div
        ref={containerRef}
        className={`
          relative flex-1 min-h-[50vh]
          bg-slate-950
          select-none touch-none
          ${isGameActive ? "cursor-crosshair" : "cursor-not-allowed"}
        `}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        {/* Loading */}
        {!imageLoaded && imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-3 border-slate-700 border-t-purple-500 animate-spin" />
          </div>
        )}

        {/* Image */}
        {imageUrl && (
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Find the ball"
            className={`
              absolute inset-0 w-full h-full
              object-contain
              transition-opacity duration-300
              ${imageLoaded ? "opacity-100" : "opacity-0"}
              ${!isGameActive ? "brightness-50" : ""}
            `}
            onLoad={handleImageLoad}
            draggable={false}
          />
        )}

        {/* Coordinate Marker */}
        {coord && imageDimensions && (
          <CoordinateMarker coord={coord} imageDimensions={imageDimensions} />
        )}

        {/* Dragging indicator */}
        {isDragging && coord && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30">
            <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-purple-500/30">
              <Move className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-white text-xs font-mono">
                {coord.x}, {coord.y}
              </span>
            </div>
          </div>
        )}

        {/* Tap Hint */}
        {!coord && imageLoaded && isGameActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-3 bg-slate-900/90 backdrop-blur-sm px-6 py-5 rounded-2xl border border-white/10 animate-pulse">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">
                  Tap or drag to select
                </p>
                <p className="text-slate-400 text-sm">Where is the ball?</p>
              </div>
            </div>
          </div>
        )}

        {/* Game Inactive Overlay */}
        {!isGameActive && imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 bg-slate-900/95 px-6 py-4 rounded-2xl border border-white/10">
              <div
                className={`w-3 h-3 rounded-full ${
                  gameStatus === GameStatus.Claim
                    ? "bg-red-500"
                    : "bg-amber-500"
                }`}
              />
              <p className="text-white font-medium">
                {gameStatus === GameStatus.Claim
                  ? "Game has ended"
                  : "Game not started yet"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-4 py-4 bg-slate-900/95 backdrop-blur-lg border-t border-white/10 pb-[max(env(safe-area-inset-bottom),16px)]">
        {/* Coordinate Display */}
        {coord && (
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex items-center gap-2 bg-slate-800/80 rounded-full px-3 py-1.5 border border-white/5">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-white text-xs font-mono">
                X: {coord.x}, Y: {coord.y}
              </span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCoord(null)}
            disabled={!coord || isPlaying}
            className={`
              flex items-center justify-center
              min-h-[48px] px-4 rounded-xl font-medium
              transition-all duration-200 active:scale-95
              ${
                coord && !isPlaying
                  ? "bg-slate-800 text-slate-300 border border-slate-700"
                  : "bg-slate-800/50 text-slate-600 border border-slate-800 cursor-not-allowed"
              }
            `}
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={onPlay}
            disabled={!canSubmit}
            className={`
              flex-1 flex items-center justify-center gap-2
              min-h-[48px] px-6 rounded-xl font-semibold
              transition-all duration-200 active:scale-[0.98]
              ${
                canSubmit
                  ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }
              ${
                isPlaying
                  ? "bg-gradient-to-r from-purple-500 to-violet-500"
                  : ""
              }
            `}
          >
            {isPlaying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : !isGameActive ? (
              <>
                <Zap className="w-5 h-5" />
                <span>Game Ended</span>
              </>
            ) : !coord ? (
              <>
                <Target className="w-5 h-5" />
                <span>Select Position</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>Submit • {formatEth(mintPrice)} WLD</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileGameView;
