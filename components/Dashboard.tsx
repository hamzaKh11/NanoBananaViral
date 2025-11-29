import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { Platform, Resolution, ThumbnailParams } from '../types';
import { generateThumbnail } from '../services/geminiService';
import { deductCredits, supabase } from '../lib/supabase';
import { Settings2, Download, RefreshCw, AlertCircle, ChevronLeft, Upload, Image as ImageIcon, X, Youtube, Instagram, Facebook, Video, Smartphone, LogOut, Lock, MonitorPlay, Layers } from 'lucide-react';

interface DashboardProps {
  onBack: () => void;
  user: any;
}

export const Dashboard: React.FC<DashboardProps> = ({ onBack, user: initialUser }) => {
  const [user, setUser] = useState(initialUser);
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<Platform>(Platform.YouTube);
  const [resolution, setResolution] = useState<Resolution>(Resolution.R_2K);
  const [intensity, setIntensity] = useState<number>(85);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch latest credits on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user.id) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        // Merge Supabase profile data with auth metadata fallback
        setUser((prev: any) => ({ ...prev, ...data }));
      }
    };
    fetchProfile();
  }, [user.id]);

  // Determine capabilities based on plan
  const isPaidUser = user?.plan !== 'free';
  const isStarter = user?.plan === 'starter';
  const isPro = user?.plan === 'agency' || user?.plan === 'pro';
  
  // Default resolution fix for Starter plan
  useEffect(() => {
    if (isStarter && resolution !== Resolution.R_1K) {
        setResolution(Resolution.R_1K);
    }
  }, [isStarter, resolution]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    // SECURITY Checks
    if (!isPaidUser) {
        setError("Unauthorized: Active Plan Required.");
        return;
    }
    if (user.credits < 1) {
        setError("Out of credits. Please upgrade or top up to continue.");
        return;
    }

    if (!topic.trim()) return;
    
    setLoading(true);
    setError(null);
    setResultImage(null);
    
    // Scroll to result area on mobile
    if (window.innerWidth < 768) {
      setTimeout(() => {
        document.getElementById('result-area')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }

    try {
      const params: ThumbnailParams = { 
        topic, 
        platform, 
        resolution, 
        intensity,
        faceImageBase64: faceImage 
      };
      
      const base64Image = await generateThumbnail(params);
      
      // Deduct Credit via secure RPC
      await deductCredits(user.id, 1);
      
      // Optimistic UI update
      setUser((prev: any) => ({ ...prev, credits: Math.max(0, prev.credits - 1) }));
      
      setResultImage(base64Image);
    } catch (err: any) {
      setError(err.message || "Failed to generate thumbnail. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!resultImage) return;

    try {
      const fetchRes = await fetch(resultImage);
      const blob = await fetchRes.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `banana-viral-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download failed", e);
      setError("Could not download image. Try right-clicking to save.");
    }
  };

  const getPlatformIcon = (p: Platform) => {
    switch(p) {
        case Platform.YouTube: return <Youtube size={18} className="text-red-600" />;
        case Platform.TikTok: return <Smartphone size={18} className="text-black dark:text-white" />;
        case Platform.Instagram: return <Instagram size={18} className="text-pink-600" />;
        case Platform.Facebook: return <Facebook size={18} className="text-blue-600" />;
        default: return <Video size={18} />;
    }
  };

  const getAspectRatioText = (p: Platform) => {
    switch(p) {
        case Platform.YouTube: return "16:9";
        case Platform.TikTok: return "9:16";
        case Platform.Instagram: return "1:1";
        case Platform.Facebook: return "4:5";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white font-sans flex flex-col transition-colors duration-300">
      {/* App Bar */}
      <header className="h-16 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900 flex items-center justify-between px-4 md:px-6 shadow-sm z-20 sticky top-0">
        <div className="flex items-center gap-4">
            <span className="font-display font-black text-xl tracking-tight block">
              Banana<span className="text-brand-yellow">Studio</span>
            </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
            <div className="hidden md:flex items-center gap-2">
                 <Button variant="outline" className="h-9 px-3 text-xs" onClick={() => window.open('https://bananaviral.lemonsqueezy.com/billing', '_blank')}>Manage Plan</Button>
            </div>
            <div className={`px-3 py-1 rounded-full border flex items-center gap-2 ${user.credits < 5 ? 'bg-red-100 border-red-200 dark:bg-red-900/20' : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10'}`}>
                <Layers size={14} className={user.credits < 5 ? "text-red-500" : "text-gray-500"}/>
                <span className={`font-medium hidden md:inline ${user.credits < 5 ? "text-red-600" : "text-gray-500 dark:text-gray-400"}`}>Credits:</span>
                <span className={`font-black ${user.credits < 5 ? "text-red-600" : "text-brand-yellow"}`}>{user.credits}</span>
            </div>
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-brand-yellow flex items-center justify-center text-black font-bold border-2 border-black">
                {(user.email?.[0] || 'U').toUpperCase()}
            </div>
            <button 
                onClick={onBack} 
                className="p-2 bg-gray-100 dark:bg-zinc-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-300 hover:text-red-600 transition-colors rounded-full"
                title="Sign Out"
            >
                <LogOut size={16} />
            </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col-reverse md:flex-row h-auto md:h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Left Sidebar: Controls */}
        <aside className="w-full md:w-[450px] bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-white/10 p-4 md:p-6 overflow-y-auto flex flex-col gap-6 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-auto md:h-full">
          
          {/* Topic Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Video Title / Concept</label>
            <textarea 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="E.g. I Survived 50 Hours in the World's Quietest Room..."
              className="w-full h-24 md:h-32 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-zinc-800 rounded-xl p-4 text-gray-900 dark:text-white focus:ring-0 focus:border-brand-yellow resize-none transition-all placeholder:text-gray-400 font-medium text-lg leading-relaxed"
            />
          </div>

          {/* Reference Image (Face) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Your Face (Boosts CTR by 80%)
            </label>
            {faceImage ? (
                <div className="relative w-full h-32 md:h-40 rounded-xl overflow-hidden group border-2 border-brand-yellow bg-black">
                    <img src={faceImage} alt="Reference" className="w-full h-full object-contain" />
                    <button 
                        onClick={() => setFaceImage(null)}
                        className="absolute top-2 right-2 bg-black/50 hover:bg-red-600 text-white p-2 rounded-lg backdrop-blur-sm transition"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 md:h-32 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-yellow hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition group"
                >
                    <div className="w-10 h-10 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-2 group-hover:bg-brand-yellow group-hover:text-black text-gray-500 transition-colors">
                        <Upload size={18} />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-bold">Upload Selfie / Face</span>
                </div>
            )}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*"
            />
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-1 gap-6">
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Target Platform</label>
                <div className="grid grid-cols-2 gap-3">
                    {Object.values(Platform).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPlatform(p)}
                            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                                platform === p 
                                ? 'border-brand-yellow bg-yellow-50 dark:bg-yellow-900/20 shadow-sm' 
                                : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'
                            }`}
                        >
                            {getPlatformIcon(p)}
                            <div className="text-left">
                                <div className="text-sm font-bold">{p}</div>
                                <div className="text-[10px] text-gray-500">{getAspectRatioText(p)}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Image Resolution</label>
                <div className="flex bg-gray-100 dark:bg-black p-1 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-x-auto">
                    {[Resolution.R_1K, Resolution.R_2K, Resolution.R_4K].map((res) => {
                        let isLocked = false;
                        if (isStarter && res !== Resolution.R_1K) isLocked = true;
                        if (!isPro && res === Resolution.R_4K) isLocked = true;
                        
                        return (
                            <button
                                key={res}
                                onClick={() => !isLocked && setResolution(res)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                                    resolution === res 
                                    ? 'bg-white dark:bg-zinc-800 shadow-sm text-black dark:text-white' 
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isLocked && <Lock size={12} />} {res} 
                                {isLocked && <span className="text-[9px] bg-gray-200 dark:bg-zinc-700 text-black dark:text-white px-1 rounded ml-1">
                                    {isStarter ? 'UPGRADE' : 'PRO'}
                                </span>}
                            </button>
                        );
                    })}
                </div>
            </div>
          </div>

          {/* Intensity Slider */}
          <div className="bg-gray-100 dark:bg-zinc-800/50 p-4 rounded-xl">
             <div className="flex justify-between mb-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Visual Impact / Intensity</label>
                <span className="text-xs text-black bg-brand-yellow px-2 py-0.5 rounded font-bold">{intensity}%</span>
             </div>
             <input 
                type="range" 
                min="0" 
                max="100" 
                value={intensity} 
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-brand-yellow"
             />
             <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-wide">
                <span>Safe</span>
                <span>Max Viral</span>
             </div>
          </div>

          <div className="mt-auto pt-4 pb-20 md:pb-0">
            <Button 
                variant="viral" 
                className="w-full h-14 text-lg uppercase tracking-wide font-black rounded-xl"
                onClick={handleGenerate}
                isLoading={loading}
                disabled={!topic || loading}
            >
                {loading ? 'Generating...' : user.credits > 0 ? 'Generate Thumbnail (-1 Credit)' : 'Out of Credits'}
            </Button>
          </div>
        </aside>

        {/* Right Area: Preview */}
        <section id="result-area" className="flex-1 bg-gray-100 dark:bg-black p-4 md:p-12 flex items-center justify-center relative overflow-hidden min-h-[50vh] md:min-h-auto border-b md:border-b-0 border-gray-200 dark:border-white/10">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.05] dark:opacity-[0.1]" 
                 style={{ backgroundImage: 'radial-gradient(circle, #888 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
            />

            <div className="relative z-10 w-full max-w-5xl">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div 
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center h-[300px] md:h-[400px]"
                        >
                            <div className="relative w-24 h-24 md:w-32 md:h-32 mb-8">
                                <div className="absolute inset-0 border-4 border-gray-200 dark:border-zinc-800 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-brand-yellow rounded-full border-t-transparent animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Smartphone className="animate-pulse text-gray-400" />
                                </div>
                            </div>
                            <h3 className="text-xl md:text-2xl font-display font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight text-center">Constructing Viral Image...</h3>
                            <p className="text-gray-500 font-medium text-center text-sm md:text-base">Applying 3D lighting, saturation boost, and expression engine.</p>
                        </motion.div>
                    ) : resultImage ? (
                         <motion.div 
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col gap-6 md:gap-8"
                        >
                            <div className="rounded-xl overflow-hidden shadow-sharp ring-4 ring-black dark:ring-zinc-800 group relative bg-black">
                                <img src={resultImage} alt="Generated Thumbnail" className="w-full h-auto object-contain max-h-[50vh] md:max-h-[70vh]" />
                            </div>
                            <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-4">
                                <Button variant="primary" onClick={handleDownload} className="rounded-xl px-8 shadow-xl w-full md:w-auto h-12">
                                    <Download size={20} className="mr-2" /> Download High-Res
                                </Button>
                                <Button variant="secondary" onClick={handleGenerate} className="rounded-xl px-6 w-full md:w-auto h-12">
                                    <RefreshCw size={20} className="mr-2" /> Try Another Variation
                                </Button>
                            </div>
                        </motion.div>
                    ) : error ? (
                        <motion.div 
                            key="error"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center p-6 md:p-12 border-2 border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30 rounded-3xl"
                        >
                            <AlertCircle className="w-12 h-12 md:w-16 md:h-16 text-red-500 mx-auto mb-4 md:mb-6" />
                            <h3 className="text-lg md:text-xl font-bold text-red-600 dark:text-red-400 mb-2">Generation Failed</h3>
                            <p className="text-red-500 dark:text-red-300/70 max-w-md mx-auto text-sm md:text-base">{error}</p>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center select-none opacity-40 grayscale"
                        >
                            <div className="w-24 h-24 md:w-40 md:h-40 bg-gray-200 dark:bg-zinc-900 rounded-full mx-auto mb-6 md:mb-8 flex items-center justify-center">
                                <ImageIcon className="w-12 h-12 md:w-20 md:h-20 text-gray-400 dark:text-zinc-700" />
                            </div>
                            <h2 className="text-xl md:text-3xl font-black text-gray-300 dark:text-zinc-700 mb-2 uppercase tracking-tight">Canvas Ready</h2>
                            <p className="text-gray-400 dark:text-zinc-600 font-medium text-sm md:text-lg">Enter your video topic to begin</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
      </main>
    </div>
  );
};
