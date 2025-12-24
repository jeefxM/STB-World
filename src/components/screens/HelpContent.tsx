"use client";

import React, { useState } from "react";
import Image from "next/image";
import { HelpCircle, Target, Coins, Trophy, ChevronRight, X, ExternalLink, TreePine } from "lucide-react";
import { Button } from "@/components/core/ui/Button";

interface HelpStep {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const HelpContent: React.FC = () => {
  const [showAboutModal, setShowAboutModal] = useState(false);

  const steps: HelpStep[] = [
    {
      icon: Coins,
      title: "Pay Submission Price",
      description: "Each guess costs 0.01 WLD which goes into the prize pool",
    },
    {
      icon: Target,
      title: "Make Your Guess",
      description: "Tap on the canvas to place your guess for where the ball is hidden",
    },
    {
      icon: Trophy,
      title: "Prize Winner Found",
      description: "The closest guess to the true position wins the prize pool",
    },
  ];

  return (
    <>
      <div className="flex flex-col min-h-full">
        {/* Header */}
        <div className="px-4 pt-6 pb-4 text-center">
          {/* Logo */}
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <Image
              src="/logo/stb-logo.png"
              alt="Spot The Ball"
              fill
              className="object-contain"
            />
          </div>

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
        <div className="px-4 mt-6">
          <div className="glass-card p-5 border border-[hsl(var(--accent))]/20">
            <h3 className="font-display font-semibold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[hsl(var(--accent))]" />
              Prize Distribution
            </h3>

            <div className="space-y-3">
              {/* Winner takes all */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[hsl(var(--accent))]/20 flex items-center justify-center text-sm font-bold text-[hsl(var(--accent))]">
                    🏆
                  </div>
                  <span className="text-[hsl(var(--foreground))] font-medium">Winner</span>
                </div>
                <span className="font-bold text-[hsl(var(--accent))] text-lg">100% of pool</span>
              </div>
              
              {/* Reforestation note */}
              <div className="pt-3 border-t border-[hsl(var(--border))]">
                <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                  <TreePine className="w-4 h-4 text-emerald-400" />
                  <span>20% of every pool supports global reforestation</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* More Button */}
        <div className="px-4 mt-4">
          <Button
            variant="outline"
            onClick={() => setShowAboutModal(true)}
            className="w-full gap-2"
          >
            <span>More on How It Works</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Support Link */}
        <div className="px-4 mt-4 pb-6 text-center">
          <a
            href="https://t.me/spottheball"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[#1de5d1] transition-colors"
          >
            Support <span className="text-[#1de5d1] font-medium">@spottheball</span>
          </a>
        </div>
      </div>

      {/* About Modal */}
      {showAboutModal && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowAboutModal(false)}
        >
          <div 
            className="relative w-full max-w-lg bg-[hsl(var(--card))] rounded-2xl overflow-hidden border border-[hsl(var(--border))] max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 relative">
                  <Image
                    src="/logo/stb-logo.png"
                    alt="Spot The Ball"
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="font-bold text-[hsl(var(--foreground))]">About Spot The Ball</h3>
              </div>
              <button 
                onClick={() => setShowAboutModal(false)}
                className="w-8 h-8 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center hover:bg-[hsl(var(--accent))] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4 text-[hsl(var(--foreground))]">
                <p className="leading-relaxed">
                  Football is the language of the World! And we are pleased to bring Spot The Ball on-chain first with World and with the goal of supporting global reforestation. <span className="text-emerald-400 font-semibold">20% of every pool goes to reforestation projects around the world.</span>
                </p>
                
                <p className="leading-relaxed">
                  Watching how the World community plays Spot The Ball will inform our roadmap. Ultimately, we want any community to be able to create a game to help them fundraise for what they need.
                </p>
                
                <p className="leading-relaxed">
                  Once our main games (WLD and USDC) reach enough regular users we will shift from manual, time-based game finalisation to an automated numbers based version. Until then the same system of coordinates encryption is in place meaning the winners are not known until the game ends.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[hsl(var(--border))] shrink-0">
              <a
                href="https://docs.google.com/document/d/12Y3QT0eN-7OndzYcvFoRGykvyIkSXp-tUPE1IF-TBAY/edit?tab=t.38z9q8qis19i"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--accent))] transition-colors text-[hsl(var(--foreground))] font-medium"
              >
                <span>Terms & Conditions</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpContent;
