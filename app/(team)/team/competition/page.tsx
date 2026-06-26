'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Swords, Send, CheckCircle, AlertTriangle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTeamAuth } from '@/hooks/use-auth';
import { useTimer } from '@/hooks/use-timer';
import { useSecurityMonitor } from '@/hooks/use-security';
import { useRealtimeSubscription } from '@/hooks/use-realtime';
import { formatTimer } from '@/lib/utils';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '@/constants';
import type { Round, Question, Submission } from '@/types';

export default function CompetitionPage() {
  const { team } = useTeamAuth();
  const queryClient = useQueryClient();
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [startTime, setStartTime] = useState<number>(Date.now());

  const { data: rounds = [] } = useQuery<Round[]>({
    queryKey: ['rounds'],
    queryFn: () => fetch('/api/rounds').then((r) => r.json()),
  });

  const activeRound = rounds.find((r) => r.status === 'active');

  const { data: questions = [] } = useQuery<Question[]>({
    queryKey: ['questions', activeRound?.id],
    queryFn: () => fetch(`/api/questions?round_id=${activeRound?.id}`).then((r) => r.json()),
    enabled: !!activeRound,
  });

  const { data: submissions = [] } = useQuery<Submission[]>({
    queryKey: ['submissions', team?.id, activeRound?.id],
    queryFn: () => fetch(`/api/submissions?team_id=${team?.id}&round_id=${activeRound?.id}`).then((r) => r.json()),
    enabled: !!team && !!activeRound,
  });

  const currentQ = questions[currentQIndex];
  const isAnswered = submissions.some((s) => s.question_id === currentQ?.id);

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => fetch('/api/settings').then((r) => r.json()),
  });

  const { timeLeft, isRunning, start, reset } = useTimer({
    initialTime: currentQ?.timer || 60,
    onComplete: () => toast.warning('Time is up!'),
  });

  useEffect(() => {
    if (currentQ) {
      reset(currentQ.timer);
      start();
      setStartTime(Date.now());
      setAnswer('');
    }
  }, [currentQIndex, currentQ?.id]);

  const onViolation = useCallback((type: string, description: string) => {
    if (!activeRound) return;
    fetch('/api/violations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ round_id: activeRound.id, violation_type: type, description }),
    });
    toast.warning(`Violation detected: ${description}`);
  }, [activeRound]);

  const { enterFullscreen } = useSecurityMonitor({
    enableFullscreen: settings?.enable_fullscreen ?? false,
    enableTabSwitchDetection: settings?.enable_tab_switch_detection ?? false,
    enableMultiTabDetection: settings?.enable_multi_tab_detection ?? false,
    onViolation,
  });

  useEffect(() => {
    if (activeRound && settings?.enable_fullscreen) {
      enterFullscreen();
    }
  }, [activeRound, settings?.enable_fullscreen, enterFullscreen]);

  const realtimeCallback = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['rounds'] });
    queryClient.invalidateQueries({ queryKey: ['questions'] });
  }, [queryClient]);
  useRealtimeSubscription('rounds', realtimeCallback);

  const submitAnswer = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch('/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then((r) => {
        if (!r.ok) return r.json().then((d) => { throw new Error(d.error); });
        return r.json();
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      if (data.is_correct) toast.success('Correct answer!');
      else toast.info('Answer submitted');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (!answer.trim() || !currentQ || !activeRound || !team) return;
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    submitAnswer.mutate({
      question_id: currentQ.id,
      round_id: activeRound.id,
      answer: answer.trim(),
      time_taken: timeTaken,
    });
  };

  if (!activeRound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Swords className="h-16 w-16 text-zinc-600 mb-4" />
        <h2 className="text-xl font-bold text-zinc-300">No Active Round</h2>
        <p className="text-sm text-zinc-500">Wait for the admin to start a round.</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold text-zinc-300">No Questions Available</h2>
        <p className="text-sm text-zinc-500">Questions will appear when they are published.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">{activeRound.name}</h1>
          <p className="text-sm text-zinc-500">Question {currentQIndex + 1} of {questions.length}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-mono font-bold ${
            timeLeft <= 10 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-zinc-800 text-zinc-200'
          }`}>
            <Clock className="h-4 w-4" />
            {formatTimer(timeLeft)}
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {questions.map((q, i) => {
          const answered = submissions.some((s) => s.question_id === q.id);
          return (
            <button
              key={q.id}
              onClick={() => setCurrentQIndex(i)}
              className={`w-8 h-8 rounded-lg text-xs font-bold flex-shrink-0 transition-colors ${
                i === currentQIndex ? 'bg-red-500 text-white' :
                answered ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {currentQ && (
        <motion.div key={currentQ.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Card glow>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-100">{currentQ.title}</h2>
                <div className="flex items-center gap-2">
                  <Badge className={DIFFICULTY_COLORS[currentQ.difficulty]}>{DIFFICULTY_LABELS[currentQ.difficulty]}</Badge>
                  <Badge>{currentQ.marks} marks</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-zinc-300 whitespace-pre-wrap">{currentQ.question_text}</p>

              {currentQ.image_url && (
                <img src={currentQ.image_url} alt="Question" className="max-w-full rounded-lg border border-zinc-800" />
              )}

              {isAnswered ? (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <p className="text-sm text-green-400">Answer submitted</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentQ.question_type === 'mcq' && currentQ.mcq_options.length > 0 ? (
                    <div className="space-y-2">
                      {currentQ.mcq_options.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setAnswer(opt.id)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            answer === opt.id
                              ? 'border-red-500/50 bg-red-500/10 text-zinc-100'
                              : 'border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:border-zinc-600'
                          }`}
                        >
                          <span className="font-bold mr-2">{opt.id}.</span> {opt.text}
                        </button>
                      ))}
                    </div>
                  ) : currentQ.question_type === 'subjective' || currentQ.question_type === 'coding' ? (
                    <Textarea
                      placeholder="Enter your answer..."
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      rows={6}
                    />
                  ) : (
                    <Input
                      placeholder="Enter your answer..."
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                    />
                  )}

                  <Button
                    onClick={handleSubmit}
                    disabled={!answer.trim()}
                    loading={submitAnswer.isPending}
                    className="w-full"
                  >
                    <Send className="h-4 w-4" /> Submit Answer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))}
          disabled={currentQIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        <Button
          variant="secondary"
          onClick={() => setCurrentQIndex(Math.min(questions.length - 1, currentQIndex + 1))}
          disabled={currentQIndex === questions.length - 1}
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
