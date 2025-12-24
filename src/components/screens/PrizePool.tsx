"use client";

import React, { useEffect, useState } from "react";
import { Trophy, Target } from "lucide-react";
import { useReadContract } from "wagmi";
import { formatEther } from "viem";
import GameABI from "@/abi/gameABI";
import { getGameUUID } from "@/config/gameIdMap";

interface GameInfo {
  contract_address: string;
  name: string;
  total_submissions: number;
}

/**
 * PrizePool component - Fetches prize pool and mint price from the blockchain
 * Falls back to props if blockchain fetch fails
 */
const PrizePool: React.FC = () => {
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [isLoadingGame, setIsLoadingGame] = useState(true);

  // Fetch game info (including contract address) on mount
  useEffect(() => {
    const fetchGameInfo = async () => {
      try {
        const gameUUID = getGameUUID('game-wld');
        const response = await fetch(`/api/game?gameId=${gameUUID}`);
        if (response.ok) {
          const data = await response.json();
          setGameInfo(data);
        }
      } catch (error) {
        console.error("Error fetching game info:", error);
      } finally {
        setIsLoadingGame(false);
      }
    };

    fetchGameInfo();
  }, []);

  const contractAddress = gameInfo?.contract_address as `0x${string}` | undefined;

  // Fetch prize pool from contract
  const { data: prizePoolRaw, isLoading: isPrizePoolLoading } = useReadContract({
    address: contractAddress,
    abi: GameABI,
    functionName: "prizePool",
    query: {
      enabled: !!contractAddress,
    },
  });

  // Fetch mint price from contract
  const { data: mintPriceRaw, isLoading: isMintPriceLoading } = useReadContract({
    address: contractAddress,
    abi: GameABI,
    functionName: "mintPrice",
    query: {
      enabled: !!contractAddress,
    },
  });

  // Fetch payment token to determine if it's ETH or ERC20
  const { data: paymentToken } = useReadContract({
    address: contractAddress,
    abi: GameABI,
    functionName: "paymentToken",
    query: {
      enabled: !!contractAddress,
    },
  });

  const isLoading = isLoadingGame || isPrizePoolLoading || isMintPriceLoading;

  // Check if native ETH payment (address(0))
  const isNativePayment = !paymentToken || paymentToken === "0x0000000000000000000000000000000000000000";

  // Format the values
  const formatValue = (value: bigint | undefined, decimals: number = 18): string => {
    if (!value) return "0";
    
    if (decimals === 18) {
      const formatted = formatEther(value);
      // Show up to 4 decimal places
      const num = parseFloat(formatted);
      if (num < 0.0001 && num > 0) return "< 0.0001";
      return num.toFixed(4).replace(/\.?0+$/, '');
    } else {
      // For tokens like USDC (6 decimals)
      const num = Number(value) / Math.pow(10, decimals);
      if (num < 0.01 && num > 0) return "< 0.01";
      return num.toFixed(2);
    }
  };

  // Determine token symbol and decimals
  const tokenSymbol = isNativePayment ? "WLD" : "USDC";
  const decimals = isNativePayment ? 18 : 6;

  const prizePool = formatValue(prizePoolRaw as bigint | undefined, decimals);
  const mintPrice = formatValue(mintPriceRaw as bigint | undefined, decimals);
  
  // Check if mint price is 0 (free)
  const isFree = mintPriceRaw !== undefined && mintPriceRaw === BigInt(0);

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
                `${prizePool} ${tokenSymbol}`
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
              ) : isFree ? (
                "FREE"
              ) : (
                `${mintPrice} ${tokenSymbol}`
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrizePool;
