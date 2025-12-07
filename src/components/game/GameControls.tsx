"use client";

import { Loader2, Send, Crosshair } from "lucide-react";
import { GameStatus, type Coordinate } from "./types";
import { Button } from "@/components/core/ui/Button";

interface GameControlsProps {
  coord: Coordinate | null;
  onSubmit: () => void;
  onReset: () => void;
  mintPrice: bigint | null;
  transactionState: "idle" | "pending" | "success" | "error";
  gameStatus: GameStatus | null;
  isDisabled: boolean;
  paymentToken?: string | null;
}

export const GameControls: React.FC<GameControlsProps> = ({
  coord,
  onSubmit,
  onReset,
  mintPrice,
  transactionState,
  gameStatus,
  isDisabled,
  paymentToken,
}) => {
  const isGameActive = gameStatus === GameStatus.Started;
  const hasSelection = coord !== null;
  const isPending = transactionState === "pending";
  const canSubmit = hasSelection && isGameActive && !isPending && !isDisabled;

  // Show nothing if game is not active
  if (!isGameActive) {
    return null;
  }

  return (
    <div className="px-4 pb-8 flex items-center gap-3 animate-slide-up">
      {/* Coordinates Display - Compact */}
      {hasSelection ? (
        <div className="glass-card px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary))]/20 flex items-center justify-center">
            <Crosshair className="w-5 h-5 text-[hsl(var(--primary))]" />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">X</p>
              <p className="font-display font-bold text-lg text-[hsl(var(--foreground))]">{coord.x}</p>
            </div>
            <div className="w-px h-8 bg-[hsl(var(--border))]" />
            <div className="text-center">
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Y</p>
              <p className="font-display font-bold text-lg text-[hsl(var(--foreground))]">{coord.y}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--secondary))] flex items-center justify-center">
            <Crosshair className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Tap to guess</p>
        </div>
      )}

      {/* Submit Button - More prominent */}
      <Button
        size="lg"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="flex-1 gap-2 bg-[#1de5d1]! text-black! hover:bg-[#1de5d1]/90! disabled:bg-[#1de5d1]/50!"
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span className="font-bold tracking-wide">SUBMIT</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default GameControls;
