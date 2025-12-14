import React, { useRef } from "react";
import { Button } from "../ui/Button";
import { Platform, Resolution } from "../../types";
import {
  Upload,
  X,
  ImageIcon,
  Lock,
  ScanFace,
  Wand2,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  FaYoutube,
  FaTiktok,
  FaInstagram,
  FaFacebook,
  FaVideo,
} from "react-icons/fa";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GeneratorSidebarProps {
  user: any;
  topic: string;
  setTopic: (val: string) => void;
  faceImage: string | null;
  setFaceImage: (val: string | null) => void;
  styleImage: string | null;
  setStyleImage: (val: string | null) => void;
  platform: Platform;
  setPlatform: (val: Platform) => void;
  resolution: Resolution;
  setResolution: (val: Resolution) => void;
  intensity: number;
  setIntensity: (val: number) => void;
  loading: boolean;
  onGenerate: () => void;
  handleImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "face" | "style"
  ) => void;
}

export const GeneratorSidebar: React.FC<GeneratorSidebarProps> = ({
  user,
  topic,
  setTopic,
  faceImage,
  setFaceImage,
  styleImage,
  setStyleImage,
  platform,
  setPlatform,
  resolution,
  setResolution,
  intensity,
  setIntensity,
  loading,
  onGenerate,
  handleImageUpload,
}) => {
  const faceInputRef = useRef<HTMLInputElement>(null);
  const styleInputRef = useRef<HTMLInputElement>(null);

  const isStarter = user?.plan === "starter";
  const isPro = user?.plan === "agency" || user?.plan === "pro";

  const getPlatformIcon = (p: Platform) => {
    switch (p) {
      case Platform.YouTube:
        return (
          <span className="text-[#FF0000]">
            <FaYoutube size={20} />
          </span>
        );
      case Platform.TikTok:
        return (
          <span className="text-black dark:text-white">
            <FaTiktok size={18} />
          </span>
        );
      case Platform.Instagram:
        return (
          <span className="text-[#E1306C]">
            <FaInstagram size={20} />
          </span>
        );
      case Platform.Facebook:
        return (
          <span className="text-[#1877F2]">
            <FaFacebook size={20} />
          </span>
        );
      default:
        return <FaVideo size={18} />;
    }
  };

  const getAspectRatioText = (p: Platform) => {
    switch (p) {
      case Platform.YouTube:
        return "16:9 Landscape";
      case Platform.TikTok:
        return "9:16 Portrait";
      case Platform.Instagram:
        return "1:1 Square";
      case Platform.Facebook:
        return "4:5 Vertical";
      default:
        return "Custom";
    }
  };

  return (
    <div className="p-6 space-y-2 pb-24 h-full flex flex-col font-sans">
      {/* 1. Prompt Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
            Video Concept
          </label>
          <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full border border-gray-200 dark:border-white/10">
            {topic.length} chars
          </span>
        </div>
        <div className="relative group">
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="E.g. I Spent 24 Hours in a Haunted Tesla..."
            className="w-full h-32 bg-gray-50 dark:bg-zinc-900/50 border-2 border-gray-200 dark:border-zinc-800 rounded-xl p-4 text-xs font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow resize-none transition-all placeholder:text-gray-400"
          />
          <div className="absolute bottom-3 right-3 pointer-events-none">
            <Sparkles
              size={14}
              className={
                topic ? "text-brand-yellow animate-pulse" : "text-gray-300"
              }
            />
          </div>
        </div>
      </div>

      {/* 2. Uploads */}
      <div className="grid grid-cols-2 gap-4 py-2">
        {/* Face Upload */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-500 px-1">
            <ScanFace size={12} /> Your Face
          </label>
          <div
            onClick={() => !faceImage && faceInputRef.current?.click()}
            className={cn(
              "relative h-28 w-full rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group flex flex-col items-center justify-center",
              faceImage
                ? "border-transparent bg-black"
                : "border-gray-200 dark:border-zinc-800 hover:border-brand-yellow hover:bg-brand-yellow/5 bg-gray-50 dark:bg-zinc-900/30"
            )}
          >
            {faceImage ? (
              <>
                <img
                  src={faceImage}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  alt="Face"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFaceImage(null);
                  }}
                  className="absolute top-1.5 right-1.5 bg-black/60 p-1.5 rounded-md text-white hover:bg-red-500 transition-colors backdrop-blur-sm"
                >
                  <X size={12} />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-gray-400 group-hover:text-brand-yellow transition-colors">
                <div className="p-2 bg-white dark:bg-zinc-800 rounded-full shadow-sm border border-gray-100 dark:border-zinc-700">
                  <Upload size={16} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide">
                  Add Selfie
                </span>
              </div>
            )}
            <input
              type="file"
              ref={faceInputRef}
              onChange={(e) => handleImageUpload(e, "face")}
              className="hidden"
              accept="image/*"
            />
          </div>
        </div>

        {/* Style Upload */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-500 px-1">
            <Wand2 size={12} /> Style Ref
          </label>
          <div
            onClick={() => !styleImage && styleInputRef.current?.click()}
            className={cn(
              "relative h-28 w-full rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group flex flex-col items-center justify-center",
              styleImage
                ? "border-transparent bg-black"
                : "border-gray-200 dark:border-zinc-800 hover:border-purple-500 hover:bg-purple-500/5 bg-gray-50 dark:bg-zinc-900/30"
            )}
          >
            {styleImage ? (
              <>
                <img
                  src={styleImage}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  alt="Style"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setStyleImage(null);
                  }}
                  className="absolute top-1.5 right-1.5 bg-black/60 p-1.5 rounded-md text-white hover:bg-red-500 transition-colors backdrop-blur-sm"
                >
                  <X size={12} />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-gray-400 group-hover:text-purple-500 transition-colors">
                <div className="p-2 bg-white dark:bg-zinc-800 rounded-full shadow-sm border border-gray-100 dark:border-zinc-700">
                  <ImageIcon size={16} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide">
                  Upload Clone
                </span>
              </div>
            )}
            <input
              type="file"
              ref={styleInputRef}
              onChange={(e) => handleImageUpload(e, "style")}
              className="hidden"
              accept="image/*"
            />
          </div>
        </div>
      </div>

      {/* 3. Target Platform */}
      <div className="space-y-2 pt-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 px-1">
          Target Platform
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
          {Object.values(Platform).map((p) => {
            const isActive = platform === p;
            return (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all relative group",
                  isActive
                    ? "border-brand-yellow bg-brand-yellow/10"
                    : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-700"
                )}
              >
                {getPlatformIcon(p)}
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                    {p}
                  </span>
                  <span className="text-[10px] font-medium text-gray-500">
                    {getAspectRatioText(p)}
                  </span>
                </div>
                {isActive && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-yellow shadow-sm" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Output Quality */}
      <div className="space-y-2 pt-2">
        <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 px-1">
          Output Quality
        </label>
        <div className="mt-1.5 flex bg-gray-100 dark:bg-zinc-900 p-1 rounded-xl border-2 border-gray-200 dark:border-zinc-800">
          {[Resolution.R_1K, Resolution.R_2K, Resolution.R_4K].map((res) => {
            const isLocked =
              (isStarter && res !== Resolution.R_1K) ||
              (!isPro && res === Resolution.R_4K);
            return (
              <button
                key={res}
                onClick={() => !isLocked && setResolution(res)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                  resolution === res
                    ? "bg-white dark:bg-zinc-800 shadow-sm text-black dark:text-white"
                    : "text-gray-400 hover:text-gray-600",
                  isLocked && "opacity-50 cursor-not-allowed"
                )}
              >
                {isLocked && <Lock size={10} />} {res}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Intensity Slider */}
      <div className="bg-gray-100 dark:bg-zinc-900/50 p-4 rounded-xl border-2 border-gray-100 dark:border-zinc-800 mt-2 mb-4">
        <div className="flex justify-between mb-3">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500">
            AI Creativity
          </label>
          <span className="text-[10px] text-black bg-brand-yellow px-2 py-0.5 rounded font-bold border border-brand-yellow/20">
            {intensity}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          className="w-full h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
        />
        <div className="flex justify-between text-[9px] font-medium text-gray-400 mt-2 px-1">
          <span>Subtle</span>
          <span>Balanced</span>
          <span>Extreme</span>
        </div>
      </div>

      {/* 6. Generate Button */}
      <div className="mt-auto">
        <Button
          variant="viral"
          className={cn(
            "w-full h-14 text-sm uppercase font-black rounded-xl shadow-lg shadow-brand-yellow/20 hover:shadow-brand-yellow/40 transition-all active:scale-[0.98]",
            (!topic || loading) && "opacity-80 grayscale-[0.5]"
          )}
          onClick={onGenerate}
          isLoading={loading}
          disabled={!topic || loading}
        >
          {loading ? (
            "Creating Magic..."
          ) : user.credits > 0 ? (
            <span className="flex items-center gap-2">
              Generate <Sparkles size={16} className="fill-black/20" />
            </span>
          ) : (
            <span className="flex items-center gap-2 text-red-600">
              Out of Credits <Lock size={14} />
            </span>
          )}
        </Button>
        <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-gray-400 font-medium">
          <Zap size={10} className="text-brand-yellow fill-brand-yellow" />
          {user.credits} credits remaining
        </div>
      </div>
    </div>
  );
};
