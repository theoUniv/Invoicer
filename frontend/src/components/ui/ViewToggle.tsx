'use client';

import { useState } from 'react';
import { Menu, Grid3X3, Folders } from 'lucide-react';

interface ViewToggleProps {
  activeView: 'list' | 'folders';
  onViewChange: (view: 'list' | 'folders') => void;
}

export function ViewToggle({ activeView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex gap-1 p-1 rounded-lg backdrop-blur-sm">
      <button
        className={`p-2 rounded transition-colors cursor-pointer ${
          activeView === 'list' 
            ? 'text-[#1A1817]' 
            : 'text-[#8A8580] hover:text-[#1A1817]'
        }`}
        onClick={() => onViewChange('list')}
        title="List view"
      >
        <Menu size={18} />
      </button>
      <button
        className={`p-2 rounded transition-colors cursor-pointer ${
          activeView === 'folders' 
            ? 'text-[#1A1817]' 
            : 'text-[#8A8580] hover:text-[#1A1817]'
        }`}
        onClick={() => onViewChange('folders')}
        title="Folders view"
      >
        <Folders size={18} />
      </button>
    </div>
  );
}
