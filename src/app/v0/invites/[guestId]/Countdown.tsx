"use client";
import { useEffect, useState } from 'react';

function part(ms: number) {
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

export function Countdown({ iso }: { iso: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const target = new Date(iso).getTime();
  const diff = Math.max(0, target - now);
  const { days, hours, minutes, seconds } = part(diff);
  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      {[
        ['Days', days],
        ['Hours', hours],
        ['Minutes', minutes],
        ['Seconds', seconds],
      ].map(([label, value]) => (
        <div key={label as string} className="rounded-md border p-3">
          <div className="text-2xl font-semibold" aria-live="polite">{value as number}</div>
          <div className="text-muted-foreground text-xs">{label as string}</div>
        </div>
      ))}
    </div>
  );
}
