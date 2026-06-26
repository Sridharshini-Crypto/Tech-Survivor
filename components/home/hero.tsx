'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Swords, ShieldCheck, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-zinc-950 to-zinc-950" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-red-400 text-sm font-medium tracking-[0.3em] uppercase mb-4"
        >
          Team Asymmetric Presents
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter"
        >
          <span className="bg-gradient-to-r from-red-500 via-red-400 to-red-600 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(220,38,38,0.5)]">
            TECH
          </span>
          <br />
          <span className="text-zinc-100">SURVIVOR</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto"
        >
          The ultimate competitive technical event platform. Register your team, compete in rounds, and prove your supremacy.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/register">
            <Button size="lg" className="group">
              <UserPlus className="h-5 w-5 transition-transform group-hover:scale-110" />
              Register Team
            </Button>
          </Link>
          <Link href="/team-login">
            <Button variant="outline" size="lg" className="group">
              <Swords className="h-5 w-5 transition-transform group-hover:rotate-12" />
              Team Login
            </Button>
          </Link>
          <Link href="/admin-login">
            <Button variant="ghost" size="lg">
              <ShieldCheck className="h-5 w-5" />
              Admin Login
            </Button>
          </Link>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 rounded-full border-2 border-zinc-600 flex items-start justify-center p-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
        </motion.div>
      </div>
    </section>
  );
}
