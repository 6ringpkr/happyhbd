"use client";
import { Card } from '../../../components/ui/card';

interface StatsProps {
  stats: {
    pending: number;
    confirmed: number;
    declined: number;
    godparents: number;
  };
  statsCard: string;
  textMuted: string;
  textStrong: string;
  skin?: 'classic' | 'metro';
}

export function Stats({ stats, statsCard, textMuted, textStrong, skin = 'classic' }: StatsProps) {
  if (skin === 'metro') {
    return (
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 h-24 bg-[#ffc40d] text-black rounded-none flex flex-col justify-between select-none">
          <div className="text-xs uppercase tracking-wider opacity-80">Pending</div>
          <div className="text-3xl font-extrabold leading-none">{stats.pending}</div>
        </div>
        <div className="p-4 h-24 bg-[#2d89ef] text-white rounded-none flex flex-col justify-between select-none">
          <div className="text-xs uppercase tracking-wider opacity-90">Confirmed</div>
          <div className="text-3xl font-extrabold leading-none">{stats.confirmed}</div>
        </div>
        <div className="p-4 h-24 bg-[#e51400] text-white rounded-none flex flex-col justify-between select-none">
          <div className="text-xs uppercase tracking-wider opacity-90">Declined</div>
          <div className="text-3xl font-extrabold leading-none">{stats.declined}</div>
        </div>
        <div className="p-4 h-24 bg-[#60a917] text-white rounded-none flex flex-col justify-between select-none">
          <div className="text-xs uppercase tracking-wider opacity-90">Godparents</div>
          <div className="text-3xl font-extrabold leading-none">{stats.godparents}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className={`p-3 ${statsCard}`}>
        <div className={`${textMuted} text-sm`}>Pending</div>
        <div className={`text-2xl font-bold ${textStrong}`}>{stats.pending}</div>
      </Card>
      <Card className={`p-3 ${statsCard}`}>
        <div className={`${textMuted} text-sm`}>Confirmed</div>
        <div className={`text-2xl font-bold ${textStrong}`}>{stats.confirmed}</div>
      </Card>
      <Card className={`p-3 ${statsCard}`}>
        <div className={`${textMuted} text-sm`}>Declined</div>
        <div className={`text-2xl font-bold ${textStrong}`}>{stats.declined}</div>
      </Card>
      <Card className={`p-3 ${statsCard}`}>
        <div className={`${textMuted} text-sm`}>Godparents</div>
        <div className={`text-2xl font-bold ${textStrong}`}>{stats.godparents}</div>
      </Card>
    </section>
  );
}

