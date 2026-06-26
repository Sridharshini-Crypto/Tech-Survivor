'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, Crown, Star } from 'lucide-react';
import Link from 'next/link';
import { Confetti } from '@/components/animations/confetti';
import { generateAvatar } from '@/lib/utils';

interface LeaderboardEntry {
  id: string;
  rank: number;
  team_name: string;
  avatar_url?: string;
  total_score: number;
  college_name: string;
}

export default function WinnersPage() {
  const { data: teams = [] } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: () => fetch('/api/leaderboard').then((r) => r.json()),
  });

  const top3 = teams.slice(0, 3);
  const champion = top3[0];
  const runner = top3[1];
  const second = top3[2];

  const podiumConfig = [
    { team: runner, label: 'Runner-Up', emoji: '🥈', height: 'h-32', delay: 0.6, order: 1 },
    { team: champion, label: 'Champion', emoji: '🥇', height: 'h-44', delay: 0.3, order: 0 },
    { team: second, label: '2nd Runner-Up', emoji: '🥉', height: 'h-24', delay: 0.9, order: 2 },
  ];

  return (
    <div className="min-h-screen bg-[#09090B] relative overflow-hidden">
      <Confetti />

      <div className="absolute inset-0 bg-gradient-to-b from-red-950/30 via-zinc-950 to-zinc-950" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 mb-12 text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Crown className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-yellow-400 via-red-400 to-yellow-400 bg-clip-text text-transparent">
            WINNERS
          </h1>
          <p className="text-zinc-500 mt-2">The competition has concluded</p>
        </motion.div>

        {top3.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500">Winners will be announced after the competition</p>
          </div>
        ) : (
          <>
            <div className="flex items-end justify-center gap-4 md:gap-8 mb-16">
              {podiumConfig.map(({ team, label, emoji, height, delay }) => (
                team ? (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay, duration: 0.6, type: 'spring' }}
                    className="flex flex-col items-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: delay + 0.3, type: 'spring' }}
                      className="mb-4"
                    >
                      <img
                        src={team.avatar_url || generateAvatar(team.team_name)}
                        alt={team.team_name}
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-red-500/30 shadow-lg shadow-red-500/20"
                      />
                    </motion.div>
                    <span className="text-3xl mb-1">{emoji}</span>
                    <p className="text-sm font-bold text-zinc-100 text-center">{team.team_name}</p>
                    <p className="text-xs text-zinc-500">{team.college_name}</p>
                    <p className="text-lg font-bold text-red-400 mt-1">{team.total_score} pts</p>
                    <p className="text-xs text-zinc-600 mt-1">{label}</p>

                    <div className={`w-24 md:w-32 ${height} mt-4 rounded-t-xl bg-gradient-to-t from-red-900/40 to-red-600/20 border border-red-500/20 flex items-center justify-center`}>
                      <Star className="h-6 w-6 text-red-400/40" />
                    </div>
                  </motion.div>
                ) : null
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <h2 className="text-xl font-bold text-zinc-100 mb-4 text-center">Final Leaderboard</h2>
              <div className="space-y-2">
                {teams.map((team, i) => (
                  <div key={team.id} className="flex items-center gap-4 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                    <span className="w-8 text-center text-sm font-bold text-zinc-500">{i + 1}</span>
                    <img src={team.avatar_url || generateAvatar(team.team_name)} alt="" className="w-8 h-8 rounded-full" />
                    <span className="flex-1 text-sm text-zinc-200">{team.team_name}</span>
                    <span className="text-sm text-zinc-500">{team.college_name}</span>
                    <span className="text-sm font-bold text-red-400">{team.total_score}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
