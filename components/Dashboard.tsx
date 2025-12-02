import React, { useState, useEffect } from "react";
import { Platform, Resolution, ThumbnailParams } from "../types"; // path fixed
import { generateThumbnail } from "../services/geminiService"; // path fixed
import { deductCredits, supabase } from "../lib/supabase"; // path fixed

// Import our new split components
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { GeneratorSidebar } from "./dashboard/GeneratorSidebar";
import { ChatFeed } from "./dashboard/ChatFeed";
import { RefinementInput } from "./dashboard/RefinementInput";

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

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const Dashboard: React.FC<DashboardProps> = ({
  onBack,
  user: initialUser,
}) => {
  const [user, setUser] = useState(initialUser);

  // --- Inputs State ---
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.history.pushState({}, "", "/app");
  }, []);

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

  const handleGenerate = async () => {
    if (user.credits < 1) {
      setError("Out of credits. Please upgrade.");
      return;
    }
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setMessages([]);

    if (window.innerWidth < 768) {
      setTimeout(
        () =>
          document
            .getElementById("chat-feed")
            ?.scrollIntoView({ behavior: "smooth" }),
        100
      );
    }

    try {
      const { data: session, error: sessError } = await supabase
        .from("design_sessions")
        .insert({ user_id: user.id, topic })
        .select()
        .single();
      if (sessError) throw sessError;
      setSessionId(session.id);

      const userMsg: Message = {
        id: generateId(),
        role: "user",
        type: "text",
        content: topic,
      };
      setMessages([userMsg]);

      const params: ThumbnailParams = {
        topic,
        platform,
        resolution,
        intensity,
        faceImageBase64: faceImage,
        styleImageBase64: styleImage,
      };
      const base64Image = await generateThumbnail(params);

      await deductCredits(user.id, 1);
      setUser((prev: any) => ({
        ...prev,
        credits: Math.max(0, prev.credits - 1),
      }));

      const aiMsg: Message = {
        id: generateId(),
        role: "assistant",
        type: "image",
        content: base64Image,
      };
      setMessages((prev) => [...prev, aiMsg]);

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

  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !sessionId || loading) return;

    const instruction = chatInput;
    setChatInput("");
    setLoading(true);
    setError(null);

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

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#050505] text-gray-900 dark:text-white font-sans flex flex-col overflow-hidden">
      <DashboardHeader user={user} onBack={onBack} />

      <main className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
        <GeneratorSidebar
          user={user}
          topic={topic}
          setTopic={setTopic}
          faceImage={faceImage}
          setFaceImage={setFaceImage}
          styleImage={styleImage}
          setStyleImage={setStyleImage}
          platform={platform}
          setPlatform={setPlatform}
          resolution={resolution}
          setResolution={setResolution}
          intensity={intensity}
          setIntensity={setIntensity}
          loading={loading}
          onGenerate={handleGenerate}
          handleImageUpload={handleImageUpload}
        />

        <section
          id="chat-feed"
          className="flex-1 flex flex-col h-full bg-[#F3F4F6] dark:bg-[#080808] relative overflow-hidden"
        >
          <div
            className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, #888 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <ChatFeed
            messages={messages}
            loading={loading}
            error={error}
            handleDownload={handleDownload}
            platform={platform}
          />

          <RefinementInput
            chatInput={chatInput}
            setChatInput={setChatInput}
            handleRefine={handleRefine}
            loading={loading}
            isVisible={messages.length > 0}
          />
        </section>
      </main>
    </div>
  );
};
