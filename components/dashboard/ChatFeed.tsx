import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Download, AlertCircle } from "lucide-react";
import { Button } from "../ui/Button"; // path fixed
import { Platform } from "../../types"; // path fixed

interface Message {
  id: string;
  role: "user" | "assistant";
  type: "text" | "image";
  content: string;
}

interface ChatFeedProps {
  messages: Message[];
  loading: boolean;
  error: string | null;
  handleDownload: (url: string) => void;
  platform: Platform;
}

export const ChatFeed: React.FC<ChatFeedProps> = ({
  messages,
  loading,
  error,
  handleDownload,
  platform,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);
  }, [messages, loading]);

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
    <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar scroll-smooth">
      {messages.length === 0 && !loading && !error && (
        <div className="h-full flex flex-col items-center justify-center opacity-40">
          <div className="w-24 h-24 bg-gray-200 dark:bg-zinc-900 rounded-full mb-6 flex items-center justify-center overflow-hidden border-4 grayscale opacity-50">
            <img
              src="/logo.png"
              className="w-full h-full object-cover"
              alt="Logo"
            />
          </div>
          <h2 className="text-3xl font-black text-gray-400 uppercase">
            Banana Studio
          </h2>
          <p className="text-sm font-medium text-gray-400 mt-2">
            Start a session in the sidebar to begin.
          </p>
        </div>
      )}

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
              <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center overflow-hidden border bg-white dark:bg-zinc-800 shadow-sm mt-1">
                {msg.role === "user" ? (
                  <User size={20} className="text-gray-500" />
                ) : (
                  <img
                    src="/logo.png"
                    className="w-full h-full object-cover"
                    alt="AI"
                  />
                )}
              </div>
              <div className="flex flex-col gap-2">
                {msg.type === "text" && (
                  <div
                    className={`px-5 py-3.5 text-[15px] font-medium shadow-sm max-w-xl ${
                      msg.role === "user"
                        ? "bg-[#E7E7E9] dark:bg-zinc-800 rounded-[1.5rem] rounded-tr-sm"
                        : "bg-transparent font-normal pl-0"
                    }`}
                  >
                    {msg.content}
                  </div>
                )}
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
                      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all flex justify-center">
                        <Button
                          variant="primary"
                          onClick={() => handleDownload(msg.content)}
                          className="rounded-full font-bold bg-brand-yellow text-black"
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

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start w-full mb-8"
          >
            <div className="flex gap-4 max-w-[85%]">
              <div className="w-10 h-10 rounded-full shrink-0 bg-white dark:bg-zinc-800 shadow-sm overflow-hidden">
                <img
                  src="/logo.png"
                  className="w-full h-full object-cover animate-pulse"
                />
              </div>
              <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-800 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center w-full my-4"
          >
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-100 rounded-xl text-red-600 text-sm font-bold shadow-sm">
              <AlertCircle size={16} /> {error}
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-24" />
      </AnimatePresence>
    </div>
  );
};
