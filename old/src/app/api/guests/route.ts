import { NextResponse } from 'next/server';
import { listGuests } from '@/lib/google-sheets';

export async function GET() {
  const guests = await listGuests();
  return NextResponse.json({ guests });
}


