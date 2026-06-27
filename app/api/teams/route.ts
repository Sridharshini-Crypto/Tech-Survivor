'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { UserPlus, ArrowLeft, Plus, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface RegisterForm {
  team_name: string;
  password: string;
  confirm_password: string;
  team_leader: string;
  college_name: string;
  contact_number: string;
  team_members: { name: string }[];
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<RegisterForm>({
    defaultValues: {
      team_members: [{ name: '' }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'team_members' });
  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    const textRegex = /^[a-zA-Z0-9_]+$/;
    const nameRegex = /^[a-zA-Z\s]+$/;
    const phoneRegex = /^\+91\s\d{5}\s\d{5}$/;
    if (data.team_name.trim().length < 3 || !textRegex.test(data.team_name)) {
      toast.error('Team name must be at least 3 characters and can only contain letters, numbers, and underscores.');
      return;
    }
    if (data.team_leader.trim().length < 3 || !nameRegex.test(data.team_leader)) {
      toast.error('Team leader name must be at least 3 characters and can only contain letters and spaces.');
      return;
    }
    if (data.college_name.trim().length < 3) {
      toast.error('College name must be at least 3 characters.');
      return;
    }
    if (!phoneRegex.test(data.contact_number)) {
      toast.error('Contact number must be in the format: +91 XXXXX XXXXX');
      return;
    }
    for (const member of data.team_members) {
      if (member.name.trim() && (member.name.trim().length < 3 || !nameRegex.test(member.name))) {
        toast.error('Each team member name must be at least 3 characters and can only contain letters and spaces.');
        return;
      }
    }
    if (data.password !== data.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/team-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_name: data.team_name,
          password: data.password,
          team_leader: data.team_leader,
          college_name: data.college_name,
          contact_number: data.contact_number,
          team_members: data.team_members.filter((m) => m.name.trim()),
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || 'Registration failed');
        return;
      }
      setSuccess(true);
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
}; 
