"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPublicClient, http } from "viem";
import { worldchain } from "viem/chains";
import { MiniKit } from "@worldcoin/minikit-js";

import GameABI from "@/abi/gameABI";

import { GameHeader } from "./GameHeader";
import { GameImageCanvas } from "./GameImageCanvas";
import { GameControls } from "./GameControls";
import { BottomNav } from "@/components/BottomNav";
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

interface SpotTheBallClientProps {
  gameId: string;
  initialGameData: GameData;
}

/**
 * Client component that receives pre-fetched game data from the server
 * Only fetches contract data client-side (needs to be real-time)
 */
export const SpotTheBallClient: React.FC<SpotTheBallClientProps> = ({ 
  gameId, 
  initialGameData 
}) => {
  // Use pre-fetched data immediately - no loading state needed for Supabase!
  const [gameData] = useState<GameData>(initialGameData);

  const [mintPrice, setMintPrice] = useState<bigint | null>(null);
  const [prizePool, setPrizePool] = useState<bigint | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus | null>(null);
  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  const [isLoadingContract, setIsLoadingContract] = useState(true);

  const [coord, setCoord] = useState<Coordinate | null>(null);
  const [transactionState, setTransactionState] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const hasLoadedContractData = useRef(false);

  // Fetch contract data (this still needs to be client-side for real-time data)
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
  }, []);

  const handleReset = useCallback(() => {
    setCoord(null);
    setTransactionState("idle");
    setErrorMessage("");
  }, []);

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
        // NATIVE ETH PAYMENT - Simple play() call with value
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
        // ERC20 PAYMENT WITH PERMIT2 - MiniKit handles the signature!
        console.log("🔵 Using Permit2 for ERC20 payment");
        
        const nonce = Date.now().toString();
        const deadline = Math.floor((Date.now() + 30 * 60 * 1000) / 1000).toString(); // 30 min from now

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
                "PERMIT2_SIGNATURE_PLACEHOLDER_0", // MiniKit replaces this!
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

        console.log("📝 Permit2 config:", {
          token: paymentToken,
          amount: mintPrice.toString(),
          spender: gameData.contractAddress,
          nonce,
          deadline,
        });
      }

      console.log("📤 Sending transaction...");
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction(transactionPayload);

      console.log("📥 Response:", JSON.stringify(finalPayload, null, 2));

      if (finalPayload.status === "success") {
        console.log("✅ Transaction successful!");
        console.log("🔗 TX ID:", finalPayload.transaction_id);
        setTransactionState("success");
        setCoord(null);
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
  }, [coord, gameData.contractAddress, mintPrice, paymentToken]);

  return (
    <div className="relative bg-slate-950 flex flex-col min-h-screen pb-24">
      <GameHeader
        prizePool={prizePool}
        mintPrice={mintPrice}
        gameStatus={gameStatus}
        paymentToken={paymentToken}
        isLoading={isLoadingContract}
      />

      <GameImageCanvas
        imageUrl={gameData.imageUrl}
        coord={coord}
        onCoordSelect={handleCoordSelect}
        isDisabled={transactionState === "pending"}
        gameStatus={gameStatus}
      />

      <GameControls
        coord={coord}
        onSubmit={handleSubmit}
        onReset={handleReset}
        mintPrice={mintPrice}
        transactionState={transactionState}
        gameStatus={gameStatus}
        isDisabled={transactionState === "pending"}
      />

      {/* Bottom Navigation */}
      <BottomNav gameId={gameId} />
    </div>
  );
};

export default SpotTheBallClient;
