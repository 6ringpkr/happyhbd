"use client";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Home() {
  const [error, setError] = useState<string>('');
  async function onSubmit(formData: FormData) {
    setError('');
    const res = await fetch('/api/admin-login', { method: 'POST', body: formData, headers: { Accept: 'application/json' } });
    const json = await res.json().catch(() => null);
    if (res.ok) {
      const next = new URLSearchParams(window.location.search).get('next') || '/admin';
      window.location.href = next;
    } else {
      setError(json?.error || 'Login failed');
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-4 text-center">
          <div className="text-sm text-slate-500">Welcome back</div>
          <h1 className="text-xl font-semibold">Admin access</h1>
        </div>
        <Card className="w-full shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Sign in</CardTitle>
          </CardHeader>
          <CardContent>
            {error ? <div className="text-sm text-red-600 mb-3" role="alert">{error}</div> : null}
            <form action={onSubmit} className="grid gap-3">
              <label className="text-sm text-slate-600" htmlFor="password">Password</label>
              <Input id="password" type="password" name="password" placeholder="Enter password" required className="h-10" />
              <Button type="submit" className="h-10">Sign in</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
