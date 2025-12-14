import React, { useState } from "react";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { GeneratorSidebar } from "./dashboard/GeneratorSidebar";
import { ChatFeed } from "./dashboard/ChatFeed";
import { Platform, Resolution } from "../types";

interface DashboardProps {
  user: any;
  onBack: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onBack }) => {
  // --- Global State ---
  const [topic, setTopic] = useState("");
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [styleImage, setStyleImage] = useState<string | null>(null);
  const [platform, setPlatform] = useState<Platform>(Platform.YouTube);
  const [resolution, setResolution] = useState<Resolution>(Resolution.R_1K);
  const [intensity, setIntensity] = useState(50);

  // Triggers the generation in the ChatFeed
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationTrigger, setGenerationTrigger] = useState(0);

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

  const handleSidebarGenerate = () => {
    setIsGenerating(true);
    setGenerationTrigger((prev) => prev + 1);

    // On mobile, smooth scroll down to the chat area when they click generate
    if (window.innerWidth < 768) {
      setTimeout(() => {
        document
          .getElementById("chat-area")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleGenerationComplete = () => {
    setIsGenerating(false);
  };

  return (
    // APP SHELL
    // Mobile: min-h-screen (Scrolls naturally)
    // Desktop: h-screen (Fixed App Shell with no body scroll)
    <div className="min-h-screen w-full bg-gray-50 dark:bg-[#09090b] flex flex-col font-sans md:h-screen md:overflow-hidden">
      {/* 1. HEADER (Fixed at top) */}
      <DashboardHeader user={user} onBack={onBack} />

      {/* 2. MAIN WORKSPACE */}
      {/* Mobile: Flex Column (Stacked) */}
      {/* Desktop: Flex Row (Side by Side) + Overflow Hidden to manage its own scroll */}
      <div className="flex-1 flex flex-col md:flex-row md:overflow-hidden">
        {/* LEFT SIDEBAR (Inputs) */}
        {/* Mobile: h-auto (Full Height, No Scrollbar) - The page scrolls instead */}
        {/* Desktop: Fixed width, Full Height, Internal Scroll */}
        <div className="w-full h-auto border-b border-gray-200 dark:border-white/5 bg-white dark:bg-black/50 shrink-0 z-20 md:w-[420px] md:h-full md:overflow-y-auto md:border-b-0 md:border-r custom-scrollbar">
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
            loading={isGenerating}
            onGenerate={handleSidebarGenerate}
            handleImageUpload={handleImageUpload}
          />
        </div>

        {/* RIGHT MAIN CONTENT (Chat/Results) */}
        {/* Mobile: Fixed height (e.g. 600px) so the user has a "Window" to chat in after scrolling down */}
        {/* Desktop: Flex-1 (Takes remaining width), Full Height */}
        <main
          id="chat-area"
          className="w-full h-[85vh] relative flex flex-col bg-gray-50/50 dark:bg-black/80 md:h-full md:flex-1 md:overflow-hidden"
        >
          <ChatFeed
            user={user}
            topic={topic}
            setTopic={setTopic}
            generationTrigger={generationTrigger}
            onGenerationComplete={handleGenerationComplete}
          />
        </main>
      </div>
    </div>
  );
};
