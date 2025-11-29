import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';
import { X, Mail, Lock, AlertCircle, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;
      if (isLogin) {
        result = await supabase.auth.signInWithPassword({ email, password });
      } else {
        // Sign Up with Name and Default Metadata
        result = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: fullName,
              plan: 'free', // Default to free so they hit the Payment Wall
              credits: 0
            }
          }
        });
      }

      if (result.error) throw result.error;

      if (result.data.user) {
        onSuccess(result.data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white dark:bg-brand-dark w-full md:max-w-md rounded-2xl shadow-2xl p-6 md:p-8 relative z-10"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white">
              <X size={20} />
            </button>

            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-black text-black dark:text-white mb-2">
                {isLogin ? 'Welcome Back' : 'Join BananaViral'}
              </h2>
              <p className="text-gray-500 text-sm md:text-base">
                {isLogin ? 'Sign in to access your studio' : 'Create an account to start generating'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {/* Name Input - Only for Sign Up */}
              {!isLogin && (
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-brand-yellow outline-none"
                      placeholder="Mr Beast"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-brand-yellow outline-none"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-brand-yellow outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg text-sm">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-black dark:text-white font-bold hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};