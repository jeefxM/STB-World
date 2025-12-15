"use client";

import React from "react";
import { Trophy, Target } from "lucide-react";

interface PrizePoolProps {
  prizePool?: string;
  mintPrice?: string;
  isLoading?: boolean;
}

const PrizePool: React.FC<PrizePoolProps> = ({
  prizePool = "2.5",
  mintPrice = "0.01",
  isLoading = false,
}) => {
  return (
    <div className="px-4 py-2">
      <div className="flex gap-3">
        {/* Prize Pool Card */}
        <div className="flex-1 glass-card p-3 flex items-center gap-3 border-[hsl(var(--accent))]/30">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent))]/20 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-5 h-5 text-[hsl(var(--accent))]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))] font-medium">
              Prize Pool
            </p>
            <p className="font-display font-bold text-lg text-[hsl(var(--accent))] leading-tight truncate">
              {isLoading ? (
                <span className="inline-block w-16 h-5 bg-[hsl(var(--muted))] rounded animate-pulse" />
              ) : (
                `${prizePool} WLD`
              )}
            </p>
          </div>
        </div>

        {/* Mint Price Card */}
        <div className="flex-1 glass-card p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary))]/20 flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-[hsl(var(--primary))]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))] font-medium">
              Submission Price
            </p>
            <p className="font-display font-bold text-lg text-[hsl(var(--primary))] leading-tight truncate">
              {isLoading ? (
                <span className="inline-block w-16 h-5 bg-[hsl(var(--muted))] rounded animate-pulse" />
              ) : (
                `${mintPrice} WLD`
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrizePool;
