'use client';

import { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, ExternalLink, PartyPopper, X } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
  transactionHash: string | null;
}

// Confetti particle component
const ConfettiParticle: React.FC<{
  color: string;
  delay: number;
  left: number;
}> = ({ color, delay, left }) => (
  <div
    className="absolute w-2 h-2 rounded-sm opacity-0 animate-bounce"
    style={{
      backgroundColor: color,
      left: `${left}%`,
      top: '40%',
      animationDelay: `${delay}ms`,
      animationDuration: '1s',
      animationFillMode: 'forwards',
    }}
  />
);

/**
 * SuccessModal - Full-screen celebration overlay on successful submission
 * Features:
 * - Celebration animation with confetti
 * - "Guess Submitted!" message
 * - Link to view transaction on explorer
 * - "Play Again" button
 * - Auto-dismiss after 5 seconds OR manual close
 */
export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  onPlayAgain,
  transactionHash,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Handle modal open/close animations
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Trigger confetti after a short delay
      const confettiTimer = setTimeout(() => setShowConfetti(true), 200);
      return () => clearTimeout(confettiTimer);
    } else {
      setIsAnimating(false);
      setShowConfetti(false);
    }
  }, [isOpen]);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!isOpen) return;

    const dismissTimer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(dismissTimer);
  }, [isOpen, onClose]);

  // Handle play again
  const handlePlayAgain = useCallback(() => {
    onPlayAgain();
    onClose();
  }, [onPlayAgain, onClose]);

  // Explorer URL
  const explorerUrl = transactionHash
    ? `https://worldchain-mainnet.explorer.alchemy.com/tx/${transactionHash}`
    : null;

  // Confetti colors
  const confettiColors = [
    '#10B981', // emerald
    '#8B5CF6', // violet
    '#F59E0B', // amber
    '#EC4899', // pink
    '#3B82F6', // blue
    '#EF4444', // red
  ];

  if (!isOpen) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50
        flex items-center justify-center
        bg-slate-950/90 backdrop-blur-md
        transition-opacity duration-300
        ${isAnimating ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={onClose}
    >
      {/* Confetti container */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 24 }).map((_, i) => (
            <ConfettiParticle
              key={i}
              color={confettiColors[i % confettiColors.length]}
              delay={i * 50}
              left={Math.random() * 100}
            />
          ))}
        </div>
      )}

      {/* Modal Content */}
      <div
        className={`
          relative
          bg-gradient-to-b from-slate-900 to-slate-950
          border border-white/10
          rounded-3xl
          p-8
          mx-4
          max-w-sm w-full
          shadow-2xl shadow-emerald-500/20
          transition-all duration-300
          ${isAnimating ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4
            w-8 h-8
            flex items-center justify-center
            rounded-full
            bg-slate-800/80
            text-slate-400
            hover:text-white hover:bg-slate-700
            transition-colors
          "
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="
              relative
              w-20 h-20
              bg-emerald-500/10
              rounded-full
              flex items-center justify-center
              ring-2 ring-emerald-500/30
            "
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl" />

            <CheckCircle2 className="w-10 h-10 text-emerald-400 relative z-10" />

            {/* Party icon */}
            <div className="absolute -top-1 -right-1">
              <PartyPopper className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Guess Submitted!
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your coordinates have been recorded on the blockchain. Good luck!
          </p>
        </div>

        {/* Transaction Link */}
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex items-center justify-center gap-2
              w-full
              py-3 px-4
              mb-4
              rounded-xl
              bg-emerald-500/10
              border border-emerald-500/20
              text-emerald-400 text-sm font-medium
              hover:bg-emerald-500/20
              transition-colors
            "
          >
            <ExternalLink className="w-4 h-4" />
            <span>View on Explorer</span>
          </a>
        )}

        {/* Play Again Button */}
        <button
          onClick={handlePlayAgain}
          className="
            w-full
            py-4 px-6
            rounded-xl
            bg-gradient-to-r from-emerald-500 to-green-500
            text-white font-semibold text-base
            shadow-lg shadow-emerald-500/30
            hover:from-emerald-400 hover:to-green-400
            active:scale-[0.98]
            transition-all duration-200
          "
        >
          Play Again
        </button>

        {/* Auto-dismiss indicator */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse" />
          <span className="text-slate-500 text-xs">Auto-closing in 5s</span>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
