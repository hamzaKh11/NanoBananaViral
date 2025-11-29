import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'viral' | 'outline';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  isLoading = false, 
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-bold tracking-tight transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-black focus:ring-offset-white";
  
  const variants = {
    // Brand Yellow (Primary Action)
    primary: "bg-brand-yellow text-black hover:bg-yellow-400 focus:ring-yellow-500 shadow-md hover:shadow-lg border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1",
    
    // Black (Secondary)
    secondary: "bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200 border-b-4 border-gray-800 dark:border-gray-400 active:border-b-0 active:translate-y-1",
    
    // Ghost
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10",
    
    // Outline
    outline: "bg-transparent border-2 border-gray-200 text-gray-700 hover:border-gray-900 hover:text-black dark:border-zinc-700 dark:text-gray-300 dark:hover:border-white dark:hover:text-white",
    
    // Viral (Gradient)
    viral: "bg-gradient-to-r from-brand-yellow to-yellow-400 text-black shadow-[0_0_20px_rgba(255,230,0,0.4)] hover:shadow-[0_0_30px_rgba(255,230,0,0.6)] border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1"
  };

  const sizes = "px-6 py-3 text-sm md:text-base";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};
