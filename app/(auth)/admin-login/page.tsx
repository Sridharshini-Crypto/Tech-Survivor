'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ShieldCheck, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useAdminAuth } from '@/hooks/use-auth';

interface LoginForm {
  username: string;
  password: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAdmin } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || 'Login failed');
        return;
      }
      setAdmin(result.admin);
      toast.success('Welcome back, Admin!');
      router.push('/admin/dashboard');
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
                <ShieldCheck className="h-8 w-8 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-100">Admin Login</h1>
              <p className="text-sm text-zinc-500 mt-1">Access the control panel</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Username"
                placeholder="Enter admin username"
                {...register('username', { required: 'Username is required' })}
                error={errors.username?.message}
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
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
