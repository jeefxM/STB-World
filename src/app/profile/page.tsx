'use client';

import { Profile } from '@/components/Profile';
import { BottomNav } from '@/components/BottomNav';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <Profile />
      <BottomNav />
    </div>
  );
}
