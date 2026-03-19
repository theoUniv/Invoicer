'use client';

import { Hero, Features, Interface, Teams, FinalCTA, Header, CTA } from '@/components/landing';
import { Footer } from '@/components/landing/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#1A1817] antialiased relative w-full">
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
      <Header />

      <main className="flex-grow flex flex-col w-full relative z-10">
        <Hero />
        <Features />
        <Teams />
        <Interface />
        <CTA />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
