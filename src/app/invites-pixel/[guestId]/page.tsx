import Link from 'next/link';

export default function InvitePixelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-10">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-semibold">This page has been retired</h1>
        <p className="text-slate-500">Please use the classic invitation at /invites/[guestId].</p>
        <Link className="underline" href="/">Go back</Link>
      </div>
    </div>
  );
}
