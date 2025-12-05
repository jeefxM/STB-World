'use client';

import { Loader2, Zap, RotateCcw, Target } from 'lucide-react';
import { GameStatus, type TransactionState, type Coordinate } from './types';

interface GameControlsProps {
  coord: Coordinate | null;
  onSubmit: () => void;
  onReset: () => void;
  mintPrice: bigint | null;
  transactionState: TransactionState;
  gameStatus: GameStatus | null;
  isDisabled: boolean;
}

/**
 * GameControls - Inline control bar with submit and reset buttons
 * NOT fixed - renders inline to avoid conflicts with page navigation
 * Features:
 * - Large, thumb-friendly touch targets (min 44px)
 * - Shows entry fee on submit button
 * - Real-time coordinate display
 * - Loading states during transaction
 */
export const GameControls: React.FC<GameControlsProps> = ({
  coord,
  onSubmit,
  onReset,
  mintPrice,
  transactionState,
  gameStatus,
  isDisabled,
}) => {
  // Format ETH value for display
  const formatEth = (value: bigint | null): string => {
    if (value === null) return '—';
    const ethValue = Number(value) / 1e18;
    return ethValue < 0.0001 ? '<0.0001' : ethValue.toFixed(4);
  };

  // Determine button states
  const isGameActive = gameStatus === GameStatus.Started;
  const isTransacting = transactionState === 'pending' || transactionState === 'confirming';
  const canSubmit = coord && isGameActive && !isTransacting && !isDisabled && mintPrice;
  const canReset = coord && !isTransacting;

  // Get submit button content based on state
  const getSubmitButtonContent = () => {
    if (transactionState === 'pending') {
      return (
        <>
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Submitting...</span>
        </>
      );
    }

    if (transactionState === 'confirming') {
      return (
        <>
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Confirming...</span>
        </>
      );
    }

    if (!isGameActive) {
      return <span>Game Ended</span>;
    }

    if (!coord) {
      return <span>Select Position First</span>;
    }

    return <span>Submit Guess - 2 $WLD</span>;
  };

  return (
    <div
      className="
        bg-slate-900/95 backdrop-blur-lg
        border-t border-white/10
        px-4 py-3
      "
    >
      {/* Coordinate Display */}
      {coord && (
        <div className="flex items-center justify-center gap-2 mb-3">
          <div
            className="
              flex items-center gap-2
              bg-slate-800/80 rounded-full
              px-3 py-1.5
              border border-white/5
            "
          >
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400 text-xs font-medium">Position:</span>
            <span className="text-white text-xs font-mono">
              X: {coord.x}, Y: {coord.y}
            </span>
          </div>
        </div>
      )}

      {/* Button Row */}
      <div className="flex items-center gap-3">
        {/* Reset Button - Secondary */}
        <button
          onClick={onReset}
          disabled={!canReset}
          className={`
            flex items-center justify-center
            min-h-[48px] px-4
            rounded-xl
            font-medium text-sm
            transition-all duration-200
            active:scale-95
            ${
              canReset
                ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                : 'bg-slate-800/50 text-slate-600 border border-slate-800 cursor-not-allowed'
            }
          `}
          aria-label="Reset selection"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Submit Button - Primary - Bright Green CTA */}
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          style={{
            background: canSubmit
              ? 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)'
              : '#334155',
            boxShadow: canSubmit
              ? '0 10px 40px rgba(34, 197, 94, 0.5), 0 0 0 3px rgba(34, 197, 94, 0.3)'
              : 'none',
          }}
          className={`
            flex-1 flex items-center justify-center gap-2.5
            min-h-[64px] px-6
            rounded-2xl
            font-extrabold text-xl
            uppercase tracking-wide
            transition-all duration-200
            active:scale-[0.97]
            border-2
            ${canSubmit ? 'text-white border-green-400' : 'text-slate-500 border-slate-600 cursor-not-allowed'}
            ${isTransacting ? '!bg-purple-600 !border-purple-400' : ''}
          `}
          aria-label={isTransacting ? 'Transaction in progress' : 'Submit guess'}
        >
          {getSubmitButtonContent()}
        </button>
      </div>

      {/* Transaction Status Message */}
      {isTransacting && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-purple-300 text-xs">
            {transactionState === 'pending'
              ? 'Waiting for wallet...'
              : 'Waiting for blockchain confirmation...'}
          </span>
        </div>
      )}
    </div>
  );
};

export default GameControls;
