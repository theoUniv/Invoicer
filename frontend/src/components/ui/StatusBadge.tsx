import React from 'react';

interface StatusBadgeProps {
  status: 'processed' | 'pending';
  children: React.ReactNode;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const baseClasses = 'inline-block px-3 py-1 text-xs uppercase tracking-[0.05em] rounded-full';
  const statusClasses = status === 'processed' 
    ? 'border border-[#1A1817] text-[#1A1817]'
    : 'border border-dashed border-[#8A8580] text-[#8A8580]';

  return (
    <span className={`${baseClasses} ${statusClasses}`}>
      {children}
    </span>
  );
}
