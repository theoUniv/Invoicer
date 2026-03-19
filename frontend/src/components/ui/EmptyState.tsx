'use client';

import { X } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  className?: string;
}

export function EmptyState({ message, className = '' }: EmptyStateProps) {
  return (
    <div  className={`flex items-center justify-between py-3 border-b border-[rgba(26,24,23,0.12)] text-sm ${className}`}>
      <span className="text-[#8A8580]">{message}</span>
      <div className="w-3 h-3 bg-transparent flex items-center justify-center">
        <X size={16} className="text-black" />
      </div>
    </div>
  );
}
