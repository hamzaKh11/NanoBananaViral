import React, { useRef } from "react";
import { Button } from "../ui/Button"; // path fixed
import { Platform, Resolution } from "../../types"; // path fixed: up 2 levels to root
import {
  Upload,
  X,
  ImageIcon,
  Lock,
  ScanFace,
  Wand2,
  Sparkles,
} from "lucide-react";
import {
  FaYoutube,
  FaTiktok,
  FaInstagram,
  FaFacebook,
  FaVideo,
} from "react-icons/fa";

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
          <span className="text-red-600">
            <FaYoutube size={18} />
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
          <span className="text-pink-600">
            <FaInstagram size={18} />
          </span>
        );
      case Platform.Facebook:
        return (
          <span className="text-blue-600">
            <FaFacebook size={18} />
          </span>
        );
      default:
        return <FaVideo size={18} />;
    }
  };

  const getAspectRatioText = (p: Platform) => {
    switch (p) {
      case Platform.YouTube:
        return "16:9";
      case Platform.TikTok:
        return "9:16";
      case Platform.Instagram:
        return "1:1";
      case Platform.Facebook:
        return "4:5";
    }
  };

  return (
    <aside className="w-full md:w-[460px] bg-white dark:bg-black border-r border-gray-200 dark:border-white/10 p-5 md:p-6 flex flex-col gap-6 z-20 shadow-xl overflow-y-auto shrink-0 h-full">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
            Video Concept
          </label>
          <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
            {topic.length} chars
          </span>
        </div>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="E.g. I Spent 24 Hours in a Haunted Tesla..."
          className="w-full h-28 bg-gray-50 text-xs dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-yellow resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <ScanFace size={12} /> Your Face
          </label>
          {faceImage ? (
            <div className="relative w-full h-28 rounded-xl overflow-hidden border border-brand-yellow/30 bg-black group">
              <img
                src={faceImage}
                alt="Ref"
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              />
              <button
                onClick={() => setFaceImage(null)}
                className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-500 text-white p-1 rounded-md"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => faceInputRef.current?.click()}
              className="w-full h-28 border border-dashed border-gray-300 dark:border-zinc-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-yellow bg-gray-50 dark:bg-zinc-900/30"
            >
              <Upload size={14} className="text-gray-400 mb-2" />
              <span className="text-[10px] font-bold text-gray-500">
                + Add Selfie
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

        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <Wand2 size={12} /> Style Clone
          </label>
          {styleImage ? (
            <div className="relative w-full h-28 rounded-xl overflow-hidden border border-purple-500/30 bg-black group">
              <img
                src={styleImage}
                alt="Style"
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100"
              />
              <button
                onClick={() => setStyleImage(null)}
                className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-500 text-white p-1 rounded-md"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => styleInputRef.current?.click()}
              className="w-full h-28 border border-dashed border-gray-300 dark:border-zinc-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 bg-gray-50 dark:bg-zinc-900/30"
            >
              <ImageIcon size={14} className="text-gray-400 mb-2" />
              <span className="text-[10px] font-bold text-gray-500 text-center px-2">
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

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
          Target Platform
        </label>
        <div className="grid grid-cols-2 gap-3">
          {Object.values(Platform).map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                platform === p
                  ? "border-brand-yellow bg-yellow-50 dark:bg-yellow-900/20"
                  : "border-gray-200 dark:border-zinc-800"
              }`}
            >
              {getPlatformIcon(p)}
              <div className="text-left">
                <div className="text-sm font-bold">{p}</div>
                <div className="text-[10px] text-gray-500">
                  {getAspectRatioText(p)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
          Output Quality
        </label>
        <div className="flex bg-gray-100 dark:bg-zinc-900 p-1 rounded-xl border border-gray-200 dark:border-white/5">
          {[Resolution.R_1K, Resolution.R_2K, Resolution.R_4K].map((res) => {
            const isLocked =
              (isStarter && res !== Resolution.R_1K) ||
              (!isPro && res === Resolution.R_4K);
            return (
              <button
                key={res}
                onClick={() => !isLocked && setResolution(res)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold ${
                  resolution === res
                    ? "bg-white dark:bg-zinc-800 shadow-sm"
                    : "text-gray-400"
                } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isLocked && <Lock size={10} />} {res}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-zinc-800/50 p-4 rounded-xl">
        <div className="flex justify-between mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
            Intensity
          </label>
          <span className="text-xs text-black bg-brand-yellow px-2 py-0.5 rounded font-bold">
            {intensity}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-yellow"
        />
      </div>

      <div className="mt-auto pt-4 pb-12 md:pb-0">
        <Button
          variant="viral"
          className="w-full h-14 text-base uppercase font-black rounded-xl"
          onClick={onGenerate}
          isLoading={loading}
          disabled={!topic || loading}
        >
          {loading ? (
            "Processing..."
          ) : user.credits > 0 ? (
            <span className="flex items-center gap-2">
              Generate <Sparkles size={16} />
            </span>
          ) : (
            "Out of Credits"
          )}
        </Button>
      </div>
    </aside>
  );
};
