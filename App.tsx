import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AuthModal } from './components/AuthModal';
import { User, PlanType } from './types';
import { Loader2, Lock, Check, LogOut, RefreshCw, Smartphone } from 'lucide-react';
import { supabase } from './lib/supabase';
import { Button } from './components/ui/Button';

// Add definition for Lemon Squeezy window object
declare global {
  interface Window {
    LemonSqueezy: any;
    createLemonSqueezy: () => void;
  }
}

enum View {
  Landing,
  Payment,
  App
}

/**
 * CONFIGURATION: LEMON SQUEEZY
 * Updated with the provided Checkout ID.
 */
const LEMON_SQUEEZY_CONFIG = {
  storeSlug: 'bananaviral', 
  variantIds: {
    starter: '00000', // REPLACE THIS WITH YOUR $19 PLAN VARIANT ID
    creator: 'e7044c1b-1bca-4d84-8e63-da87c503af09', 
    agency: 'e7044c1b-1bca-4d84-8e63-da87c503af09'
  }
};

// Payment Gate Component
const PaymentWall = ({ onLogout, userId }: { onLogout: () => void, userId: string }) => {
  const [isChecking, setIsChecking] = useState(false);

  // Initialize Lemon Squeezy when this component mounts to ensure the overlay is ready
  useEffect(() => {
    // 1. Initialize the library
    if (typeof window.createLemonSqueezy === 'function') {
      window.createLemonSqueezy();
    }

    // 2. Setup Event Listener for "Payment Success"
    // This is CRITICAL: It detects when the user pays inside the popup and unlocks the app.
    if (window.LemonSqueezy) {
      window.LemonSqueezy.Setup({
        eventHandler: (event: any) => {
          if (event.event === 'Payment.Success') {
            console.log("Payment Successful!", event);
            // Force a reload with success param to trigger optimistic UI
            // We use window.location.replace to avoid back-button loops
            window.location.replace(window.location.href.split('?')[0] + '?success=true');
          }
        }
      });
    }
  }, []);

  const handleBuy = (planKey: 'starter' | 'creator' | 'agency') => {
    const variantId = LEMON_SQUEEZY_CONFIG.variantIds[planKey];
    const currentUrl = window.location.href.split('?')[0]; // Clean URL
    
    if (variantId === '00000') {
      alert("Please update the Starter Plan Variant ID in App.tsx");
      return;
    }

    // CRITICAL FIX: URL Encode the redirect URL to prevent 500 errors
    // The redirect URL tells Lemon Squeezy where to send the user after payment.
    // It MUST be encoded to handle query parameters correctly.
    const redirectUrl = encodeURIComponent(`${currentUrl}?success=true`);
    
    // Construct the checkout URL with:
    // 1. embed=1 (for overlay)
    // 2. checkout[custom][user_id] (for webhook mapping)
    // 3. checkout[redirect_url] (fallback if overlay fails)
    const checkoutUrl = `https://${LEMON_SQUEEZY_CONFIG.storeSlug}.lemonsqueezy.com/buy/${variantId}?embed=1&discount=0&checkout[custom][user_id]=${userId}&checkout[redirect_url]=${redirectUrl}`;
    
    console.log("Opening Checkout:", checkoutUrl);

    // method: Try Overlay first, then fallback to redirection
    if (window.LemonSqueezy?.Url?.Open) {
      window.LemonSqueezy.Url.Open(checkoutUrl);
    } else {
      console.warn("Lemon Squeezy Overlay not loaded, redirecting...");
      // Fallback: Redirect standard to ensure action happens
      window.location.href = checkoutUrl;
    }
  };

  const checkSubscriptionStatus = async () => {
    setIsChecking(true);
    // Reload session to see if webhook updated the plan
    const { data: { session } } = await supabase.auth.refreshSession();
    if (session?.user?.user_metadata?.plan && session.user.user_metadata.plan !== 'free') {
      window.location.reload(); // Hard reload to clear any state if successful
    } else {
      // Force success if URL param is present (Optimistic check)
      if (new URLSearchParams(window.location.search).get('success') === 'true') {
        window.location.reload();
      }
      setTimeout(() => setIsChecking(false), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col items-center justify-center p-4 md:p-6 text-center">
       <div className="max-w-4xl w-full">
          <div className="mb-8 md:mb-12">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-brand-yellow rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-glow border-2 border-black">
              <Lock size={28} className="text-black md:w-8 md:h-8" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-display mb-3 md:mb-4 text-black dark:text-white leading-tight">Access Restricted</h1>
            <p className="text-base md:text-xl text-gray-500 max-w-xl mx-auto px-2">
              You're logged in, but you don't have an active plan. BananaViral is a premium GPU tool. Please upgrade to continue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-4 max-w-4xl mx-auto text-left">
             {/* Starter Plan */}
             <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 hover:border-brand-yellow transition flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1 text-black dark:text-white">Hobbyist</h3>
                <p className="text-2xl font-black mb-3 dark:text-white">$19<span className="text-sm text-gray-500 font-medium">/mo</span></p>
                <ul className="space-y-2 mb-6">
                  <li className="flex gap-2 text-xs font-bold text-gray-600 dark:text-gray-400"><Check size={14} className="text-gray-400 shrink-0" /> 50 Credits</li>
                  <li className="flex gap-2 text-xs font-bold text-gray-600 dark:text-gray-400"><Check size={14} className="text-gray-400 shrink-0" /> 1K Only</li>
                </ul>
              </div>
              <Button onClick={() => handleBuy('starter')} variant="outline" className="w-full text-sm">Choose</Button>
            </div>

            {/* Creator Plan */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border-2 border-gray-200 dark:border-zinc-800 hover:border-brand-yellow transition flex flex-col justify-between shadow-lg">
              <div>
                <h3 className="text-lg font-bold mb-1 text-black dark:text-white">Creator</h3>
                <p className="text-2xl font-black mb-3 dark:text-white">$29<span className="text-sm text-gray-500 font-medium">/mo</span></p>
                <ul className="space-y-2 mb-6">
                  <li className="flex gap-2 text-xs font-bold text-gray-600 dark:text-gray-300"><Check size={14} className="text-brand-yellow shrink-0" /> 100 Credits</li>
                  <li className="flex gap-2 text-xs font-bold text-gray-600 dark:text-gray-300"><Check size={14} className="text-brand-yellow shrink-0" /> 2K Resolution</li>
                </ul>
              </div>
              <Button onClick={() => handleBuy('creator')} className="w-full text-sm">Upgrade Now</Button>
            </div>

            {/* Agency Plan */}
            <div className="bg-black dark:bg-zinc-800 p-5 rounded-2xl border-2 border-brand-yellow shadow-xl relative flex flex-col justify-between">
               <div className="absolute top-0 right-0 bg-brand-yellow text-black text-[9px] font-bold px-2 py-1 rounded-bl-lg">BEST</div>
              <div>
                <h3 className="text-lg font-bold mb-1 text-white">Agency</h3>
                <p className="text-2xl font-black mb-3 text-white">$59<span className="text-sm text-gray-400 font-medium">/mo</span></p>
                <ul className="space-y-2 mb-6">
                  <li className="flex gap-2 text-xs text-gray-300"><Check size={14} className="text-brand-yellow shrink-0" /> 400 Credits</li>
                  <li className="flex gap-2 text-xs text-gray-300"><Check size={14} className="text-brand-yellow shrink-0" /> 4K Ultra HD</li>
                </ul>
              </div>
              <Button onClick={() => handleBuy('agency')} variant="viral" className="w-full text-sm">Instant Access</Button>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
             <button 
               onClick={checkSubscriptionStatus} 
               className="bg-brand-yellow text-black font-bold text-sm flex items-center justify-center gap-2 mx-auto transition py-3 px-6 rounded-lg w-full md:w-auto shadow-md"
               disabled={isChecking}
             >
                <RefreshCw size={16} className={isChecking ? "animate-spin" : ""} /> 
                {isChecking ? "Verifying..." : "I've Paid - Continue to App"}
             </button>

            <button onClick={onLogout} className="text-gray-500 hover:text-red-500 font-bold text-xs flex items-center justify-center gap-2 mx-auto transition p-2">
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
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Initialize theme and external scripts
  useEffect(() => {
    // Theme setup
    if (localStorage.getItem('theme') === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }

    // Try to initialize Lemon Squeezy immediately if script is already cached
    if (window.createLemonSqueezy) {
      window.createLemonSqueezy();
    }
  }, []);

  const determineView = (sessionUser: any) => {
    if (!sessionUser) return View.Landing;
    
    // Check for success param from Lemon Squeezy redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
        // OPTIMISTIC UPDATE: If they just came back from a successful payment, 
        // give them temporary access until the webhook fires.
        return View.App;
    }

    const userPlan: PlanType = sessionUser.user_metadata?.plan || 'free'; 
    
    if (userPlan === 'free') {
      return View.Payment;
    }
    return View.App;
  };

  // Check Supabase Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      setCurrentView(determineView(u));
      setIsLoadingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setCurrentView(determineView(u));
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentView(View.Landing);
  };

  if (isLoadingAuth) {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black text-brand-black dark:text-white">
            <Loader2 className="w-12 h-12 animate-spin text-brand-yellow mb-4" />
            <p className="font-bold uppercase tracking-widest text-sm">Initializing Studio...</p>
        </div>
     );
  }

  return (
    <>
      {currentView === View.App && user ? (
        <Dashboard 
          onBack={handleLogout} 
          user={{
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || '',
            credits: user.user_metadata?.credits || 0, // Default to 0 if unknown
            plan: user.user_metadata?.plan || 'free' // Default to free if unknown
          }} 
        />
      ) : currentView === View.Payment && user ? (
        <PaymentWall onLogout={handleLogout} userId={user.id} />
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
        onSuccess={(u) => {
          setUser(u);
          setCurrentView(determineView(u));
        }}
      />
    </>
  );
};

export default App;
