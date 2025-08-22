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
}

export function Stats({ stats, statsCard, textMuted, textStrong }: StatsProps) {
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

