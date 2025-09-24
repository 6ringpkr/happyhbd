"use client";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Home() {
  const [error, setError] = useState<string>('');
  
  async function onSubmit(formData: FormData) {
    setError('');
    const res = await fetch('/api/admin-login', { 
      method: 'POST', 
      body: formData, 
      headers: { Accept: 'application/json' } 
    });
    const json = await res.json().catch(() => null);
    if (res.ok) {
      const next = new URLSearchParams(window.location.search).get('next') || '/admin';
      window.location.href = next;
    } else {
      setError(json?.error || 'Login failed');
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? <div className="text-sm text-red-600 mb-2">{error}</div> : null}
          <form action={onSubmit} className="grid gap-3">
            <Input type="password" name="password" placeholder="Enter password" required />
            <Button type="submit">Sign in</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}