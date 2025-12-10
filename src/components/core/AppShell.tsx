"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Wallet } from "lucide-react";
import { walletAuth } from "@/auth/wallet";
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider";
import { MiniKit, Permission } from "@worldcoin/minikit-js";
import BottomNav from "./BottomNav";
import HomeContent from "@/components/screens/HomeContent";
import LeaderboardScreen from "@/components/screens/LeaderboardScreen";
import ProfileScreen from "@/components/screens/ProfileScreen";
import HelpContent from "@/components/screens/HelpContent";
import { Button } from "./ui/Button";

type TabType = "home" | "profile" | "leaderboard" | "help";

interface GameData {
  imageUrl: string;
  prizePool: string;
  mintPrice: string;
  playerCount: number;
  roundNumber: number;
}

interface AppShellProps {
  initialTab?: TabType;
  gameData?: GameData | null;
}

const AppShell: React.FC<AppShellProps> = ({ initialTab = "home", gameData }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { isInstalled } = useMiniKit();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const hasRequestedNotifications = useRef(false);

  // Handle tab query parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["home", "profile", "leaderboard", "help"].includes(tab)) {
      setActiveTab(tab as TabType);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handlePlay = () => {
    router.push("/game/game-wld");
  };

  // Auto sign-in when not authenticated
  useEffect(() => {
    if (status === "unauthenticated" && isInstalled && !isSigningIn) {
      setIsSigningIn(true);
      walletAuth()
        .catch((error) => console.error("Auto sign-in error:", error))
        .finally(() => setIsSigningIn(false));
    }
  }, [status, isInstalled, isSigningIn]);

  // Request notification permission once when authenticated
  useEffect(() => {
    const requestNotifications = async () => {
      if (
        session && 
        isInstalled && 
        !hasRequestedNotifications.current &&
        MiniKit.isInstalled()
      ) {
        hasRequestedNotifications.current = true;
        
        try {
          const { finalPayload } = await MiniKit.commandsAsync.requestPermission({
            permission: Permission.Notifications,
          });
          
          if (finalPayload.status === "success") {
            console.log("✅ Notification permission granted");
          } else {
            console.log("ℹ️ Notification permission:", finalPayload);
          }
        } catch (error) {
          console.error("Notification permission error:", error);
        }
      }
    };

    // Small delay to let the UI settle before showing permission modal
    const timer = setTimeout(requestNotifications, 2000);
    return () => clearTimeout(timer);
  }, [session, isInstalled]);

  const handleSignIn = async () => {
    if (!isInstalled || isSigningIn) return;
    
    setIsSigningIn(true);
    try {
      await walletAuth();
    } catch (error) {
      console.error("Wallet authentication error:", error);
    } finally {
      setIsSigningIn(false);
    }
  };

  // Loading state while checking session
  if (status === "loading") {
    return (
      <div className="flex flex-col min-h-screen bg-game items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#1de5d1]/20 border-2 border-[#1de5d1]/50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#1de5d1] animate-spin" />
          </div>
          <p className="text-[hsl(var(--muted-foreground))]">Loading...</p>
        </div>
      </div>
    );
  }

  // Not signed in - show sign in screen
  if (!session) {
    return (
      <div className="flex flex-col min-h-screen bg-game items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-sm">
          {/* Logo / Icon */}
          <div className="w-24 h-24 mx-auto rounded-full bg-[#1de5d1]/20 border-2 border-[#1de5d1]/50 flex items-center justify-center">
            <span className="text-5xl">⚽</span>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">
              Spot The Ball
            </h1>
            <p className="text-[hsl(var(--muted-foreground))]">
              Find the hidden ball and win prizes!
            </p>
          </div>

          {/* Sign In Button */}
          <Button
            onClick={handleSignIn}
            disabled={isSigningIn || !isInstalled}
            className="w-full gap-2 bg-[#1de5d1]! text-black! hover:bg-[#1de5d1]/90! disabled:bg-[#1de5d1]/50! py-4 text-lg font-bold"
          >
            {isSigningIn ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                <span>Connect Wallet</span>
              </>
            )}
          </Button>

          {/* Hint */}
          <p className="text-[hsl(var(--muted-foreground))] text-xs">
            Connect your World App wallet to start playing
          </p>
        </div>
      </div>
    );
  }

  // Signed in - show main content
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeContent 
            onPlay={handlePlay}
            imageUrl={gameData?.imageUrl}
            prizePool={gameData?.prizePool || "2.5"}
            mintPrice={gameData?.mintPrice || "0.01"}
            playerCount={gameData?.playerCount || 156}
            roundNumber={gameData?.roundNumber || 42}
          />
        );
      case "leaderboard":
        return <LeaderboardScreen />;
      case "profile":
        return <ProfileScreen />;
      case "help":
        return <HelpContent />;
      default:
        return (
          <HomeContent 
            onPlay={handlePlay}
            imageUrl={gameData?.imageUrl}
          />
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-game">
      {/* Main Content - Above bottom nav */}
      <div className="flex-1 flex flex-col pb-24 overflow-y-auto">
        {renderContent()}
      </div>

      {/* Bottom Navigation - Always visible */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default AppShell;
