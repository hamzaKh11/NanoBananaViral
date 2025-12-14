import React from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/Button";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import {
  Zap,
  Check,
  Moon,
  Sun,
  ArrowRight,
  TrendingUp,
  Image as ImageIcon,
  Video,
  Star,
  ShieldCheck,
  PlayCircle,
} from "lucide-react";

interface LandingPageProps {
  onLogin: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLogin,
  isDark,
  toggleTheme,
}) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen font-sans transition-colors duration-300 bg-white dark:bg-black text-brand-black dark:text-white selection:bg-brand-yellow selection:text-black">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            {/* LOGO REPLACEMENT HERE */}
            <img
              src="/logo.png"
              alt="BananaViral Logo"
              className="w-8 h-8 md:w-10 md:h-10 rounded-xl shadow-lg transform rotate-3 border-2 border-black object-cover bg-brand-yellow"
            />

            <span className="font-display font-black text-xl md:text-2xl tracking-tighter text-black dark:text-white">
              Banana<span className="text-brand-yellow">Viral</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-600 dark:text-gray-300">
            <button
              onClick={() => scrollToSection("features")}
              className="hover:text-brand-yellow transition focus:outline-none"
            >
              How it Works
            </button>
            <button
              onClick={() => scrollToSection("usecases")}
              className="hover:text-brand-yellow transition focus:outline-none"
            >
              Use Cases
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="hover:text-brand-yellow transition focus:outline-none"
            >
              Pricing
            </button>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 md:p-3 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Button
              variant="ghost"
              onClick={onLogin}
              className="hidden md:inline-flex font-bold"
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              onClick={onLogin}
              className="text-sm md:text-base px-4 py-2 md:px-6 md:py-3"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section / Features */}
      <section
        id="features"
        className="pt-28 pb-12 md:pt-40 md:pb-20 px-4 md:px-6 relative overflow-hidden"
      >
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 py-1.5 px-4 md:py-2 md:px-6 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-yellow-700 dark:text-brand-yellow text-[10px] md:text-xs font-black uppercase tracking-widest mb-6 md:mb-8">
              <Zap size={12} className="fill-current md:w-3.5 md:h-3.5" />
              <span>v3.0 Now Live: Face Integration</span>
            </div>

            <h1 className="font-display text-5xl md:text-8xl font-black leading-[0.95] md:leading-[0.9] mb-6 md:mb-8 tracking-tighter">
              STOP POSTING <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-gray-400 to-gray-600 opacity-50 stroke-black stroke-2">
                BORING
              </span>
              <span className="relative inline-block ml-3 md:ml-4">
                VIRAL
                <span className="absolute -bottom-1 md:-bottom-2 left-0 w-full h-2 md:h-3 bg-brand-yellow -z-10 transform -rotate-1"></span>
              </span>
              <br />
              THUMBNAILS.
            </h1>

            <p className="text-gray-600 dark:text-gray-300 text-lg md:text-2xl mb-8 md:mb-12 max-w-2xl mx-auto font-medium px-2">
              The only AI engine trained on{" "}
              <span className="text-black dark:text-white font-bold bg-brand-yellow/20 px-1 rounded">
                1 Million+ viral views
              </span>
              . Upload your face, pick a style, and dominate the algorithm
              instantly.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-16 md:mb-24 w-full md:w-auto px-4 md:px-0">
              <Button
                variant="primary"
                onClick={onLogin}
                className="w-full md:w-auto h-14 md:h-16 px-8 md:px-12 text-lg md:text-xl rounded-xl shadow-glow"
              >
                Generate Viral Thumbnail{" "}
                <ArrowRight className="ml-2 w-5 h-5 md:w-6 md:h-6" />
              </Button>
              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 dark:text-gray-400 font-bold mt-2 md:mt-0">
                <ShieldCheck
                  size={14}
                  className="text-green-500 md:w-4 md:h-4"
                />
                Money-back Guarantee
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative z-10"
          >
            <div className="transform md:rotate-1 hover:rotate-0 transition duration-500 w-full">
              <BeforeAfterSlider />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <div className="py-8 md:py-12 bg-black text-white overflow-hidden border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          <span className="font-bold text-gray-400 uppercase tracking-widest text-xs md:text-sm text-center md:text-left">
            Trusted by creators who grew from 0 to 1M on
          </span>

          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-16 opacity-90">
            {/* YouTube */}
            <div className="flex items-center gap-2 group cursor-default">
              <svg
                className="w-6 h-6 md:w-8 md:h-8 text-yt-red fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <span className="font-sans font-bold text-xl md:text-2xl tracking-tighter text-white">
                YouTube
              </span>
            </div>

            {/* TikTok */}
            <div className="flex items-center gap-2 group cursor-default">
              <svg
                className="w-5 h-5 md:w-7 md:h-7 text-white fill-current"
                viewBox="0 0 24 24"
                style={{
                  filter:
                    "drop-shadow(-2px -2px 0 #00f2ea) drop-shadow(2px 2px 0 #ff0050)",
                }}
              >
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v6.14c0 3.48-2.55 6.42-6.02 6.74-3.47.32-6.89-2.26-7.48-5.71-.59-3.45 1.6-6.68 4.96-7.27.35-.06.7-.1 1.05-.12v4.06c-1.27.06-2.45 1.2-2.45 2.53 0 1.2 1.14 2.17 2.45 2.17 1.4 0 2.53-1.16 2.53-2.53V.02h.88z" />
              </svg>
              <span className="font-sans font-bold text-xl md:text-2xl tracking-tighter text-white">
                TikTok
              </span>
            </div>

            {/* Instagram */}
            <div className="flex items-center gap-2 group cursor-default">
              <svg
                className="w-6 h-6 md:w-8 md:h-8 text-white fill-current"
                viewBox="0 0 24 24"
              >
                <defs>
                  <linearGradient
                    id="instaGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#f09433" />
                    <stop offset="50%" stopColor="#e6683c" />
                    <stop offset="100%" stopColor="#bc1888" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#instaGrad)"
                  d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                />
              </svg>
              <span className="font-sans font-bold text-xl md:text-2xl tracking-tighter text-white">
                Instagram
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <section
        id="usecases"
        className="py-16 md:py-24 px-4 md:px-6 bg-gray-50 dark:bg-brand-dark"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-black font-display mb-4 md:mb-6">
              Built for Every Platform
            </h2>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
              Don't just make thumbnails. Build an empire across every vertical.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* YouTube */}
            <div className="bg-white dark:bg-black p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl hover:shadow-2xl transition-all group">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Video size={28} className="md:w-8 md:h-8" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-4">
                YouTube Long Form
              </h3>
              <p className="text-gray-500 mb-6 text-sm md:text-base">
                Perfect 16:9 thumbnails with high facial expression recognition
                to boost CTR by up to 300%.
              </p>
              <div className="aspect-video bg-gray-100 dark:bg-zinc-900 rounded-xl overflow-hidden relative group-hover:shadow-lg transition-all">
                <img
                  src="youtube.jpeg"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  alt="YouTube Thumbnail"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-bold border border-white/20">
                    16:9 Format
                  </div>
                </div>
              </div>
            </div>

            {/* Shorts */}
            <div className="bg-white dark:bg-black p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl hover:shadow-2xl transition-all group">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-black dark:bg-zinc-800 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ImageIcon size={28} className="md:w-8 md:h-8" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-4">
                Shorts & TikTok
              </h3>
              <p className="text-gray-500 mb-6 text-sm md:text-base">
                Vertical 9:16 covers that stop the infinite scroll. Designed for
                mobile-first visibility.
              </p>
              <div className="aspect-[9/16] w-1/2 mx-auto bg-gray-100 dark:bg-zinc-900 rounded-xl overflow-hidden relative shadow-md group-hover:shadow-xl transition-all">
                <img
                  src="tiktok.jpeg"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  alt="TikTok Thumbnail"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-4">
                  <span className="text-white font-bold text-xs uppercase tracking-widest">
                    Viral
                  </span>
                </div>
              </div>
            </div>

            {/* A/B Testing */}
            <div className="bg-white dark:bg-black p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl hover:shadow-2xl transition-all group">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp size={28} className="md:w-8 md:h-8" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-4">
                A/B Testing Variants
              </h3>
              <p className="text-gray-500 mb-6 text-sm md:text-base">
                Generate 4 variations of the same concept instantly to test
                which emotion gets more clicks.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {["y1.png", "y2.jpeg", "y3.png", "y4.png"].map((src, i) => (
                  <div
                    key={i}
                    className="aspect-video bg-gray-100 dark:bg-zinc-900 rounded-lg overflow-hidden relative group/item"
                  >
                    <img
                      src={src}
                      className="w-full h-full object-cover opacity-80 group-hover/item:opacity-100 transition-opacity"
                      alt="Variant"
                    />
                    {i === 0 && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-16 md:py-24 px-4 md:px-6 bg-white dark:bg-black transition-colors relative"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-black font-display mb-4">
              Pricing Built for ROI
            </h2>
            <p className="text-gray-500 text-lg">
              We don't offer free plans because quality GPU time costs money.
              Invest in your growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mx-auto">
            {/* Starter Plan $19 */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors flex flex-col">
              <h3 className="text-xl font-bold mb-2">Hobbyist</h3>
              <p className="text-gray-500 text-sm mb-6">
                For experimental channels.
              </p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black">$19</span>
                <span className="text-gray-500 font-medium">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Check size={18} className="text-gray-400 shrink-0" /> 50
                  Credits
                </li>
                <li className="flex gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Check size={18} className="text-gray-400 shrink-0" /> 1K
                  Resolution Only
                </li>
                <li className="flex gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Check size={18} className="text-gray-400 shrink-0" />{" "}
                  Standard Speed
                </li>
              </ul>
              <Button
                variant="outline"
                className="w-full rounded-xl py-3"
                onClick={onLogin}
              >
                Choose Hobbyist
              </Button>
            </div>

            {/* Creator Plan $29 */}
            <div className="bg-gray-50 dark:bg-zinc-900/50 border-2 border-brand-yellow/50 dark:border-brand-yellow/30 rounded-3xl p-6 md:p-8 hover:border-brand-yellow transition-colors relative overflow-hidden flex flex-col shadow-lg">
              <h3 className="text-xl font-bold mb-2">Creator</h3>
              <p className="text-gray-500 text-sm mb-6">
                Perfect for growing channels.
              </p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl md:text-5xl font-black">$29</span>
                <span className="text-gray-500 font-medium">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex gap-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                  <Check size={18} className="text-brand-yellow shrink-0" /> 100
                  Credits
                </li>
                <li className="flex gap-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                  <Check size={18} className="text-brand-yellow shrink-0" /> 2K
                  High Resolution
                </li>
                <li className="flex gap-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                  <Check size={18} className="text-brand-yellow shrink-0" /> No
                  Watermark
                </li>
              </ul>
              <Button
                variant="primary"
                className="w-full rounded-xl py-3 bg-brand-yellow"
                onClick={onLogin}
              >
                Start Creating
              </Button>
            </div>

            {/* Pro Plan $59 */}
            <div className="bg-black dark:bg-zinc-950 text-white border-4 border-brand-yellow rounded-3xl p-6 md:p-8 relative shadow-2xl flex flex-col">
              <div className="absolute top-0 right-0 bg-brand-yellow text-black text-[10px] md:text-xs font-black px-4 py-2 rounded-bl-xl uppercase tracking-wider">
                Best Value
              </div>
              <h3 className="text-xl font-bold mb-2 text-brand-yellow flex items-center gap-2">
                Viral Agency <Star size={16} fill="currentColor" />
              </h3>
              <p className="text-gray-400 text-sm mb-6">For pros & agencies.</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl md:text-5xl font-black">$59</span>
                <span className="text-gray-400 font-medium">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex gap-3 text-sm font-medium">
                  <div className="bg-brand-yellow rounded-full p-1">
                    <Check size={12} className="text-black shrink-0" />
                  </div>{" "}
                  <strong>400 Credits</strong>
                </li>
                <li className="flex gap-3 text-sm font-medium">
                  <div className="bg-brand-yellow rounded-full p-1">
                    <Check size={12} className="text-black shrink-0" />
                  </div>{" "}
                  <strong>4K Ultra HD</strong>
                </li>
                <li className="flex gap-3 text-sm font-medium">
                  <div className="bg-brand-yellow rounded-full p-1">
                    <Check size={12} className="text-black shrink-0" />
                  </div>{" "}
                  Priority GPU
                </li>
              </ul>
              <Button
                variant="viral"
                className="w-full rounded-xl py-3 font-black"
                onClick={onLogin}
              >
                Get Agency Access
              </Button>
            </div>
          </div>

          <div className="text-center mt-8 md:mt-12 text-xs md:text-sm text-gray-500">
            Secure payment via Lemon Squeezy • Cancel anytime • 24/7 Support
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 md:py-12 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-black text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          {/* LOGO REPLACEMENT IN FOOTER TOO */}
          <img
            src="/logo.png"
            alt="BananaViral Logo"
            className="w-8 h-8 rounded-lg border border-black object-cover bg-brand-yellow"
          />
          <span className="font-bold text-xl text-black dark:text-white">
            Banana<span className="text-brand-yellow">Viral</span>
          </span>
        </div>
        <p className="text-gray-500 text-xs md:text-sm mb-4">
          © 2024 BananaViral Inc. Optimized for Google Search & Viral Growth.
        </p>
      </footer>
    </div>
  );
};
