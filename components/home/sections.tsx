'use client';

import { motion } from 'framer-motion';
import {
  Swords, Shield, Trophy, Zap, Brain, Clock, Users, Wifi,
  ChevronDown, HelpCircle, Mail, Phone, MapPin, Globe
} from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const highlights = [
  { icon: Brain, title: 'Multiple Rounds', desc: 'Face progressively harder challenges across multiple competitive rounds.' },
  { icon: Clock, title: 'Timed Questions', desc: 'Race against the clock — every second counts in your quest for survival.' },
  { icon: Swords, title: 'Live Competition', desc: 'Compete in real-time with live leaderboards and instant scoring.' },
  { icon: Shield, title: 'Anti-Cheat System', desc: 'Advanced monitoring ensures fair play with fullscreen enforcement and tab detection.' },
  { icon: Wifi, title: 'Real-Time Updates', desc: 'Watch scores, ranks, and announcements update live as the competition unfolds.' },
  { icon: Trophy, title: 'Winner Ceremony', desc: 'Top performers earn recognition with a spectacular digital winner ceremony.' },
];

const rules = [
  ,
  'Only one active session per team is allowed.',
  'Switching tabs or exiting fullscreen during rounds is monitored.',
  'Each question can only be answered once — no re-submissions.',
  'Admin decisions on violations and scoring are final.',
  'Teams must maintain a stable internet connection during rounds.',
  'Use of external tools, AI, or unauthorized resources is prohibited.',
  'Eliminated teams cannot rejoin the competition.',
];


const faqs = [
  { q: 'How do I register my team?', a: 'Click the "Register Team" button on the homepage, fill in your team details, and wait for admin approval.' },
  { q: 'How many members can a team have?', a: 'Each team can have between 2 to 5 members. The team leader registers and manages the team.' },
  { q: 'What happens if I lose internet during a round?', a: 'Your progress is saved. Reconnect as soon as possible — the timer continues regardless.' },
  { q: 'Can I use Google or other resources?', a: 'No. External tools, AI assistants, and unauthorized resources are strictly prohibited during rounds.' },
  { q: 'How is scoring calculated?', a: 'Questions have assigned marks. Correct answers earn full marks, and negative marking may apply for wrong answers.' },
  { q: 'What if there\'s a tie?', a: 'Ties are broken by submission speed — the team that submitted correct answers fastest wins.' },
];

export function Highlights() {
  return (
    <section className="py-20 px-4 bg-zinc-950/50">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-100">Event Highlights</h2>
          <p className="mt-2 text-zinc-500">What makes Tech Survivor the ultimate technical challenge</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full hover:border-red-500/30 transition-colors group">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-4 group-hover:bg-red-500/20 transition-colors">
                    <item.icon className="h-6 w-6 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-100 mb-2">{item.title}</h3>
                  <p className="text-sm text-zinc-400">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Rules() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-100">Rules & Guidelines</h2>
          <p className="mt-2 text-zinc-500">Read carefully before participating</p>
        </motion.div>
        <div className="space-y-3">
          {rules.map((rule, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800"
            >
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-sm font-bold">
                {i + 1}
              </span>
              <p className="text-sm text-zinc-300">{rule}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}



export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
          <HelpCircle className="h-8 w-8 text-red-400 mx-auto mb-3" />
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-100">FAQ</h2>
        </motion.div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="text-sm font-medium text-zinc-200">{faq.q}</span>
                <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === i && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-zinc-400">{faq.a}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section className="py-20 px-4 bg-zinc-950/50">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-2">Contact Us</h2>
          <p className="text-zinc-500 mb-10">Have questions? Reach out to the organizing team.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Mail, label: 'Email', value: 'clubasymmetric@citchennai.net' },
            { icon: Phone, label: 'Phone', value: '+91 9488363352' },
            { icon: MapPin, label: 'Venue', value: 'CIT' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2 p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
              <item.icon className="h-6 w-6 text-red-400" />
              <span className="text-sm font-medium text-zinc-300">{item.label}</span>
              <span className="text-sm text-zinc-500">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-red-500" />
          <span className="font-bold text-zinc-100">TECH SURVIVOR</span>
        </div>
        <p className="text-xs text-zinc-500">
          &copy; {new Date().getFullYear()} Team Asymmetric. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <a href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <Globe className="h-5 w-5" />
          </a>
          <a href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <Users className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
