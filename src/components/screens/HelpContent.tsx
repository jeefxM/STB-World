"use client";

import React from "react";
import { HelpCircle, Target, Coins, Trophy, Clock } from "lucide-react";

interface HelpStep {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const HelpContent: React.FC = () => {
  const steps: HelpStep[] = [
    {
      icon: Coins,
      title: "Pay Mint Price",
      description: "Each guess costs 0.01 WLD which goes into the prize pool",
    },
    {
      icon: Target,
      title: "Make Your Guess",
      description: "Tap on the canvas to place your guess for where the ball is hidden",
    },
    {
      icon: Clock,
      title: "Wait for Reveal",
      description: "At the end of each round, the ball location is revealed",
    },
    {
      icon: Trophy,
      title: "Win Prizes",
      description: "Closest guesses win a share of the prize pool!",
    },
  ];

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] px-3 py-1.5 rounded-full text-xs font-medium border border-[hsl(var(--primary))]/20 mb-4">
          <HelpCircle className="w-3 h-3" />
          <span>How It Works</span>
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">
          How to Play
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] text-sm mt-2">
          Simple steps to start winning
        </p>
      </div>

      {/* Steps */}
      <div className="px-4 space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={index}
              className="glass-card p-5 flex items-start gap-4 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon Container */}
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary))]/20 flex items-center justify-center shrink-0 border border-[hsl(var(--primary))]/20">
                <Icon className="w-6 h-6 text-[hsl(var(--primary))]" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-display text-xs text-[hsl(var(--primary))] font-medium">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-[hsl(var(--foreground))] mb-1 text-base">
                  {step.title}
                </h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Prize Distribution */}
      <div className="px-4 mt-6 pb-6">
        <div className="glass-card p-5 border border-[hsl(var(--accent))]/20">
          <h3 className="font-display font-semibold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[hsl(var(--accent))]" />
            Prize Distribution
          </h3>

          <div className="space-y-3">
            {/* 1st Place */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[hsl(var(--accent))]/20 flex items-center justify-center text-xs font-bold text-[hsl(var(--accent))]">
                  1
                </div>
                <span className="text-[hsl(var(--muted-foreground))] text-sm">1st Place</span>
              </div>
              <span className="font-semibold text-[hsl(var(--accent))]">50% of pool</span>
            </div>

            {/* 2nd Place */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center text-xs font-bold text-[hsl(var(--foreground))]">
                  2
                </div>
                <span className="text-[hsl(var(--muted-foreground))] text-sm">2nd Place</span>
              </div>
              <span className="font-semibold text-[hsl(var(--foreground))]">30% of pool</span>
            </div>

            {/* 3rd Place */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center text-xs font-bold text-[hsl(var(--foreground))]">
                  3
                </div>
                <span className="text-[hsl(var(--muted-foreground))] text-sm">3rd Place</span>
              </div>
              <span className="font-semibold text-[hsl(var(--foreground))]">20% of pool</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpContent;
