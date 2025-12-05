"use client";

import { Marble } from "@worldcoin/mini-apps-ui-kit-react";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ExternalLink, Trophy, Clock, XCircle } from "lucide-react";

interface Game {
  id: number;
  game_id: string;
  name: string;
  date: string;
  status: string;
  prize: string;
}

export const Profile = () => {
  const { data: session } = useSession();
  const [previousGames, setPreviousGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const { data, error } = await supabase
          .from("games")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) {
          console.error("Error fetching games:", error);
        } else {
          setPreviousGames(
            data?.map((game: any) => ({
              id: game.id,
              game_id: game.game_id,
              name: game.name || `Game #${game.id}`,
              date: new Date(game.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              status: game.status || "Pending",
              prize: game.prize || "—",
            })) || []
          );
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, [session]);

  // Get status styling
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "won":
        return {
          bg: "bg-emerald-500/20",
          border: "border-emerald-500/40",
          text: "text-emerald-400",
          icon: <Trophy className="w-3 h-3" />,
        };
      case "pending":
      case "active":
        return {
          bg: "bg-amber-500/20",
          border: "border-amber-500/40",
          text: "text-amber-400",
          icon: <Clock className="w-3 h-3" />,
        };
      default:
        return {
          bg: "bg-slate-500/20",
          border: "border-slate-500/40",
          text: "text-slate-400",
          icon: <XCircle className="w-3 h-3" />,
        };
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 p-4">
      {/* Profile Header */}
      <div className="text-center space-y-3 flex flex-col items-center pt-4">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center overflow-hidden border-2 border-purple-500/50 bg-slate-800">
          {session?.user?.profilePictureUrl ? (
            <Marble
              src={session.user.profilePictureUrl}
              className="w-full h-full"
            />
          ) : (
            <span className="text-4xl">👤</span>
          )}
        </div>

        {/* Username */}
        <h2 className="text-2xl font-bold text-white">
          {session?.user?.username || "Player"}
        </h2>

        {/* Wallet Address */}
        <p className="text-slate-400 text-xs font-mono bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
          {session?.user?.walletAddress
            ? `${session.user.walletAddress.slice(0, 6)}...${session.user.walletAddress.slice(-4)}`
            : "Not connected"}
        </p>
      </div>

      {/* Create Game Button */}
      <div>
        <a
          href="https://spottheball.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex items-center justify-center gap-2
            w-full py-4 px-6
            bg-gradient-to-r from-purple-600 to-violet-600
            hover:from-purple-500 hover:to-violet-500
            text-white font-semibold text-base
            rounded-xl
            shadow-lg shadow-purple-500/25
            transition-all duration-200
            active:scale-[0.98]
          "
        >
          <span>Create New Game</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Previous Games */}
      <div className="flex-1">
        <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-slate-700">
          Previous Games
        </h3>

        <div className="space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-purple-500 animate-spin mb-3" />
              <p className="text-slate-500 text-sm">Loading history...</p>
            </div>
          ) : previousGames.length > 0 ? (
            previousGames.map((game) => {
              const statusStyle = getStatusStyle(game.status);
              return (
                <div
                  key={game.id}
                  className="
                    bg-slate-800/50
                    border border-slate-700/50
                    p-4 rounded-xl
                    flex items-center justify-between
                  "
                >
                  {/* Left side - Game info */}
                  <div className="space-y-1">
                    <p className="font-semibold text-white">{game.name}</p>
                    <p className="text-sm text-slate-400">{game.date}</p>
                  </div>

                  {/* Right side - Status & Prize */}
                  <div className="text-right space-y-1.5">
                    <span
                      className={`
                        inline-flex items-center gap-1.5
                        px-2.5 py-1
                        text-xs font-semibold
                        rounded-full
                        border
                        ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}
                      `}
                    >
                      {statusStyle.icon}
                      {game.status}
                    </span>
                    {game.prize !== "—" && (
                      <p className="text-sm font-mono text-slate-300">
                        {game.prize}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-400 font-medium">No games played yet</p>
              <p className="text-slate-500 text-sm mt-1">
                Start playing to see your history here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
