'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { HelpCircle, Plus, Edit3, Trash2, Copy, Eye, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { TableSkeleton } from '@/components/ui/skeleton';
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/constants';
import { downloadCSV } from '@/lib/utils';
import type { Question, Round } from '@/types';

interface QuestionForm {
  title: string; question_text: string; question_type: string; difficulty: string;
  marks: number; negative_marks: number; timer: number; correct_answer: string; accepted_answers: string;
  mcq_options: string; round_id: string; requires_manual_review: boolean; is_bonus: boolean; bonus_points: number;
  order_index: number; image_url: string;
}

const emptyQuestion: QuestionForm = {
  title: '', question_text: '', question_type: 'text', difficulty: 'medium',
  marks: 10, negative_marks: 0, timer: 60, correct_answer: '', accepted_answers: '[]',
  mcq_options: '[]', round_id: '', requires_manual_review: false, is_bonus: false, bonus_points: 0,
  order_index: 0, image_url: '',
};

export default function AdminQuestionsPage() {
  const queryClient = useQueryClient();
  const [selectedRound, setSelectedRound] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [preview, setPreview] = useState<Question | null>(null);
  const [form, setForm] = useState(emptyQuestion);

  const { data: rounds = [] } = useQuery<Round[]>({
    queryKey: ['rounds'],
    queryFn: () => fetch('/api/rounds').then((r) => r.json()),
  });

  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ['questions', selectedRound],
    queryFn: () => fetch(`/api/questions${selectedRound ? `?round_id=${selectedRound}` : ''}`).then((r) => r.json()),
  });

  const createQ = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch('/api/questions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['questions'] }); setShowForm(false); toast.success('Question created'); },
  });

  const updateQ = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch('/api/questions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['questions'] }); setShowForm(false); setEditId(null); toast.success('Question updated'); },
  });

  const deleteQ = useMutation({
    mutationFn: (id: string) =>
      fetch('/api/questions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['questions'] }); toast.success('Question deleted'); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let acceptedArr: string[] = [];
    let mcqArr: { id: string; text: string; is_correct: boolean }[] = [];
    try { acceptedArr = JSON.parse(form.accepted_answers); } catch { acceptedArr = []; }
    try { mcqArr = JSON.parse(form.mcq_options); } catch { mcqArr = []; }

    const payload = {
      ...form,
      accepted_answers: acceptedArr,
      mcq_options: mcqArr,
      marks: Number(form.marks),
      negative_marks: Number(form.negative_marks),
      timer: Number(form.timer),
      bonus_points: Number(form.bonus_points),
      order_index: Number(form.order_index),
    };

    if (editId) {
      updateQ.mutate({ id: editId, ...payload });
    } else {
      createQ.mutate(payload);
    }
  };

  const openEdit = (q: Question) => {
    setEditId(q.id);
    setForm({
      title: q.title,
      question_text: q.question_text,
      question_type: q.question_type,
      difficulty: q.difficulty,
      marks: q.marks,
      negative_marks: q.negative_marks,
      timer: q.timer,
      correct_answer: q.correct_answer || '',
      accepted_answers: JSON.stringify(q.accepted_answers || []),
      mcq_options: JSON.stringify(q.mcq_options || []),
      round_id: q.round_id,
      requires_manual_review: q.requires_manual_review,
      is_bonus: q.is_bonus,
      bonus_points: q.bonus_points,
      order_index: q.order_index,
      image_url: q.image_url || '',
    });
    setShowForm(true);
  };

  const exportCSV = () => {
    downloadCSV(
      questions.map((q) => ({
        title: q.title,
        question_text: q.question_text,
        type: q.question_type,
        difficulty: q.difficulty,
        marks: q.marks,
        correct_answer: q.correct_answer || '',
      })),
      'questions-export'
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Question Management</h1>
          <p className="text-sm text-zinc-500">{questions.length} questions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={exportCSV}><Download className="h-4 w-4" /> Export CSV</Button>
          <Button onClick={() => { setEditId(null); setForm({ ...emptyQuestion, round_id: selectedRound }); setShowForm(true); }}>
            <Plus className="h-4 w-4" /> Add Question
          </Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setSelectedRound('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${!selectedRound ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-zinc-400'}`}>
          All Rounds
        </button>
        {rounds.map((r) => (
          <button key={r.id} onClick={() => setSelectedRound(r.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${selectedRound === r.id ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-zinc-400'}`}>
            R{r.round_number}: {r.name}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><HelpCircle className="h-5 w-5 text-red-400" /><h2 className="text-lg font-semibold text-zinc-100">Questions</h2></div>
        </CardHeader>
        <CardContent>
          {isLoading ? <TableSkeleton /> : questions.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">No questions found</p>
          ) : (
            <div className="space-y-2">
              {questions.map((q, i) => (
                <div key={q.id} className="flex items-center gap-4 p-3 rounded-lg bg-zinc-900/30">
                  <span className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{q.title}</p>
                    <p className="text-xs text-zinc-500">{q.question_type.toUpperCase()} &middot; {q.marks} marks &middot; {q.timer}s</p>
                  </div>
                  <Badge className={DIFFICULTY_COLORS[q.difficulty]}>{DIFFICULTY_LABELS[q.difficulty]}</Badge>
                  <div className="flex gap-1">
                    <button onClick={() => setPreview(q)} className="p-1.5 rounded hover:bg-zinc-700 text-zinc-500"><Eye className="h-4 w-4" /></button>
                    <button onClick={() => openEdit(q)} className="p-1.5 rounded hover:bg-zinc-700 text-zinc-500"><Edit3 className="h-4 w-4" /></button>
                    <button onClick={() => { createQ.mutate({ ...q, id: undefined, title: `${q.title} (Copy)`, order_index: questions.length }); }} className="p-1.5 rounded hover:bg-zinc-700 text-zinc-500"><Copy className="h-4 w-4" /></button>
                    <button onClick={() => { if (confirm('Delete?')) deleteQ.mutate(q.id); }} className="p-1.5 rounded hover:bg-red-500/10 text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditId(null); }} title={editId ? 'Edit Question' : 'Add Question'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Question Text" value={form.question_text} onChange={(e) => setForm({ ...form, question_text: e.target.value })} rows={4} required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" value={form.question_type} onChange={(e) => setForm({ ...form, question_type: e.target.value as Question['question_type'] })}
              options={[{ value: 'text', label: 'Text' }, { value: 'mcq', label: 'MCQ' }, { value: 'image', label: 'Image' }, { value: 'subjective', label: 'Subjective' }, { value: 'coding', label: 'Coding' }]} />
            <Select label="Difficulty" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as Question['difficulty'] })}
              options={[{ value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Hard' }, { value: 'extreme', label: 'Extreme' }]} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Marks" type="number" value={form.marks} onChange={(e) => setForm({ ...form, marks: Number(e.target.value) })} />
            <Input label="Negative Marks" type="number" value={form.negative_marks} onChange={(e) => setForm({ ...form, negative_marks: Number(e.target.value) })} />
            <Input label="Timer (sec)" type="number" value={form.timer} onChange={(e) => setForm({ ...form, timer: Number(e.target.value) })} />
          </div>
          <Select label="Round" value={form.round_id} onChange={(e) => setForm({ ...form, round_id: e.target.value })}
            options={[{ value: '', label: 'Select Round' }, ...rounds.map((r) => ({ value: r.id, label: `R${r.round_number}: ${r.name}` }))]} />
          <Input label="Correct Answer" value={form.correct_answer} onChange={(e) => setForm({ ...form, correct_answer: e.target.value })} />
          <Input label="Accepted Answers (JSON array)" value={form.accepted_answers} onChange={(e) => setForm({ ...form, accepted_answers: e.target.value })} placeholder='["answer1", "answer2"]' />
          {form.question_type === 'mcq' && (
            <Textarea label="MCQ Options (JSON array)" value={form.mcq_options} onChange={(e) => setForm({ ...form, mcq_options: e.target.value })} rows={4} placeholder='[{"id":"a","text":"Option A","is_correct":true}]' />
          )}
          {form.question_type === 'image' && (
            <Input label="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</Button>
            <Button type="submit" loading={createQ.isPending || updateQ.isPending}>{editId ? 'Save' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!preview} onClose={() => setPreview(null)} title="Question Preview" size="lg">
        {preview && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-zinc-100">{preview.title}</h3>
            <p className="text-sm text-zinc-300 whitespace-pre-wrap">{preview.question_text}</p>
            {preview.image_url && <img src={preview.image_url} alt="Question" className="max-w-full rounded-lg" />}
            {preview.question_type === 'mcq' && preview.mcq_options.length > 0 && (
              <div className="space-y-2">
                {preview.mcq_options.map((opt) => (
                  <div key={opt.id} className={`p-3 rounded-lg border ${opt.is_correct ? 'border-green-500/50 bg-green-500/10' : 'border-zinc-700 bg-zinc-900/50'}`}>
                    <span className="text-sm text-zinc-200">{opt.id}. {opt.text}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-4 text-xs text-zinc-500">
              <span>Type: {preview.question_type}</span>
              <span>Marks: {preview.marks}</span>
              <span>Timer: {preview.timer}s</span>
              <span>Difficulty: {DIFFICULTY_LABELS[preview.difficulty]}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
