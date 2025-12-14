import React, { useState, useRef, useEffect } from "react";
import {
  Layers,
  LogOut,
  CreditCard,
  ChevronDown,
  User,
  Sparkles,
  Settings,
  Menu,
} from "lucide-react";
import { Button } from "../ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for clean classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DashboardHeaderProps {
  user: any;
  onBack: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  onBack,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleManagePlan = () => {
    // Ensure "Customer Portal" is enabled in Lemon Squeezy Settings -> Store
    window.open("https://bananaviral.lemonsqueezy.com/billing", "_blank");
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    onBack();
  };

  const userInitials = (user.email?.[0] || "U").toUpperCase();
  const isLowCredits = user.credits < 5;

  return (
    <header className="sticky top-0 z-50 w-full h-16 border-b border-gray-200/50 dark:border-white/5 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl transition-all">
      <div className="h-full max-w-screen-2xl mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-2 group cursor-pointer">
          <img
            src="/logo.png"
            alt="BananaViral Logo"
            className="w-8 h-8 md:w-8 md:h-8 rounded-xl shadow-lg transform rotate-3 border-2 border-black object-cover bg-brand-yellow"
          />
          <span className="font-display font-black text-lg tracking-tight text-gray-900 dark:text-white">
            Banana<span className="text-brand-yellow">Viral</span>
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Desktop Manage Plan Button (Hidden on Mobile) */}
          <div className="hidden md:block">
            <Button
              variant="outline"
              onClick={handleManagePlan}
              className="h-9 px-4 text-xs font-bold border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800"
            >
              Manage Plan
            </Button>
          </div>

          {/* Credits Badge */}
          <div
            className={cn(
              "h-9 px-3 rounded-full border flex items-center gap-2 transition-all select-none",
              isLowCredits
                ? "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30"
                : "bg-gray-50/50 dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
            )}
          >
            <Layers
              size={14}
              className={cn(isLowCredits ? "text-red-500" : "text-gray-400")}
            />
            <div className="flex items-baseline gap-0.5">
              <span
                className={cn(
                  "font-black text-sm",
                  isLowCredits
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-900 dark:text-white"
                )}
              >
                {user.credits}
              </span>
              <span className="text-[10px] font-medium text-gray-400 uppercase">
                cr
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-gray-200 dark:bg-zinc-800 hidden md:block" />

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 group outline-none"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-300 to-yellow-500 p-[2px] shadow-md group-hover:shadow-yellow-500/20 transition-all">
                  <div className="w-full h-full rounded-full bg-white dark:bg-black flex items-center justify-center">
                    <span className="font-black text-xs text-gray-900 dark:text-white">
                      {userInitials}
                    </span>
                  </div>
                </div>
                {/* Online Status Dot */}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-black rounded-full" />
              </div>

              {/* Desktop Chevron */}
              <ChevronDown
                size={14}
                className={cn(
                  "text-gray-400 transition-transform duration-200 hidden md:block",
                  isDropdownOpen ? "rotate-180" : ""
                )}
              />
            </button>

            {/* The Dropdown Menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-3 w-64 p-2 bg-white dark:bg-[#09090b] rounded-2xl border border-gray-100 dark:border-white/10 shadow-2xl shadow-gray-200/50 dark:shadow-black/50 z-50 overflow-hidden origin-top-right"
                >
                  {/* User Info Header */}
                  <div className="px-3 py-3 mb-2 bg-gray-50 dark:bg-zinc-900/50 rounded-xl">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                      <Sparkles
                        size={10}
                        className="text-brand-yellow fill-brand-yellow"
                      />
                      {user.plan === "free" ? "Free Plan" : "Pro Plan"}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-1">
                    <button
                      onClick={handleManagePlan}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-left"
                    >
                      <CreditCard size={16} className="text-gray-400" />
                      Billing & Plans
                    </button>

                    <button
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-left opacity-50 cursor-not-allowed"
                      title="Coming soon"
                    >
                      <Settings size={16} className="text-gray-400" />
                      Settings
                    </button>

                    <div className="h-px bg-gray-100 dark:bg-white/5 my-2 mx-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};
