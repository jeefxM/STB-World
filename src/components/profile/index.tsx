"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Marble } from "@worldcoin/mini-apps-ui-kit-react";
import { 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle,
  ChevronRight,
  User,
  X,
  TreePine,
  Play
} from "lucide-react";
import { Button } from "@/components/core/ui/Button";

interface Submission {
  id: string;
  game_id: string;
  player_wallet: string;
  x_coordinate: number;
  y_coordinate: number;
  tx_hash: string | null;
  created_at: string;
  game_status?: string;
  game_name?: string;
  game_image_url?: string;
  prize_won?: string;
}

interface ProfileStats {
  totalGuesses: number;
  wins: number;
  wldWon: number;
}

export const Profile = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<ProfileStats>({ totalGuesses: 0, wins: 0, wldWon: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // Calculate total contribution (each guess = 0.01 WLD, 20% goes to Silvia)
  const totalContribution = (stats.totalGuesses * 0.01 * 0.2).toFixed(3);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!session?.user?.walletAddress) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/submissions?playerWallet=${session.user.walletAddress}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setSubmissions(data.submissions || []);
          
          const totalGuesses = data.submissions?.length || 0;
          const wins = 0;
          const wldWon = 0;
          
          setStats({ totalGuesses, wins, wldWon });
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [session]);

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  const getStatusStyle = (submission: Submission) => {
    const status = submission.game_status?.toLowerCase() || "active";
    const prizeWon = submission.prize_won;

    if (prizeWon && parseFloat(prizeWon) > 0) {
      return {
        icon: <CheckCircle className="w-5 h-5" />,
        bg: "bg-emerald-500/20",
        border: "border-emerald-500/50",
        iconColor: "text-emerald-400",
      };
    } else if (status === "active" || status === "started") {
      return {
        icon: <Clock className="w-5 h-5" />,
        bg: "bg-amber-500/20",
        border: "border-amber-500/50",
        iconColor: "text-amber-400",
      };
    } else {
      return {
        icon: <XCircle className="w-5 h-5" />,
        bg: "bg-red-500/20",
        border: "border-red-500/50",
        iconColor: "text-red-400",
      };
    }
  };

  return (
    <>
      <div className="flex flex-col h-full p-4 space-y-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1de5d1] flex items-center justify-center overflow-hidden">
            {session?.user?.profilePictureUrl ? (
              <Marble
                src={session.user.profilePictureUrl}
                className="w-full h-full"
              />
            ) : (
              <User className="w-8 h-8 text-black" />
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">
              {session?.user?.username || "Player"}
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] text-sm font-mono">
              {session?.user?.walletAddress
                ? `${session.user.walletAddress.slice(0, 6)}...${session.user.walletAddress.slice(-4)}`
                : "Not connected"}
            </p>
          </div>
        </div>

        {/* Silvia Contribution Card */}
        {stats.totalGuesses > 0 && (
          <div className="glass-card p-4 border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <TreePine className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[hsl(var(--foreground))]">
                  You contributed <span className="font-bold text-emerald-400">{totalContribution} WLD</span> to Silvia
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Supporting global reforestation 🌍
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Play Current Game Button */}
        <Button
          onClick={() => router.push("/game/game-wld")}
          className="w-full gap-2 bg-[#1de5d1]! text-black! hover:bg-[#1de5d1]/90!"
        >
          <Play className="w-5 h-5 fill-current" />
          <span className="font-bold">Play This Week&apos;s Game</span>
        </Button>

        {/* Your Guesses Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">
              Your Guesses
            </h3>
            <span className="text-sm text-[hsl(var(--muted-foreground))]">
              {stats.totalGuesses} total
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pb-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 rounded-full border-2 border-[hsl(var(--secondary))] border-t-[#1de5d1] animate-spin mb-3" />
                <p className="text-[hsl(var(--muted-foreground))] text-sm">Loading...</p>
              </div>
            ) : submissions.length > 0 ? (
              submissions.map((submission) => {
                const statusStyle = getStatusStyle(submission);
                return (
                  <button
                    key={submission.id}
                    onClick={() => setSelectedSubmission(submission)}
                    className="w-full glass-card p-4 flex items-center gap-4 text-left hover:bg-[hsl(var(--accent))]/10 transition-colors cursor-pointer"
                  >
                    {/* Status Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border ${statusStyle.bg} ${statusStyle.border}`}
                    >
                      <span className={statusStyle.iconColor}>
                        {statusStyle.icon}
                      </span>
                    </div>

                    {/* Coordinates & Time */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-[hsl(var(--foreground))]">
                          ({submission.x_coordinate}, {submission.y_coordinate})
                        </p>
                        {submission.prize_won && parseFloat(submission.prize_won) > 0 && (
                          <span className="text-emerald-400 text-sm font-semibold">
                            +{submission.prize_won} WLD
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        {getRelativeTime(submission.created_at)}
                      </p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                  </button>
                );
              })
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-[hsl(var(--secondary))] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
                </div>
                <p className="text-[hsl(var(--foreground))] font-medium">No guesses yet</p>
                <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">
                  Start playing to see your guesses here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <SubmissionDetailModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          getRelativeTime={getRelativeTime}
        />
      )}
    </>
  );
};

// Separate component for the modal to handle image loading
const SubmissionDetailModal: React.FC<{
  submission: Submission;
  onClose: () => void;
  getRelativeTime: (dateString: string) => string;
}> = ({ submission, onClose, getRelativeTime }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const [imageDimensions, setImageDimensions] = useState<{
    natural: { width: number; height: number };
    rendered: { width: number; height: number };
    offset: { x: number; y: number };
  } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Calculate dimensions when image loads
  const handleImageLoad = () => {
    if (!imgRef.current || !containerRef.current) return;

    const img = imgRef.current;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    const imageAspect = naturalWidth / naturalHeight;
    const containerAspect = containerWidth / containerHeight;

    let renderWidth: number;
    let renderHeight: number;
    let offsetX: number;
    let offsetY: number;

    if (imageAspect > containerAspect) {
      renderWidth = containerWidth;
      renderHeight = containerWidth / imageAspect;
      offsetX = 0;
      offsetY = (containerHeight - renderHeight) / 2;
    } else {
      renderHeight = containerHeight;
      renderWidth = containerHeight * imageAspect;
      offsetX = (containerWidth - renderWidth) / 2;
      offsetY = 0;
    }

    setImageDimensions({
      natural: { width: naturalWidth, height: naturalHeight },
      rendered: { width: renderWidth, height: renderHeight },
      offset: { x: offsetX, y: offsetY },
    });
    setImageLoaded(true);
  };

  // Calculate crosshair position
  const getCrosshairPosition = () => {
    if (!imageDimensions) return { left: '50%', top: '50%' };

    const { natural, rendered, offset } = imageDimensions;
    
    // Calculate position within rendered image
    const xPercent = submission.x_coordinate / natural.width;
    const yPercent = submission.y_coordinate / natural.height;
    
    const left = offset.x + (xPercent * rendered.width);
    const top = offset.y + (yPercent * rendered.height);

    return { left: `${left}px`, top: `${top}px` };
  };

  const crosshairPos = getCrosshairPosition();

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-[hsl(var(--card))] rounded-2xl overflow-hidden border border-[hsl(var(--border))]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
          <div>
            <h3 className="font-bold text-[hsl(var(--foreground))]">Your Guess</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              ({submission.x_coordinate}, {submission.y_coordinate})
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center hover:bg-[hsl(var(--accent))] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Image with Crosshair */}
        <div 
          ref={containerRef}
          className="relative aspect-square bg-[hsl(var(--secondary))]"
        >
          {submission.game_image_url ? (
            <>
              <img
                ref={imgRef}
                src={submission.game_image_url}
                alt="Game"
                className="absolute inset-0 w-full h-full object-contain"
                onLoad={handleImageLoad}
              />
              
              {/* Crosshair Overlay */}
              {imageLoaded && imageDimensions && (
                <div 
                  className="absolute pointer-events-none z-10"
                  style={{
                    left: crosshairPos.left,
                    top: crosshairPos.top,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {/* Crosshair horizontal line */}
                  <div 
                    className="absolute bg-[#1de5d1] shadow-lg"
                    style={{ width: '40px', height: '3px', left: '-20px', top: '-1.5px' }}
                  />
                  {/* Crosshair vertical line */}
                  <div 
                    className="absolute bg-[#1de5d1] shadow-lg"
                    style={{ width: '3px', height: '40px', left: '-1.5px', top: '-20px' }}
                  />
                  
                  {/* Center circle */}
                  <div 
                    className="absolute w-5 h-5 rounded-full border-3 border-[#1de5d1] bg-[#1de5d1]/30"
                    style={{ left: '-10px', top: '-10px', boxShadow: '0 0 20px rgba(29, 229, 209, 0.6)' }}
                  />
                  
                  {/* Pulsing ring */}
                  <div 
                    className="absolute w-8 h-8 rounded-full border-2 border-[#1de5d1] animate-ping opacity-50"
                    style={{ left: '-16px', top: '-16px' }}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-[hsl(var(--muted-foreground))]">Image not available</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[hsl(var(--border))] space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[hsl(var(--muted-foreground))]">
              {getRelativeTime(submission.created_at)}
            </span>
            {submission.game_name && (
              <span className="text-[hsl(var(--foreground))] font-medium">
                {submission.game_name}
              </span>
            )}
          </div>
          
          {/* Play Again Button for this specific game */}
          <a
            href={`/game/game-wld`}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#1de5d1] text-black font-bold hover:bg-[#1de5d1]/90 transition-colors"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Play Again</span>
          </a>
        </div>
      </div>
    </div>
  );
};

