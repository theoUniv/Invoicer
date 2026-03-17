import { Button } from '@/components/ui';
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
          background: 'radial-gradient(circle at 50% 50%, #E8D8D8 0%, #D4C5D3 50%, #F4F1ED 70%)'
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
          title="Learn more"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </Button>
      </div>
    </div>
  );
}
