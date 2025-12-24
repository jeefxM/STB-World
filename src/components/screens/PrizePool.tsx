"use client";

import React, { useEffect, useState } from "react";
import { Trophy, Target } from "lucide-react";
import { createPublicClient, http, formatEther } from "viem";
import { worldchain } from "viem/chains";
import GameABI from "@/abi/gameABI";
import { getGameUUID } from "@/config/gameIdMap";

interface GameInfo {
  contract_address: string;
  name: string;
  total_submissions: number;
}

// Create a public client for reading from the blockchain
const publicClient = createPublicClient({
  chain: worldchain,
  transport: http(),
});

/**
 * PrizePool component - Fetches prize pool and mint price from the blockchain
 * Uses viem directly instead of wagmi for compatibility with MiniKit
 */
const PrizePool: React.FC = () => {
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [prizePool, setPrizePool] = useState<string>("0");
  const [mintPrice, setMintPrice] = useState<string>("0");
  const [isFree, setIsFree] = useState(false);
  const [tokenSymbol, setTokenSymbol] = useState("WLD");

  // Fetch game info and contract data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Step 1: Get game info from API
        const gameUUID = getGameUUID('game-wld');
        const response = await fetch(`/api/game?gameId=${gameUUID}`);
        
        if (!response.ok) {
          console.error("Failed to fetch game info");
          setIsLoading(false);
          return;
        }
        
        const data = await response.json();
        setGameInfo(data);
        
        const contractAddress = data.contract_address as `0x${string}`;
        
        if (!contractAddress) {
          console.error("No contract address found");
          setIsLoading(false);
          return;
        }

        // Step 2: Fetch data from blockchain using viem
        const [prizePoolRaw, mintPriceRaw, paymentToken] = await Promise.all([
          publicClient.readContract({
            address: contractAddress,
            abi: GameABI,
            functionName: "prizePool",
          }),
          publicClient.readContract({
            address: contractAddress,
            abi: GameABI,
            functionName: "mintPrice",
          }),
          publicClient.readContract({
            address: contractAddress,
            abi: GameABI,
            functionName: "paymentToken",
          }),
        ]);

        // Determine if native payment
        const isNativePayment = !paymentToken || paymentToken === "0x0000000000000000000000000000000000000000";
        const symbol = isNativePayment ? "WLD" : "USDC";
        const decimals = isNativePayment ? 18 : 6;

        setTokenSymbol(symbol);

        // Format prize pool
        const formattedPrizePool = formatValue(prizePoolRaw as bigint, decimals);
        setPrizePool(formattedPrizePool);

        // Format mint price
        const mintPriceBigInt = mintPriceRaw as bigint;
        setIsFree(mintPriceBigInt === BigInt(0));
        const formattedMintPrice = formatValue(mintPriceBigInt, decimals);
        setMintPrice(formattedMintPrice);

      } catch (error) {
        console.error("Error fetching blockchain data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format bigint values
  const formatValue = (value: bigint | undefined, decimals: number = 18): string => {
    if (!value) return "0";
    
    if (decimals === 18) {
      const formatted = formatEther(value);
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

  return (
    <div className="px-4 py-2">
      <div className="flex gap-3">
        {/* Prize Pool Card */}
        <div className="flex-1 glass-card p-3 flex items-center gap-3 border-[hsl(var(--accent))]/30">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent))]/20 flex items-center justify-center shrink-0">
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
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary))]/20 flex items-center justify-center shrink-0">
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
