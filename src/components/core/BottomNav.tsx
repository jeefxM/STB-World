import React from "react";
import { Home, User, Trophy, HelpCircle } from "lucide-react";
import { Button } from "./ui/Button";

interface BottomNavProps {
  activeTab: "home" | "profile" | "leaderboard" | "help";
  onTabChange: (tab: "home" | "profile" | "leaderboard" | "help") => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: "home" as const, icon: Home, label: "Home" },
    // { id: "leaderboard" as const, icon: Trophy, label: "Ranks" }, // TODO: Uncomment when leaderboard is ready
    { id: "profile" as const, icon: User, label: "Profile" },
    { id: "help" as const, icon: HelpCircle, label: "Help" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto px-4 pb-6 pt-2">
        <div className="glass-card rounded-2xl p-2 flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "navActive" : "nav"}
                size="icon"
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center h-14 w-16 gap-1 rounded-xl transition-all duration-200 ${
                  isActive ? "scale-105" : ""
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-[#1de5d1]" : ""}`} />
                <span className={`text-[10px] font-medium ${isActive ? "text-[#1de5d1]" : ""}`}>
                  {item.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
