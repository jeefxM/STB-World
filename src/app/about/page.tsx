'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, TreePine, Rocket, Heart } from 'lucide-react';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">About</h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-5 space-y-4 overflow-auto">
        {/* Hero */}
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              spottheball.world
            </span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Win big, support great causes, all in one app.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            A <span className="text-white font-semibold">WORLD</span> where you can win big in your favourite currency,
            in your favourite app, and support great causes at the same time.
          </p>
        </div>

        {/* Coming Soon */}
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-bold text-white">Coming Soon</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Launch your own game with <span className="text-purple-400 font-medium">any token</span> on
            World Chain and support your community or favourite cause.
          </p>
        </div>

        {/* Silvi */}
        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TreePine className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-white">Supporting Silvi</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-3">
            <span className="text-emerald-400 font-medium">Silvi</span> is a multi-country reforestation effort with
            deep "roots" in web3. They have <span className="text-white font-semibold">$100,000</span> in Gitcoin match funding,
            and our inaugural game supports this cause.
          </p>
          <a
            href="https://explorer.gitcoin.co/#/projects"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold text-center rounded-lg transition-colors"
          >
            Learn More About Silvi
          </a>
        </div>
      </div>

      {/* Back Button - Fixed at bottom */}
      <div className="px-5 py-4 border-t border-slate-800">
        <button
          onClick={() => router.back()}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors"
        >
          Back to Games
        </button>
      </div>
    </div>
  );
}
