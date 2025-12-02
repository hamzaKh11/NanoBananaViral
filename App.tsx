import React, { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { AuthModal } from "./components/AuthModal";
import { Loader2, Lock, Check, LogOut, RefreshCw, Zap } from "lucide-react";
import { supabase } from "./lib/supabase";
import { Button } from "./components/ui/Button";

// Extend Window interface for Lemon Squeezy SDK
declare global {
  interface Window {
    LemonSqueezy: any;
    createLemonSqueezy: () => void;
  }
}

enum View {
  Landing,
  Payment,
  App,
}

const LEMON_SQUEEZY_CONFIG = {
  storeSlug: "bananaviral",
  variantIds: {
    starter: "00000", // REPLACE with actual Starter Variant ID from Lemon Squeezy
    creator: "e7044c1b-1bca-4d84-8e63-da87c503af09",
    agency: "YOUR_AGENCY_VARIANT_ID", // REPLACE with actual Agency Variant ID
  },
};

const PaymentWall = ({
  onLogout,
  userId,
  onPlanUpdated,
}: {
  onLogout: () => void;
  userId: string;
  onPlanUpdated: () => void;
}) => {
  const [isChecking, setIsChecking] = useState(false);

  // Initialize Lemon Squeezy Script
  useEffect(() => {
    if (window.createLemonSqueezy) {
      window.createLemonSqueezy();
    }
  }, []);

  const handleBuy = (planKey: string) => {
    const variantId =
      LEMON_SQUEEZY_CONFIG.variantIds[
        planKey as keyof typeof LEMON_SQUEEZY_CONFIG.variantIds
      ];

    // OPTIMIZATION: Pass user_id in "custom" data.
    // This allows the Webhook to know EXACTLY who to upgrade.
    const checkoutUrl = `https://${LEMON_SQUEEZY_CONFIG.storeSlug}.lemonsqueezy.com/buy/${variantId}?embed=1&checkout[custom][user_id]=${userId}`;

    // Use Overlay if available, else fallback
    if (window.LemonSqueezy?.Url?.Open) {
      window.LemonSqueezy.Url.Open(checkoutUrl);
    } else {
      window.location.href = checkoutUrl;
    }
  };

  // POLLING: Checks if the webhook has processed the payment yet
  const checkSubscriptionStatus = async () => {
    setIsChecking(true);
    // Fetch directly from DB to see if the Webhook updated the plan
    const { data } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", userId)
      .single();

    if (data && data.plan !== "free") {
      onPlanUpdated(); // Success! Unlock the app.
    } else {
      setTimeout(() => setIsChecking(false), 2000); // Wait and retry
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col items-center justify-center p-4">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Sales Copy */}
        <div className="text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold uppercase tracking-widest">
            <Zap size={14} className="fill-current" /> Limited Time Offer
          </div>
          <h1 className="text-4xl md:text-6xl font-black font-display text-gray-900 dark:text-white leading-tight">
            Unlock the <br />
            <span className="text-brand-yellow">Viral Engine.</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            You are currently on the <strong>Free Tier</strong>. Upgrade to
            access our GPU cluster, 4K rendering, and AI Face Integration.
          </p>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-brand-yellow text-black text-[10px] font-bold px-3 py-1">
              POPULAR
            </div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl">Creator Pass</h3>
              <span className="text-2xl font-black">
                $29
                <span className="text-sm font-normal text-gray-500">/mo</span>
              </span>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex gap-2 text-sm">
                <Check className="text-brand-yellow" /> 100 Viral Credits
              </li>
              <li className="flex gap-2 text-sm">
                <Check className="text-brand-yellow" /> Remove Watermarks
              </li>
              <li className="flex gap-2 text-sm">
                <Check className="text-brand-yellow" /> Commercial License
              </li>
            </ul>
            <Button
              onClick={() => handleBuy("creator")}
              className="w-full py-4 text-lg font-bold shadow-lg bg-brand-yellow text-black hover:bg-yellow-400"
            >
              Upgrade Now
            </Button>
            <p className="text-center text-xs text-gray-400 mt-3">
              Secure 256-bit SSL Payment via Lemon Squeezy
            </p>
          </div>
        </div>

        {/* Locked State */}
        <div className="flex flex-col items-center justify-center text-center space-y-6 opacity-90">
          <div className="w-20 h-20 bg-gray-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <Lock size={32} className="text-gray-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Logged in as</p>
            <p className="font-mono font-bold text-gray-700 dark:text-white">
              {userId}
            </p>
          </div>

          <button
            onClick={checkSubscriptionStatus}
            disabled={isChecking}
            className="flex items-center gap-2 text-sm font-bold text-brand-yellow hover:underline"
          >
            <RefreshCw size={16} className={isChecking ? "animate-spin" : ""} />
            {isChecking ? "Checking Database..." : "I just paid! Let me in."}
          </button>

          <button
            onClick={onLogout}
            className="text-xs font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 transition"
          >
            <LogOut size={12} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Landing);
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // 1. Inject Lemon Squeezy Script
    const script = document.createElement("script");
    script.src = "https://assets.lemonsqueezy.com/lemon.js";
    script.defer = true;
    document.body.appendChild(script);

    // 2. Check Session
    checkSession();

    // 3. Listen for Auth Changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setUser(null);
        setCurrentView(View.Landing);
      }
    });

    return () => {
      document.body.removeChild(script);
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser: any) => {
    // Fetch REAL plan from DB (updated by webhook)
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (data) {
      const fullUser = { ...authUser, ...data };
      setUser(fullUser);
      if (data.plan && data.plan !== "free") {
        setCurrentView(View.App);
      } else {
        setCurrentView(View.Payment);
      }
    } else {
      // Handle first-time login (defaults to free)
      setUser(authUser);
      setCurrentView(View.Payment);
    }
    setIsLoading(false);
  };

  const checkSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      fetchUserProfile(session.user);
    } else {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-black">
        <Loader2 className="animate-spin text-brand-yellow w-12 h-12" />
      </div>
    );

  return (
    <>
      {currentView === View.App && user ? (
        <Dashboard
          onBack={async () => {
            await supabase.auth.signOut();
          }}
          user={user}
        />
      ) : currentView === View.Payment && user ? (
        <PaymentWall
          userId={user.id}
          onLogout={async () => {
            await supabase.auth.signOut();
          }}
          onPlanUpdated={() => fetchUserProfile(user)} // Reload user when payment is confirmed
        />
      ) : (
        <LandingPage
          onLogin={() => setIsAuthModalOpen(true)}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(u) => fetchUserProfile(u)}
      />
    </>
  );
};

export default App;
