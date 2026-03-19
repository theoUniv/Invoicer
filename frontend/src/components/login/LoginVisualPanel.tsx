import { Button } from '@/components/ui';
import { Plus } from 'lucide-react';
import Image from 'next/image';

interface LoginVisualPanelProps {
  className?: string;
}

export function LoginVisualPanel({ className = '' }: LoginVisualPanelProps) {
  return (
    <div className={`flex-1 relative overflow-hidden flex flex-col justify-between p-12 ${className}`}>
      <div 
        className="absolute inset-0 z-10 opacity-70 blur-[60px]"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #E8D8D8 0%, #d4c5d3ff 50%, #F4F1ED 70%)'
        }}
      />
      
      <div className="relative z-10">
        <Image src="/brand/logo_horizontal_black.png" alt="Logo" width={100} height={50} />
      </div>
      <div className="relative z-10">
        <h2 className="font-['Playfair_Display'] font-normal tracking-[-0.02em] text-[3rem] leading-[1.1] mb-8 max-w-[80%]">
          Intelligent<br />
          financial<br />
          clarity.
        </h2>
        <Button 
          variant="circle-light"
          size="icon"
          title="Learn more"
          className="cursor-default"
        >
          <Plus size={20} />
        </Button>
      </div>
    </div>
  );
}
