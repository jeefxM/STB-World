"use client";

import React from "react";
import Image from "next/image";
import { Play, Sparkles } from "lucide-react";
import { Button } from "@/components/core/ui/Button";
import PrizePool from "./PrizePool";

interface HomeContentProps {
  roundNumber?: number;
  playerCount?: number;
  prizePool?: string;
  mintPrice?: string;
  maxPrize?: string;
  imageUrl?: string;
  onPlay?: () => void;
}

const HomeContent: React.FC<HomeContentProps> = ({
  roundNumber = 42,
  playerCount = 156,
  prizePool = "2.5",
  mintPrice = "0.01",
  maxPrize = "2.5",
  imageUrl,
  onPlay,
}) => {
  // Hardcoded image for now
  const gameImageUrl = "https://uvfyaykcpsggbabxbuzb.supabase.co/storage/v1/object/public/game-images/edadef06-167f-44a5-9a0a-7a07057967ab/challenge.jpg";

  return (
    <>
      {/* Header Section */}
      <div className="px-4 pt-6 pb-3 text-center space-y-2">
        {/* Round Badge */}
        <div className="inline-flex items-center gap-2 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] px-3 py-1.5 rounded-full text-xs font-medium border border-[hsl(var(--accent))]/20">
          <Sparkles className="w-3 h-3" />
          <span>
            Round #{roundNumber} • {playerCount} players
          </span>
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] leading-tight">
          Can you guess where
          <br />
          <span className="text-gradient-primary">the ball is?</span>
        </h1>

        {/* Subtitle */}
        <p className="text-[hsl(var(--muted-foreground))] text-sm">
          Win up to{" "}
          <span className="text-[hsl(var(--accent))] font-semibold">{maxPrize} WLD</span>{" "}
          in prizes!
        </p>
      </div>

      {/* Prize Pool Stats */}
      <PrizePool prizePool={prizePool} mintPrice={mintPrice} />

      {/* Canvas Area with Play Button - FIXED HEIGHT */}
      <div className="flex-1 px-4 py-3">
        <div className="relative w-full h-[50vh] min-h-[280px] rounded-2xl overflow-hidden border border-[hsl(var(--border))]/50 bg-[hsl(var(--card))]">
          {/* Grid Overlay */}
          <div className="absolute inset-0 canvas-grid opacity-30 pointer-events-none z-10" />
          
          {/* Game Image - Blurred for mystery effect */}
          <Image 
            src={gameImageUrl}
            alt="Game Canvas" 
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover blur-[3px] scale-105"
            priority
          />
          
          {/* Dark overlay for better contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 z-10" />
          
          {/* Question Mark Overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="relative">
              {/* Static rings */}
              <div className="absolute -inset-8 rounded-full border-2 border-[hsl(var(--primary))]/20" />
              <div className="absolute -inset-4 rounded-full border border-[hsl(var(--primary))]/40" />
              
              {/* Question mark container */}
              <div className="relative w-24 h-24 rounded-full bg-[hsl(var(--card))]/80 backdrop-blur-md border border-[hsl(var(--primary))]/50 flex items-center justify-center glow-primary">
                <span className="text-5xl font-display font-bold text-[hsl(var(--primary))]">?</span>
              </div>
            </div>
          </div>
          
          {/* "Find the ball" text */}
          <div className="absolute bottom-20 left-0 right-0 text-center z-20">
            <p className="text-white/80 text-sm font-medium drop-shadow-lg">
              Where is the ball hiding?
            </p>
          </div>
          
          {/* Corner Decorations */}
          <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-[hsl(var(--primary))]/50 rounded-tl-sm z-20" />
          <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-[hsl(var(--primary))]/50 rounded-tr-sm z-20" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-[hsl(var(--primary))]/50 rounded-bl-sm z-20" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-[hsl(var(--primary))]/50 rounded-br-sm z-20" />

          {/* Play Button - Bottom right corner */}
          <Button
            onClick={onPlay}
            className="absolute bottom-4 right-4 rounded-full w-16 h-16 flex-col gap-0.5 z-30 shadow-lg bg-[#1de5d1]! text-black! hover:bg-[#1de5d1]/90!"
          >
            <Play className="w-6 h-6 fill-current" />
            <span className="text-[9px] font-bold tracking-wide">PLAY</span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default HomeContent;
