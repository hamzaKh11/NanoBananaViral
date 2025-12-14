import React from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/Button"; // path fixed
import { Sparkles, ArrowUpCircle } from "lucide-react";

interface RefinementInputProps {
  chatInput: string;
  setChatInput: (val: string) => void;
  handleRefine: (e: React.FormEvent) => void;
  loading: boolean;
  isVisible: boolean;
}

export const RefinementInput: React.FC<RefinementInputProps> = ({
  chatInput,
  setChatInput,
  handleRefine,
  loading,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute bottom-0 inset-x-0 p-4 md:p-6 z-50 bg-gradient-to-t from-[#F3F4F6] via-[#F3F4F6] to-transparent dark:from-[#080808] dark:via-[#080808] pt-24 pointer-events-none">
      <div className="max-w-4xl mx-auto relative pointer-events-auto">
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onSubmit={handleRefine}
          className="flex items-end gap-3 bg-white dark:bg-[#1A1A1A] p-2 pl-5 rounded-[2rem] shadow-xl border border-gray-100 dark:border-zinc-800 transition-all focus-within:ring-2 focus-within:ring-brand-yellow/30"
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
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[48px] py-3.5 text-[15px] font-medium text-gray-900 dark:text-white outline-none"
            rows={1}
            disabled={loading}
          />
          <div className="flex items-center gap-1 pb-1.5 pr-1.5">
            <Button
              type="submit"
              variant="viral"
              className="h-11 w-11 p-0 rounded-full flex items-center justify-center bg-brand-yellow text-black hover:bg-yellow-400 hover:scale-105 transition-all shadow-md"
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
  );
};
