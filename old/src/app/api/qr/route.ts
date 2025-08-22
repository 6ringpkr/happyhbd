import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(request: NextRequest) {
  const u = new URL(request.url);
  const data = u.searchParams.get('url');
  const size = Math.max(128, Math.min(1024, Number(u.searchParams.get('size') || '256')));
  if (!data) return new NextResponse('Missing url', { status: 400 });
  const abs = data.startsWith('http') ? data : `${u.origin}${data}`;
  const png = await QRCode.toBuffer(abs, {
    type: 'png',
    errorCorrectionLevel: 'M',
    width: size,
    margin: 1,
    color: { dark: '#1a1a1a', light: '#ffffff' },
  } as any);
  return new NextResponse(png, { status: 200, headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=31536000, immutable' } });
}


