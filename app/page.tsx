'use client';

import { ParticleBackground } from '@/components/animations/particles';
import { Hero } from '@/components/home/hero';
import { Highlights, Rules, FAQ, Contact, Footer } from '@/components/home/sections';

export default function HomePage() {
  return (
    <main className="relative">
      <ParticleBackground />
      <Hero />
      <Highlights />
      <Rules />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  );
}
