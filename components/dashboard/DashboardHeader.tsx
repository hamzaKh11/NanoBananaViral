import React from "react";
import { Layers, LogOut } from "lucide-react";
import { Button } from "../ui/Button"; // path fixed: sibling folder

interface DashboardHeaderProps {
  user: any;
  onBack: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  onBack,
}) => {
  return (
    <header className="h-16 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 shadow-sm z-50 sticky top-0 shrink-0">
      <div className="flex items-center gap-4">
        <span className="font-display font-black text-xl tracking-tight block">
          Banana<span className="text-brand-yellow">Studio</span>
        </span>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="outline"
            className="h-9 px-3 text-xs"
            onClick={() =>
              window.open(
                "https://bananaviral.lemonsqueezy.com/billing",
                "_blank"
              )
            }
          >
            Manage Plan
          </Button>
        </div>
        <div
          className={`px-3 py-1 rounded-full border flex items-center gap-2 ${
            user.credits < 5
              ? "bg-red-100 border-red-200 dark:bg-red-900/20"
              : "bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10"
          }`}
        >
          <Layers
            size={14}
            className={user.credits < 5 ? "text-red-500" : "text-gray-500"}
          />
          <span
            className={`font-black ${
              user.credits < 5 ? "text-red-600" : "text-brand-yellow"
            }`}
          >
            {user.credits}
          </span>
        </div>
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-brand-yellow flex items-center justify-center text-black font-bold border-2 border-black">
          {(user.email?.[0] || "U").toUpperCase()}
        </div>
        <button
          onClick={onBack}
          className="p-2 bg-gray-100 dark:bg-zinc-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-300 hover:text-red-600 transition-colors rounded-full"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};
