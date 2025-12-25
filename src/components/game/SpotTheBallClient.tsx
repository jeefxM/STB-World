"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createPublicClient, http } from "viem";
import { worldchain } from "viem/chains";
import { MiniKit } from "@worldcoin/minikit-js";
import { ArrowLeft } from "lucide-react";

import GameABI from "@/abi/gameABI";
import { Button } from "@/components/core/ui/Button";

import { GameImageCanvas } from "./GameImageCanvas";
import { GameControls } from "./GameControls";
import {
  GameStatus,
  type Coordinate,
  type GameData,
} from "./types";

const publicClient = createPublicClient({
  chain: worldchain,
  transport: http(
    "https://worldchain-mainnet.g.alchemy.com/v2/-Ni_mubLyV7sEw_-C0t2JLrbmanltv0f"
  ),
});

interface Submission {
  id: string;
  x: number;
  y: number;
  timestamp: Date;
  txHash?: string;
}

interface SpotTheBallClientProps {
  gameId: string;
  initialGameData: GameData;
}

/**
 * SpotTheBallClient - Main game component
 * Premium mobile-first design for World miniapp
 */
export const SpotTheBallClient: React.FC<SpotTheBallClientProps> = ({ 
  gameId, 
  initialGameData 
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  
  // Use pre-fetched data immediately
  const [gameData] = useState<GameData>(initialGameData);

  // Contract state
  const [mintPrice, setMintPrice] = useState<bigint | null>(null);
  const [prizePool, setPrizePool] = useState<bigint | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus | null>(null);
  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  const [isLoadingContract, setIsLoadingContract] = useState(true);

  // Game state
  const [coord, setCoord] = useState<Coordinate | null>(null);
  const [transactionState, setTransactionState] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  // Submissions tracking
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const hasLoadedContractData = useRef(false);

  // Fetch contract data (client-side for real-time data)
  useEffect(() => {
    const readContractData = async () => {
      if (hasLoadedContractData.current || !gameData.contractAddress) {
        return;
      }

      try {
        hasLoadedContractData.current = true;

        const [price, status, pool, tokenAddress] = await Promise.all([
          publicClient.readContract({
            address: gameData.contractAddress,
            abi: GameABI,
            functionName: "mintPrice",
          }),
          publicClient.readContract({
            address: gameData.contractAddress,
            abi: GameABI,
            functionName: "gameStatus",
          }),
          publicClient.readContract({
            address: gameData.contractAddress,
            abi: GameABI,
            functionName: "prizePool",
          }),
          publicClient.readContract({
            address: gameData.contractAddress,
            abi: GameABI,
            functionName: "paymentToken",
          }),
        ]);

        setMintPrice(price as bigint);
        setGameStatus(Number(status) as GameStatus);
        setPrizePool(pool as bigint);
        setPaymentToken(tokenAddress as string);
      } catch (e) {
        console.error("Contract read error:", e);
        hasLoadedContractData.current = false;
      } finally {
        setIsLoadingContract(false);
      }
    };

    readContractData();
  }, [gameData.contractAddress]);

  const handleCoordSelect = useCallback((newCoord: Coordinate) => {
    setCoord(newCoord);
    setTransactionState("idle");
    setErrorMessage("");
  }, []);

  const handleReset = useCallback(() => {
    setCoord(null);
    setTransactionState("idle");
    setErrorMessage("");
  }, []);

  const handleBack = useCallback(() => {
    router.push("/");
  }, [router]);

  const handleSubmit = useCallback(async () => {
    if (!coord || !gameData.contractAddress || !mintPrice || paymentToken === null) {
      console.error("Missing required data");
      return;
    }

    const isNativePayment = paymentToken === "0x0000000000000000000000000000000000000000";
    
    console.log("🎯 Starting transaction...");
    console.log("📍 Coordinates:", { x: coord.x, y: coord.y });
    console.log("💰 Mint Price:", mintPrice.toString());
    console.log("💳 Payment:", isNativePayment ? "Native ETH" : `ERC20 (${paymentToken})`);

    setTransactionState("pending");
    setErrorMessage("");

    try {
      let transactionPayload;

      if (isNativePayment) {
        // NATIVE ETH PAYMENT
        console.log("🟢 Using native ETH payment");
        
        transactionPayload = {
          transaction: [
            {
              address: gameData.contractAddress,
              abi: GameABI,
              functionName: "play",
              args: [coord.y, coord.x],
              value: `0x${mintPrice.toString(16)}`,
            },
          ],
        };
      } else {
        // ERC20 PAYMENT WITH PERMIT2
        console.log("🔵 Using Permit2 for ERC20 payment");
        
        const nonce = Date.now().toString();
        const deadline = Math.floor((Date.now() + 30 * 60 * 1000) / 1000).toString();

        transactionPayload = {
          transaction: [
            {
              address: gameData.contractAddress,
              abi: GameABI,
              functionName: "playWithPermit",
              args: [
                coord.y,
                coord.x,
                nonce,
                deadline,
                "PERMIT2_SIGNATURE_PLACEHOLDER_0",
              ],
            },
          ],
          permit2: [
            {
              permitted: {
                token: paymentToken,
                amount: mintPrice.toString(),
              },
              spender: gameData.contractAddress,
              nonce: nonce,
              deadline: deadline,
            },
          ],
        };
      }

      console.log("📤 Sending transaction...");
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction(transactionPayload);

      console.log("📥 Response:", JSON.stringify(finalPayload, null, 2));

      if (finalPayload.status === "success") {
        console.log("✅ Transaction successful!");
        console.log("🔗 TX ID:", finalPayload.transaction_id);
        
        // Save submission to Supabase via API
        try {
          const response = await fetch('/api/submissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              gameId: gameId, // Use the gameId prop (UUID)
              playerWallet: session?.user?.walletAddress || '', // Player wallet from session
              xCoordinate: coord.x,
              yCoordinate: coord.y,
              txHash: finalPayload.transaction_id,
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log("💾 Submission saved to Supabase:", data.submission?.id);
          } else {
            const errorData = await response.json();
            console.error("⚠️ Failed to save submission:", errorData.error);
          }
        } catch (saveError) {
          console.error("⚠️ Error saving submission:", saveError);
          // Don't fail the transaction if save fails
        }
        
        // Add to local submissions state
        const newSubmission: Submission = {
          id: finalPayload.transaction_id || `sub-${Date.now()}`,
          x: coord.x,
          y: coord.y,
          timestamp: new Date(),
          txHash: finalPayload.transaction_id,
        };
        setSubmissions(prev => [newSubmission, ...prev]);
        
        setTransactionState("success");
        setCoord(null);
        
        // Refresh prize pool
        try {
          const newPool = await publicClient.readContract({
            address: gameData.contractAddress,
            abi: GameABI,
            functionName: "prizePool",
          });
          setPrizePool(newPool as bigint);
        } catch {
          // Silently fail
        }
        
        // Redirect to profile page after a brief delay for user feedback
        setTimeout(() => {
          router.push("/?tab=profile");
        }, 1500);
      } else {
        console.error("❌ Transaction failed:", finalPayload);
        setTransactionState("error");
        setErrorMessage(
          "error_message" in finalPayload 
            ? String(finalPayload.error_message) 
            : "Transaction was rejected"
        );
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setTransactionState("error");
      setErrorMessage(err instanceof Error ? err.message : "Transaction failed");
    }
  }, [coord, gameData.contractAddress, mintPrice, paymentToken, gameId, router, session?.user?.walletAddress]);

  return (
    <div className="flex flex-col min-h-screen bg-game">
      {/* Back Button - Absolute positioned */}
      <div className="absolute top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="w-10 h-10 rounded-xl bg-[hsl(var(--secondary))]/80 backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Tap Instruction - Centered but accounting for back button */}
      <div className="absolute top-4 inset-x-0 flex justify-center z-40 pointer-events-none">
        <div className="glass-card px-4 py-2 text-xs text-[hsl(var(--muted-foreground))]">
          Tap to place your guess
        </div>
      </div>

      {/* Full Canvas Area */}
      <div className="flex-1 px-2 pt-16 pb-4">
        <div className="h-[75vh]">
          <GameImageCanvas
            imageUrl={gameData.imageUrl}
            coord={coord}
            onCoordSelect={handleCoordSelect}
            isDisabled={transactionState === "pending"}
            gameStatus={gameStatus}
          />
        </div>
      </div>

      {/* Bottom Controls */}
      <GameControls
        coord={coord}
        onSubmit={handleSubmit}
        onReset={handleReset}
        mintPrice={mintPrice}
        transactionState={transactionState}
        gameStatus={gameStatus}
        isDisabled={transactionState === "pending"}
        paymentToken={paymentToken}
      />

      {/* Success Toast */}
      {transactionState === "success" && (
        <div className="fixed top-20 left-4 right-4 z-50 animate-slide-down">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-lg">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/30">
              <span className="text-xl">🎯</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-400">Guess Submitted!</p>
             
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {transactionState === "error" && errorMessage && (
        <div className="fixed top-20 left-4 right-4 z-50 animate-slide-down">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/20 border border-red-500/30 backdrop-blur-lg">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/30">
              <span className="text-xl">❌</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-400">Transaction Failed</p>
              <p className="text-xs text-red-400/70 line-clamp-2">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpotTheBallClient;
