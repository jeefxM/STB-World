'use client';

import { Trophy, Coins, Circle } from 'lucide-react';
import { GameStatus, type GameHeaderProps } from './types';

/**
 * GameHeader - Compact header showing prize pool, entry fee, and game status
 * Mobile-first design with icons for scannability
 */
export const GameHeader: React.FC<GameHeaderProps> = ({
  prizePool,
  mintPrice,
  gameStatus,
  paymentToken = null,
  isLoading = false,
}) => {
  // Determine currency name
  const currencyName = 
    !paymentToken || paymentToken === "0x0000000000000000000000000000000000000000" 
      ? "WLD" 
      : "TOKEN";

  // Format ETH value for display
  const formatEth = (value: bigint | null): string => {
    if (value === null) return '—';
    const ethValue = Number(value) / 1e18;
    return ethValue < 0.0001 ? '<0.0001' : ethValue.toFixed(4);
  };

  // Get status display info
  const getStatusInfo = () => {
    switch (gameStatus) {
      case GameStatus.Started:
        return {
          label: 'Live',
          bgColor: 'bg-emerald-500/20',
          borderColor: 'border-emerald-500/40',
          textColor: 'text-emerald-400',
          dotColor: 'bg-emerald-400',
          animate: true,
        };
      case GameStatus.Claim:
        return {
          label: 'Ended',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/40',
          textColor: 'text-red-400',
          dotColor: 'bg-red-400',
          animate: false,
        };
      case GameStatus.Stopped:
        return {
          label: 'Stopped',
          bgColor: 'bg-amber-500/20',
          borderColor: 'border-amber-500/40',
          textColor: 'text-amber-400',
          dotColor: 'bg-amber-400',
          animate: false,
        };
      case GameStatus.NotStarted:
        return {
          label: 'Not Started',
          bgColor: 'bg-slate-500/20',
          borderColor: 'border-slate-500/40',
          textColor: 'text-slate-400',
          dotColor: 'bg-slate-400',
          animate: true,
        };
      default:
        // Fallback for null
        return {
          label: 'Loading',
          bgColor: 'bg-slate-500/20',
          borderColor: 'border-slate-500/40',
          textColor: 'text-slate-400',
          dotColor: 'bg-slate-400',
          animate: false,
        };
    }
  };

  const statusInfo = getStatusInfo();

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/60 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-20 h-5 bg-slate-700 rounded animate-pulse" />
          <div className="w-16 h-5 bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="w-14 h-6 bg-slate-700 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-900/80 to-purple-900/40 border-b border-white/10">
      {/* Prize Pool & Entry Fee */}
      <div className="flex items-center gap-4">
        {/* Prize Pool */}
        <div className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <span className="text-white font-bold text-sm">
            {formatEth(prizePool)}
          </span>
          <span className="text-slate-400 text-xs">{currencyName}</span>
        </div>

        {/* Entry Fee */}
        <div className="flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span className="text-slate-300 text-sm">
            {formatEth(mintPrice)}
          </span>
          <span className="text-slate-400 text-xs">{currencyName} to play</span>
        </div>
      </div>

      {/* Game Status Badge */}
      <div
        className={`
          flex items-center gap-1.5 px-2.5 py-1 rounded-full border
          ${statusInfo.bgColor} ${statusInfo.borderColor}
        `}
      >
        <Circle
          className={`
            w-2 h-2 fill-current ${statusInfo.textColor}
            ${statusInfo.animate ? 'animate-pulse' : ''}
          `}
        />
        <span className={`text-xs font-semibold ${statusInfo.textColor}`}>
          {statusInfo.label}
        </span>
      </div>
    </div>
  );
};

export default GameHeader;
