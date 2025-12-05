'use client';

import { LandingPage } from '@/components/LandingPage';
import { AuthButton } from '@/components/AuthButton';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-purple-500 animate-spin"></div>
          <p className="text-slate-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center space-y-8">
        <div className="space-y-4">
          <div className="w-24 h-24 bg-black text-white text-6xl rounded-2xl flex items-center justify-center mx-auto shadow-xl">
            🎯
          </div>
          <h1 className="text-4xl font-bold text-black tracking-tight">
            Spot the Ball
          </h1>
          <p className="text-gray-500 max-w-xs mx-auto">
            Test your skills and win prizes on Worldchain. Sign in to start playing.
          </p>
        </div>
        
        <div className="w-full max-w-xs">
          <AuthButton />
        </div>

        <div className="text-xs text-gray-400">
          Powered by World ID
        </div>
      </div>
    );
  }

  return <LandingPage />;
}
