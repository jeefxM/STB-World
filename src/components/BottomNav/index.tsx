'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Home, Gamepad2, User } from 'lucide-react';

interface BottomNavProps {
  gameId?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ gameId }) => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/',
      
    },
    {
      id: 'games',
      label: 'Games',
      icon: Gamepad2,
      path: gameId ? `/game/${gameId}` : '/game/game-wld',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700">
      <div className="flex items-center justify-around h-20 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center justify-center w-20 h-full transition-all duration-200"
            >
              <Icon 
                className={`w-6 h-6 mb-1.5 transition-all ${active ? 'scale-110' : ''}`} 
                strokeWidth={active ? 2.5 : 2}
                color={active ? '#22d3ee' : '#ffffff'}
              />
              <span className={`text-sm font-medium ${active ? 'text-cyan-400' : 'text-white'}`}>
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-2 w-1.5 h-1.5 bg-cyan-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
