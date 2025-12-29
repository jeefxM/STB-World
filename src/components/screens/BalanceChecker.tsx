"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { createPublicClient, http, formatEther, erc20Abi } from "viem";
import { worldchain } from "viem/chains";
import { AlertCircle } from "lucide-react";
import GameABI from "@/abi/gameABI";
import { getGameUUID } from "@/config/gameIdMap";

// Known token addresses on World Chain
const USDC_ADDRESS = "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1".toLowerCase();

// Create a public client for reading from the blockchain
const publicClient = createPublicClient({
  chain: worldchain,
  transport: http(),
});

interface BalanceCheckerProps {
  onBalanceCheck?: (hasEnough: boolean, balance: string, required: string) => void;
}

/**
 * BalanceChecker component - Checks if user has enough balance to play
 * Shows a warning banner if insufficient funds
 */
const BalanceChecker: React.FC<BalanceCheckerProps> = ({ onBalanceCheck }) => {
  const { data: session } = useSession();
  const [isChecking, setIsChecking] = useState(false);
  const [hasEnoughBalance, setHasEnoughBalance] = useState(true);
  const [userBalance, setUserBalance] = useState<string>("0");
  const [requiredAmount, setRequiredAmount] = useState<string>("0");
  const [tokenSymbol, setTokenSymbol] = useState("WLD");

  useEffect(() => {
    const checkBalance = async () => {
      if (!session?.user?.walletAddress) {
        return;
      }

      setIsChecking(true);

      try {
        // Step 1: Get game info and contract address
        const gameUUID = getGameUUID('game-wld');
        const response = await fetch(`/api/game?gameId=${gameUUID}`);
        
        if (!response.ok) {
          console.error("Failed to fetch game info");
          setIsChecking(false);
          return;
        }
        
        const data = await response.json();
        const contractAddress = data.contract_address as `0x${string}`;
        
        if (!contractAddress) {
          console.error("No contract address found");
          setIsChecking(false);
          return;
        }

        // Step 2: Fetch mint price and payment token from contract
        const [mintPriceRaw, paymentToken] = await Promise.all([
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

        const mintPrice = mintPriceRaw as bigint;

        // Step 3: Determine token type
        const tokenAddress = (paymentToken as string)?.toLowerCase() || "";
        const isUSDC = tokenAddress === USDC_ADDRESS;
        const isNativePayment = !paymentToken || paymentToken === "0x0000000000000000000000000000000000000000";
        
        const symbol = isUSDC ? "USDC" : "WLD";
        const decimals = isUSDC ? 6 : 18;
        setTokenSymbol(symbol);

        // Step 4: Get user's balance
        let balance: bigint;
        
        if (isNativePayment) {
          // Get native WLD balance
          balance = await publicClient.getBalance({
            address: session.user.walletAddress as `0x${string}`,
          });
        } else {
          // Get ERC20 token balance
          balance = await publicClient.readContract({
            address: tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [session.user.walletAddress as `0x${string}`],
          }) as bigint;
        }

        // Step 5: Format and compare balances
        const formattedBalance = formatValue(balance, decimals);
        const formattedRequired = formatValue(mintPrice, decimals);
        
        setUserBalance(formattedBalance);
        setRequiredAmount(formattedRequired);
        
        const hasEnough = balance >= mintPrice;
        setHasEnoughBalance(hasEnough);

        // Callback to parent component
        if (onBalanceCheck) {
          onBalanceCheck(hasEnough, formattedBalance, formattedRequired);
        }

        console.log(`💰 Balance Check: ${formattedBalance} ${symbol} (Required: ${formattedRequired} ${symbol}) - ${hasEnough ? '✅ Sufficient' : '❌ Insufficient'}`);

      } catch (error) {
        console.error("Error checking balance:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkBalance();
  }, [session?.user?.walletAddress, onBalanceCheck]);

  // Format bigint values
  const formatValue = (value: bigint | number | string | undefined, decimals: number = 18): string => {
    if (value === undefined || value === null) return "0";

    let bigintValue: bigint;
    try {
      bigintValue = typeof value === 'bigint' ? value : BigInt(value.toString());
    } catch {
      return "0";
    }

    if (bigintValue === BigInt(0)) return "0";

    if (decimals === 18) {
      const formatted = formatEther(bigintValue);
      const num = parseFloat(formatted);
      if (num < 0.0001 && num > 0) return "< 0.0001";
      return num.toFixed(4).replace(/\.?0+$/, '');
    } else {
      // For tokens like USDC (6 decimals)
      const divisor = BigInt(10 ** decimals);
      const wholePart = bigintValue / divisor;
      const fractionalPart = bigintValue % divisor;
      const fractionalStr = fractionalPart.toString().padStart(decimals, '0').slice(0, 2);
      const num = parseFloat(`${wholePart}.${fractionalStr}`);
      if (num < 0.01 && num > 0) return "< 0.01";
      return num.toFixed(2);
    }
  };

  // Don't show anything if still checking or if user has enough balance
  if (isChecking || hasEnoughBalance || !session?.user?.walletAddress) {
    return null;
  }

  // Show warning banner if insufficient balance
  return (
    <div className="px-4 py-2">
      <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <AlertCircle className="w-4 h-4 text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-500">Insufficient Balance</p>
          <p className="text-xs text-amber-500/80 mt-1">
            You need <span className="font-bold">{requiredAmount} {tokenSymbol}</span> to play, but you only have{" "}
            <span className="font-bold">{userBalance} {tokenSymbol}</span>.
          </p>
          <p className="text-xs text-amber-500/70 mt-1">
            Please add funds to your World App wallet to continue.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BalanceChecker;
