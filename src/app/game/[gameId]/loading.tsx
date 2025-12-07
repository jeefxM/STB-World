"use client";

import { ArrowLeft } from "lucide-react";

export default function GameLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-game">
      {/* Back Button Skeleton */}
      <div className="absolute top-4 left-4 z-50">
        <div className="w-10 h-10 rounded-xl bg-[hsl(var(--secondary))]/80 backdrop-blur-sm flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
        </div>
      </div>

      {/* Tap Instruction */}
      <div className="absolute top-4 inset-x-0 flex justify-center z-40 pointer-events-none">
        <div className="glass-card px-4 py-2 text-xs text-[hsl(var(--muted-foreground))]">
          Loading game...
        </div>
      </div>

      {/* Canvas Skeleton */}
      <div className="flex-1 px-2 pt-16 pb-4">
        <div className="h-[75vh] relative w-full bg-[hsl(var(--secondary))]/50 rounded-2xl overflow-hidden border border-[hsl(var(--border))]/30">
          {/* Subtle grid overlay */}
          <div 
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                               linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
              backgroundSize: "40px 40px"
            }}
          />

          {/* Loading indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-[hsl(var(--primary))]/20 border-2 border-[hsl(var(--primary))]/50 flex items-center justify-center animate-pulse">
                <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary))]" />
              </div>
              <div className="space-y-2">
                <p className="text-[hsl(var(--foreground))] font-medium">Loading Game</p>
                <p className="text-[hsl(var(--muted-foreground))] text-sm">Preparing your challenge...</p>
              </div>
              {/* Loading bar */}
              <div className="w-48 h-1 bg-[hsl(var(--secondary))] rounded-full overflow-hidden mx-auto">
                <div className="h-full bg-[hsl(var(--primary))] rounded-full animate-loading-bar" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls Skeleton */}
      <div className="px-4 pb-8 flex items-center gap-3">
        {/* Coordinates Skeleton */}
        <div className="glass-card px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--secondary))] animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="w-4 h-2 bg-[hsl(var(--secondary))] rounded mb-1 animate-pulse" />
              <div className="w-8 h-5 bg-[hsl(var(--secondary))] rounded animate-pulse" />
            </div>
            <div className="w-px h-8 bg-[hsl(var(--border))]" />
            <div className="text-center">
              <div className="w-4 h-2 bg-[hsl(var(--secondary))] rounded mb-1 animate-pulse" />
              <div className="w-8 h-5 bg-[hsl(var(--secondary))] rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Submit Button Skeleton */}
        <div className="flex-1 h-12 rounded-xl bg-[hsl(var(--primary))]/30 animate-pulse" />
      </div>
    </div>
  );
}
