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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#09090B]">
        <Card glow className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 mb-2">Registration Submitted!</h1>
            <p className="text-sm text-zinc-400">
              Your registration request has been submitted successfully. Please wait for admin approval.
            </p>
            <Link href="/team-login" className="mt-6 inline-block">
              <Button variant="outline">Go to Team Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#09090B]">
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-zinc-950 to-zinc-950" />
      <div className="relative z-10 w-full max-w-lg">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 mb-8 transition-colors text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <Card glow>
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <UserPlus className="h-8 w-8 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-100">Register Your Team</h1>
              <p className="text-sm text-zinc-500 mt-1">Join the competition</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Team Name"
                placeholder="Choose a unique team name"
                {...register('team_name', { required: 'Team name is required', minLength: { value: 3, message: 'Min 3 characters' }, pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Only letters, numbers, and underscores allowed' }
                })}
                error={errors.team_name?.message}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  placeholder="Create password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Min 6 characters' },
                  })}
                  error={errors.password?.message}
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter password"
                  {...register('confirm_password', {
                    required: 'Please confirm',
                    validate: (v) => v === password || 'Passwords do not match',
                  })}
                  error={errors.confirm_password?.message}
                />
              </div>

              <Input
                label="Team Leader Name"
                placeholder="Full name of team leader"
                {...register('team_leader', { required: 'Team leader name is required', minLength: { value: 3, message: 'Min 3 characters' }, pattern: { value: /^[a-zA-Z\s]+$/, message: 'Only letters and spaces allowed' } })}
                error={errors.team_leader?.message}
              />

              <Input
                label="College Name"
                placeholder="Your institution name"
                {...register('college_name', { required: 'College name is required', minLength: { value: 3, message: 'Min 3 characters' } })}
                error={errors.college_name?.message}
              />

              <Input
                label="Contact Number"
                placeholder="+91 XXXXX XXXXX"
                {...register('contact_number', { required: 'Contact number is required', pattern: { value: /^\+91\s\d{5}\s\d{5}$/, message: 'Format: +91 XXXXX XXXXX' } })}
                error={errors.contact_number?.message}
              />

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Team Members</label>
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <Input
                        placeholder={`Member ${index + 1} name`}
                        {...register(`team_members.${index}.name` as const, { validate: (value) => !value || (value.trim().length >= 3 && /^[a-zA-Z\s]+$/.test(value)) || 'Min 3 letters, only letters and spaces allowed' })}
                      />
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-zinc-500 hover:text-red-400 transition-colors p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {fields.length < 5 && (
                  <button
                    type="button"
                    onClick={() => append({ name: '' })}
                    className="mt-2 flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    Add Member
                  </button>
                )}
              </div>

              <Button type="submit" loading={loading} className="w-full">
                Submit Registration
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-500">
              Already registered?{' '}
              <Link href="/team-login" className="text-red-400 hover:text-red-300 transition-colors">
                Team Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
