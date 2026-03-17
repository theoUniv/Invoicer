'use client';

import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { useAppTranslation } from '@/hooks/useTranslation';

interface UploadAreaProps {
  onFileSelect?: (file: File) => void;
}

export function UploadArea({ onFileSelect }: UploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const { t } = useAppTranslation();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && onFileSelect) {
      onFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onFileSelect) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div
      className={`border border-dashed border-[rgba(26,24,23,0.8)] rounded p-8 flex flex-col items-center justify-center text-center gap-4 bg-white/40 backdrop-blur-[10px] transition-colors cursor-pointer ${
        isDragOver ? 'bg-white/70' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Upload size={24} className="stroke-[#1A1817] stroke-1 fill-none" />
      <div className="text-sm text-[#8A8580]">
        {t('dashboard.dragDropText')}
      </div>
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileInput}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="inline-flex items-center justify-center px-6 py-2 text-xs uppercase tracking-[0.05em] font-medium cursor-pointer transition-all duration-200 rounded-full bg-[#1A1817] text-white border border-[#1A1817] hover:bg-transparent hover:text-[#1A1817]"
      >
        {t('dashboard.selectFile')}
      </label>
    </div>
  );
}
