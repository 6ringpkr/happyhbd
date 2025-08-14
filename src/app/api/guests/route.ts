import { NextRequest, NextResponse } from 'next/server';
import { listGuests, findGuestByUniqueId } from '@/lib/google-sheets';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id') || url.searchParams.get('uniqueId') || '';
  if (id) {
    const guest = await findGuestByUniqueId(id);
    if (!guest) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    // hide internal row index
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { row, ...rest } = guest;
    return NextResponse.json({ guest: rest });
  }
  const guests = await listGuests();
  return NextResponse.json({ guests });
}


