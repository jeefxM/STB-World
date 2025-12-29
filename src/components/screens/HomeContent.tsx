"use client";

import React from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { Button } from "@/components/core/ui/Button";
import PrizePool from "./PrizePool";
import BalanceChecker from "./BalanceChecker";

interface HomeContentProps {
  imageUrl?: string;
  onPlay?: () => void;
}

const HomeContent: React.FC<HomeContentProps> = ({
  imageUrl,
  onPlay,
}) => {
  // Hardcoded image for now
  const gameImageUrl = imageUrl || "https://uvfyaykcpsggbabxbuzb.supabase.co/storage/v1/object/public/game-images/edadef06-167f-44a5-9a0a-7a07057967ab/challenge.jpg";


  return (
    <>
      {/* Header Section */}
      <div className="px-4 pt-6 pb-3 text-center space-y-3">
        {/* Game Type Toggle */}
        <div className="flex items-center justify-center gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all bg-[#1de5d1] text-black border-2 border-[#1de5d1] shadow-lg shadow-[#1de5d1]/20"
          >
            <Image
              src="/logo/worldcoin-logo.png"
              alt="WLD"
              width={20}
              height={20}
              className="rounded-full"
            />
            <span>WLD Game</span>
          </button>
          <button
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] border-2 border-[hsl(var(--border))] opacity-60 cursor-not-allowed"
            disabled
          >
            <span className="w-5 h-5 rounded-full bg-[#2775CA] text-white text-xs font-bold flex items-center justify-center">$</span>
            <span>USDC</span>
            <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-amber-500 text-black text-[10px] font-bold rounded-full">Soon</span>
          </button>
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] leading-tight">
          Can you figure out where
          <br />
          <span className="text-gradient-primary">the ball is?</span>
        </h1>

        {/* Subtitle */}
        {/* <p className="text-[hsl(var(--muted-foreground))] text-sm">
          Win up to{" "}
          <span className="text-[hsl(var(--accent))] font-semibold">{maxPrize} WLD</span>{" "}
          in prizes!
        </p> */}
      </div>

      {/* Prize Pool Stats - Fetches from contract directly */}
      <PrizePool />

      {/* Balance Check - Shows warning if insufficient funds */}
      <BalanceChecker />

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
          
          {/* Play Button Overlay - Center of image */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="relative">
              {/* Static rings */}
              <div className="absolute -inset-12 rounded-full border-2 border-[#1de5d1]/20" />
              <div className="absolute -inset-6 rounded-full border border-[#1de5d1]/40" />
              
              {/* Play button container */}
              <Button
                onClick={onPlay}
                className="relative w-28 h-28 rounded-full bg-[#1de5d1]! text-black! hover:bg-[#1de5d1]/90! backdrop-blur-md border-2 border-white/30 flex flex-col items-center justify-center gap-1 shadow-2xl glow-primary"
              >
                <Play className="w-10 h-10 fill-current" />
                <span className="text-sm font-bold tracking-wide">PLAY</span>
              </Button>
            </div>
          </div>
          
          {/* "Find the ball" text */}
          <div className="absolute bottom-20 left-0 right-0 text-center z-20">
            <p className="text-white/90 text-sm font-medium drop-shadow-lg">
              Pick where the ball is and <span className="text-[#1de5d1] font-bold">WIN!</span>
            </p>
          </div>
          
          {/* Corner Decorations */}
          <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-[hsl(var(--primary))]/50 rounded-tl-sm z-20" />
          <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-[hsl(var(--primary))]/50 rounded-tr-sm z-20" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-[hsl(var(--primary))]/50 rounded-bl-sm z-20" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-[hsl(var(--primary))]/50 rounded-br-sm z-20" />
        </div>
      </div>
    </>
  );
};

export default HomeContent;
