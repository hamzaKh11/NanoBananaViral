import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/Button";
import { Platform, Resolution, ThumbnailParams } from "../types";
import { generateThumbnail } from "../services/geminiService";
import { deductCredits, supabase } from "../lib/supabase";
import {
  Download,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  X,
  Video,
  LogOut,
  Lock,
  Layers,
  Sparkles,
  Wand2,
  ScanFace,
  Zap,
  ArrowUpCircle,
  User,
} from "lucide-react";

import { FaYoutube, FaTiktok, FaInstagram, FaFacebook } from "react-icons/fa";

// --- Types ---
interface Message {
  id: string;
  role: "user" | "assistant";
  type: "text" | "image";
  content: string;
}

interface DashboardProps {
  onBack: () => void;
  user: any;
}

// Helper for Unique IDs (Fixes duplicate key errors)
const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const Dashboard: React.FC<DashboardProps> = ({
  onBack,
  user: initialUser,
}) => {
  const [user, setUser] = useState(initialUser);

  // --- Inputs (LEFT SIDE) ---
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<Platform>(Platform.YouTube);
  const [resolution, setResolution] = useState<Resolution>(Resolution.R_2K);
  const [intensity, setIntensity] = useState<number>(85);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [styleImage, setStyleImage] = useState<string | null>(null);

  // --- Session State ---
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");

  // General State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const faceInputRef = useRef<HTMLInputElement>(null);
  const styleInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Clean URL Update
  useEffect(() => {
    window.history.pushState({}, "", "/app");
  }, []);

  // 2. Fetch User Data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user.id) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) setUser((prev: any) => ({ ...prev, ...data }));
    };
    fetchProfile();
  }, [user.id]);

  // Plan Checks
  const isPaidUser = user?.plan !== "free";
  const isStarter = user?.plan === "starter";
  const isPro = user?.plan === "agency" || user?.plan === "pro";

  // Resolution Guard
  useEffect(() => {
    if (isStarter && resolution !== Resolution.R_1K)
      setResolution(Resolution.R_1K);
  }, [isStarter, resolution]);

  // --- SMART SCROLLING LOGIC ---
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, []);

  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [messages, loading, scrollToBottom]);

  // Handlers
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "face" | "style"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "face") setFaceImage(reader.result as string);
        else setStyleImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- SESSION LOGIC: START ---
  const handleGenerate = async () => {
    if (!isPaidUser) {
      setError("Unauthorized: Active Plan Required.");
      return;
    }
    if (user.credits < 1) {
      setError("Out of credits. Please upgrade.");
      return;
    }
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setMessages([]); // Clear previous chat

    // Mobile scroll fix
    if (window.innerWidth < 768) {
      setTimeout(() => {
        document
          .getElementById("chat-feed")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }

    try {
      // 1. Create DB Session
      const { data: session, error: sessError } = await supabase
        .from("design_sessions")
        .insert({ user_id: user.id, topic })
        .select()
        .single();
      if (sessError) throw sessError;
      setSessionId(session.id);

      // 2. Add User Message (With Unique ID)
      const userMsg: Message = {
        id: generateId(),
        role: "user",
        type: "text",
        content: topic,
      };
      setMessages([userMsg]);

      // 3. Generate Image
      const params: ThumbnailParams = {
        topic,
        platform,
        resolution,
        intensity,
        faceImageBase64: faceImage,
        styleImageBase64: styleImage,
      };
      const base64Image = await generateThumbnail(params);

      // 4. Update Credits
      await deductCredits(user.id, 1);
      setUser((prev: any) => ({
        ...prev,
        credits: Math.max(0, prev.credits - 1),
      }));

      // 5. Add AI Response (With Unique ID)
      const aiMsg: Message = {
        id: generateId(),
        role: "assistant",
        type: "image",
        content: base64Image,
      };
      setMessages((prev) => [...prev, aiMsg]);

      // 6. DB Save
      supabase.from("session_messages").insert([
        { session_id: session.id, role: "user", type: "text", content: topic },
        {
          session_id: session.id,
          role: "assistant",
          type: "image",
          content: base64Image,
        },
      ]);
    } catch (err: any) {
      setError(err.message || "Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- SESSION LOGIC: REFINE ---
  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !sessionId || loading) return;

    const instruction = chatInput;
    setChatInput("");
    setLoading(true);
    setError(null);

    // Add User Message (Unique ID)
    const userMsg: Message = {
      id: generateId(),
      role: "user",
      type: "text",
      content: instruction,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const lastImage = [...messages]
        .reverse()
        .find((m) => m.type === "image")?.content;

      const params: ThumbnailParams = {
        topic: `${topic}. Refinement: ${instruction}`,
        platform,
        resolution,
        intensity,
        faceImageBase64: faceImage,
        styleImageBase64: lastImage || styleImage,
      };

      const base64Image = await generateThumbnail(params);

      const aiMsg: Message = {
        id: generateId(),
        role: "assistant",
        type: "image",
        content: base64Image,
      };
      setMessages((prev) => [...prev, aiMsg]);

      supabase.from("session_messages").insert([
        {
          session_id: sessionId,
          role: "user",
          type: "text",
          content: instruction,
        },
        {
          session_id: sessionId,
          role: "assistant",
          type: "image",
          content: base64Image,
        },
      ]);
    } catch (err: any) {
      setError("Refinement failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (imgUrl: string) => {
    try {
      const fetchRes = await fetch(imgUrl);
      const blob = await fetchRes.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `banana-viral-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError("Download failed. Try right-click > Save Image.");
    }
  };

  // Helpers
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
        return <Video size={18} />;
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

  const getCanvasClass = () => {
    switch (platform) {
      case Platform.YouTube:
        return "aspect-video w-full max-w-4xl shadow-2xl";
      case Platform.TikTok:
        return "aspect-[9/16] max-h-[65vh] w-auto mx-auto shadow-2xl";
      case Platform.Instagram:
        return "aspect-square max-h-[65vh] w-auto mx-auto shadow-2xl";
      case Platform.Facebook:
        return "aspect-[4/5] max-h-[65vh] w-auto mx-auto shadow-2xl";
      default:
        return "aspect-video w-full";
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#050505] text-gray-900 dark:text-white font-sans flex flex-col overflow-hidden">
      {/* HEADER */}
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

      {/* Main Content Area - Locked Height */}
      <main className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
        {/* LEFT SIDEBAR - FIXED & SCROLLABLE */}
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
              className="w-full h-28 bg-gray-50 text-xs dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-yellow focus:border-transparent resize-none transition-all placeholder:text-gray-400 leading-relaxed shadow-sm"
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
                  <div className="absolute bottom-0 inset-x-0 bg-brand-yellow/90 text-black text-[9px] font-bold text-center py-0.5">
                    ACTIVE
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => faceInputRef.current?.click()}
                  className="w-full h-28 border border-dashed border-gray-300 dark:border-zinc-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-yellow hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-all group bg-gray-50 dark:bg-zinc-900/30"
                >
                  <div className="w-8 h-8 bg-white dark:bg-zinc-800 rounded-full shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Upload
                      size={14}
                      className="text-gray-400 group-hover:text-brand-yellow"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 group-hover:text-brand-yellow transition-colors">
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
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                  <button
                    onClick={() => setStyleImage(null)}
                    className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-500 text-white p-1 rounded-md"
                  >
                    <X size={12} />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-purple-500/90 text-white text-[9px] font-bold text-center py-0.5">
                    MATCHING
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => styleInputRef.current?.click()}
                  className="w-full h-28 border border-dashed border-gray-300 dark:border-zinc-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all group bg-gray-50 dark:bg-zinc-900/30"
                >
                  <div className="w-8 h-8 bg-white dark:bg-zinc-800 rounded-full shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <ImageIcon
                      size={14}
                      className="text-gray-400 group-hover:text-purple-500"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 group-hover:text-purple-500 transition-colors text-center px-2">
                    Upload a thumbnail to clone
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
                      ? "border-brand-yellow bg-yellow-50 dark:bg-yellow-900/20 shadow-sm"
                      : "border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700"
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
              {[Resolution.R_1K, Resolution.R_2K, Resolution.R_4K].map(
                (res) => {
                  let isLocked = false;
                  if (isStarter && res !== Resolution.R_1K) isLocked = true;
                  if (!isPro && res === Resolution.R_4K) isLocked = true;
                  return (
                    <button
                      key={res}
                      onClick={() => !isLocked && setResolution(res)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                        resolution === res
                          ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                          : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {isLocked && <Lock size={10} />} {res}
                    </button>
                  );
                }
              )}
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-zinc-800/50 p-4 rounded-xl">
            <div className="flex justify-between mb-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                Visual Impact / Intensity
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
              className="w-full h-2 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-brand-yellow"
            />
            <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-wide">
              <span>Safe</span>
              <span>Max Viral</span>
            </div>
          </div>
          <div className="mt-auto pt-4 pb-12 md:pb-0">
            <Button
              variant="viral"
              className="w-full h-14 text-base uppercase tracking-widest font-black rounded-xl shadow-lg shadow-brand-yellow/20 hover:shadow-brand-yellow/40 active:scale-[0.98] transition-all"
              onClick={handleGenerate}
              isLoading={loading}
              disabled={!topic || loading}
            >
              {loading ? (
                "Processing..."
              ) : user.credits > 0 ? (
                <span className="flex items-center gap-2">
                  Generate Thumbnail{" "}
                  <Sparkles size={16} className="fill-black animate-pulse" />
                </span>
              ) : (
                "Out of Credits"
              )}
            </Button>
          </div>
        </aside>

        {/* RIGHT SIDE: CHAT & CANVAS - FIXED SCROLLING */}
        <section
          id="chat-feed"
          className="flex-1 flex flex-col h-full bg-[#F3F4F6] dark:bg-[#080808] relative overflow-hidden"
        >
          {/* Background */}
          <div
            className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, #888 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Messages Area - SCROLLABLE */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar scroll-smooth">
            {/* Empty State */}
            {messages.length === 0 && !loading && !error && (
              <div className="h-full flex flex-col items-center justify-center select-none opacity-40">
                <div className="w-24 h-24 bg-gray-200 dark:bg-zinc-900 rounded-full mb-6 flex items-center justify-center overflow-hidden border-4 border-gray-300 dark:border-zinc-800 grayscale opacity-50">
                  <img
                    src="/logo.png"
                    className="w-full h-full object-cover"
                    alt="Logo"
                  />
                </div>
                <h2 className="text-3xl font-black text-gray-400 dark:text-zinc-700 uppercase tracking-tight">
                  Banana Studio
                </h2>
                <p className="text-sm font-medium text-gray-400 dark:text-zinc-600 mt-2">
                  Start a session in the sidebar to begin.
                </p>
              </div>
            )}

            {/* Chat Messages */}
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex w-full mb-8 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex gap-4 max-w-[95%] md:max-w-[85%] ${
                      msg.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center overflow-hidden border border-black/5 dark:border-white/10 bg-white dark:bg-zinc-800 shadow-sm mt-1">
                      {msg.role === "user" ? (
                        <div className="bg-gray-100 dark:bg-zinc-700 w-full h-full flex items-center justify-center">
                          <User
                            size={20}
                            className="text-gray-500 dark:text-gray-300"
                          />
                        </div>
                      ) : (
                        <img
                          src="/logo.png"
                          className="w-full h-full object-cover"
                          alt="AI"
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-2">
                      {/* Text */}
                      {msg.type === "text" && (
                        <div
                          className={`px-5 py-3.5 text-[15px] font-medium leading-relaxed shadow-sm max-w-xl ${
                            msg.role === "user"
                              ? "bg-[#E7E7E9] dark:bg-zinc-800 text-gray-900 dark:text-white rounded-[1.5rem] rounded-tr-sm"
                              : "bg-transparent text-gray-900 dark:text-white p-0 pl-0 shadow-none font-normal"
                          }`}
                        >
                          {msg.content}
                        </div>
                      )}

                      {/* Image Canvas */}
                      {msg.type === "image" && (
                        <div className="mt-2 w-full max-w-4xl">
                          <div
                            className={`relative rounded-2xl overflow-hidden bg-black ring-1 ring-white/10 group ${getCanvasClass()}`}
                          >
                            <img
                              src={msg.content}
                              alt="Generated"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center gap-3 backdrop-blur-[2px]">
                              <Button
                                variant="primary"
                                onClick={() => handleDownload(msg.content)}
                                className="h-11 px-8 rounded-full font-bold bg-brand-yellow hover:bg-yellow-400 text-black border-none shadow-lg transform active:scale-95 transition-all"
                              >
                                <Download size={18} className="mr-2" /> Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {/* Loading State */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start w-full mb-8"
                >
                  <div className="flex gap-4 max-w-[85%]">
                    <div className="w-10 h-10 rounded-full shrink-0 border border-black/5 dark:border-white/10 bg-white dark:bg-zinc-800 shadow-sm overflow-hidden p-0.5">
                      <img
                        src="/logo.png"
                        className="w-full h-full object-cover rounded-full animate-pulse"
                        alt="AI"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-800 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm">
                      <motion.span
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          delay: 0,
                        }}
                        className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                      ></motion.span>
                      <motion.span
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          delay: 0.2,
                        }}
                        className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                      ></motion.span>
                      <motion.span
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          delay: 0.4,
                        }}
                        className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                      ></motion.span>
                    </div>
                  </div>
                </motion.div>
              )}
              {/* Error State */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center w-full my-4"
                >
                  <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-sm font-bold shadow-sm backdrop-blur-md">
                    <AlertCircle size={16} /> {error}
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} className="h-24" />{" "}
              {/* Spacer for bottom input */}
            </AnimatePresence>
          </div>

          {/* Sticky Input Area */}
          {messages.length > 0 && (
            <div className="absolute bottom-0 inset-x-0 p-4 md:p-6 z-50 bg-gradient-to-t from-[#F3F4F6] via-[#F3F4F6] to-transparent dark:from-[#080808] dark:via-[#080808] pt-24 pointer-events-none">
              <div className="max-w-4xl mx-auto relative pointer-events-auto">
                <motion.form
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  onSubmit={handleRefine}
                  className="flex items-end gap-3 bg-white dark:bg-[#1A1A1A] p-2 pl-5 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-gray-100 dark:border-zinc-800 transition-all focus-within:ring-2 focus-within:ring-brand-yellow/30"
                >
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleRefine(e);
                      }
                    }}
                    placeholder="Send a message to refine..."
                    className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[48px] py-3.5 text-[15px] font-medium text-gray-900 dark:text-white placeholder:text-gray-400/80 leading-relaxed outline-none"
                    rows={1}
                    disabled={loading}
                  />
                  <div className="flex items-center gap-1 pb-1.5 pr-1.5">
                    <Button
                      type="submit"
                      variant="viral"
                      className="h-11 w-11 p-0 rounded-full flex items-center justify-center bg-brand-yellow text-black hover:bg-yellow-400 hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:hover:scale-100 disabled:grayscale"
                      disabled={loading || !chatInput.trim()}
                    >
                      {loading ? (
                        <Sparkles size={20} className="animate-spin" />
                      ) : (
                        <ArrowUpCircle size={24} />
                      )}
                    </Button>
                  </div>
                </motion.form>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
