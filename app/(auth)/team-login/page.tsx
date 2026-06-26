'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Swords, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useTeamAuth } from '@/hooks/use-auth';

interface LoginForm {
  team_name: string;
  password: string;
}

export default function TeamLoginPage() {
  const router = useRouter();
  const { setTeam, setSessionId } = useTeamAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/team-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || 'Login failed');
        return;
      }
      setTeam(result.team);
      setSessionId(result.sessionId);
      toast.success(`Welcome, ${result.team.team_name}!`);
      router.push('/team/dashboard');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#09090B]">
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-zinc-950 to-zinc-950" />
      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 mb-8 transition-colors text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <Card glow>
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <Swords className="h-8 w-8 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-100">Team Login</h1>
              <p className="text-sm text-zinc-500 mt-1">Enter the arena</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Team Name"
                placeholder="Enter your team name"
                {...register('team_name', { required: 'Team name is required' })}
                error={errors.team_name?.message}
              />
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  {...register('password', { required: 'Password is required' })}
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button type="submit" loading={loading} className="w-full">
                Enter Competition
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-500">
              Don&apos;t have a team?{' '}
              <Link href="/register" className="text-red-400 hover:text-red-300 transition-colors">
                Register Now
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
