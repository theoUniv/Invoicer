'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface TooltipProps {
  message: string;
  isVisible: boolean;
}

export function Tooltip({ message, isVisible }: TooltipProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-500 ease-in-out transform ${
        isVisible 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div
        className="px-4 py-3 rounded-lg shadow-[0_4px_14px_rgba(0,0,0,0.03)] bg-[#8A8580] text-[#F4F1ED] flex items-center gap-2"
      >
        <Check 
          width="16" 
          height="16" 
          className="text-current"
        />
        <span className="text-sm font-['Inter'] font-medium">{message}</span>
      </div>
    </div>
  );
}
