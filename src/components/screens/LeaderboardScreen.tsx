"use client";

import React from "react";
import { Trophy, Medal, Crown } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  username: string;
  wins: number;
  totalPrize: string;
}

const LeaderboardScreen: React.FC = () => {
  // Mock data - replace with actual data fetching
  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, username: "CryptoKing", wins: 12, totalPrize: "45.5 WLD" },
    { rank: 2, username: "BallFinder", wins: 9, totalPrize: "32.1 WLD" },
    { rank: 3, username: "LuckyGuesser", wins: 7, totalPrize: "24.8 WLD" },
    { rank: 4, username: "ProPlayer", wins: 5, totalPrize: "18.2 WLD" },
    { rank: 5, username: "SharpEye", wins: 4, totalPrize: "12.5 WLD" },
    { rank: 6, username: "Winner2024", wins: 3, totalPrize: "9.1 WLD" },
    { rank: 7, username: "GameMaster", wins: 2, totalPrize: "5.4 WLD" },
    { rank: 8, username: "NewPlayer", wins: 1, totalPrize: "2.5 WLD" },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-[hsl(var(--accent))]" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return (
          <span className="text-[hsl(var(--muted-foreground))] font-mono text-sm">
            #{rank}
          </span>
        );
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-[hsl(var(--accent))]/10 border-[hsl(var(--accent))]/30";
      case 2:
        return "bg-slate-400/10 border-slate-400/30";
      case 3:
        return "bg-amber-600/10 border-amber-600/30";
      default:
        return "bg-[hsl(var(--secondary))] border-[hsl(var(--border))]";
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] px-3 py-1.5 rounded-full text-xs font-medium border border-[hsl(var(--accent))]/20 mb-4">
          <Trophy className="w-3 h-3" />
          <span>Top Players</span>
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">
          Leaderboard
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] text-sm mt-2">
          See who&apos;s winning the most
        </p>
      </div>

      {/* Leaderboard List */}
      <div className="flex-1 px-4 space-y-3 pb-6">
        {leaderboard.map((entry) => (
          <div
            key={entry.rank}
            className={`glass-card p-4 flex items-center gap-4 border ${getRankStyle(
              entry.rank
            )} animate-slide-up`}
            style={{ animationDelay: `${entry.rank * 50}ms` }}
          >
            {/* Rank Icon */}
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--secondary))] flex items-center justify-center">
              {getRankIcon(entry.rank)}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[hsl(var(--foreground))] truncate">
                {entry.username}
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {entry.wins} wins
              </p>
            </div>

            {/* Prize */}
            <div className="text-right">
              <p className="font-semibold text-[hsl(var(--accent))]">
                {entry.totalPrize}
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Total won
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardScreen;
