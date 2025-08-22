"use client";
import { Button } from '../../../components/ui/button';
import { Fragment, useState } from 'react';

interface Guest {
  name: string;
  uniqueId: string;
  status: 'Pending' | 'Confirmed' | 'Declined';
  rsvpAt: string;
  isGodparent: boolean;
  godparentAcceptedAt: string;
  godparentFullName: string;
  godparentDeclinedAt: string;
}

interface GuestsTableProps {
  loading: boolean;
  ordered: Guest[];
  expanded: Record<string, boolean>;
  setExpanded: (value: Record<string, boolean>) => void;
  sortBy: 'name' | 'status' | 'rsvpAt';
  setSortBy: (value: 'name' | 'status' | 'rsvpAt') => void;
  sortDir: 'asc' | 'desc';
  setSortDir: (value: 'asc' | 'desc') => void;
  copiedId: string;
  setCopiedId: (value: string) => void;
  theme: 'dark' | 'light';
  borderCard: string;
  theadBg: string;
  zebra: string;
  roundedTable: string;
}

export function GuestsTable({
  loading,
  ordered,
  expanded,
  setExpanded,
  sortBy,
  setSortBy,
  sortDir,
  setSortDir,
  copiedId,
  setCopiedId,
  theme,
  borderCard,
  theadBg,
  zebra,
  roundedTable
}: GuestsTableProps) {
  const isDark = theme === 'dark';
  const [imgCopiedId, setImgCopiedId] = useState<string>('');
  const tooltipRound = roundedTable?.includes('rounded-none') ? 'rounded-none' : 'rounded-sm';
  const tooltipBg = isDark ? 'bg-white text-black' : 'bg-black text-white';
  const tooltipBgColor = isDark ? 'bg-white' : 'bg-black';

  const handleSort = (column: 'name' | 'status' | 'rsvpAt') => {
    setSortBy(column);
    const newDir = sortBy === column ? (sortDir === 'asc' ? 'desc' : 'asc') : 'asc';
    setSortDir(newDir);
  };

  const handleCopy = (uniqueId: string) => {
    navigator.clipboard.writeText(`${location.origin}/invites/${uniqueId}`);
    setCopiedId(uniqueId);
    setTimeout(() => setCopiedId(''), 1200);
  };

  const handleCopyImage = async (uniqueId: string) => {
    try {
      const url = `/api/qr?url=/invites/${uniqueId}&size=512`;
      const res = await fetch(url);
      const blob = await res.blob();
      // Prefer writing image to clipboard if supported
      // @ts-ignore ClipboardItem may not be in lib DOM typings
      const clipboardItem = new ClipboardItem({ [blob.type || 'image/png']: blob });
      // @ts-ignore write may not be on clipboard in older browsers
      await navigator.clipboard.write([clipboardItem]);
      setImgCopiedId(uniqueId);
    } catch {
      // Fallback to copying the QR link if image copy fails
      navigator.clipboard.writeText(`${location.origin}/api/qr?url=/invites/${uniqueId}&size=512`);
      setImgCopiedId(uniqueId);
    } finally {
      setTimeout(() => setImgCopiedId(''), 1200);
    }
  };

  const toggleExpanded = (uniqueId: string) => {
    const newExpanded = { ...expanded, [uniqueId]: !expanded[uniqueId] };
    setExpanded(newExpanded);
  };

  return (
    <section className="overflow-x-auto">
      <table className={`min-w-full text-sm border ${borderCard} ${roundedTable} overflow-hidden`}>
        <thead className={`${theadBg} sticky top-0 z-10`}>
          <tr>
            <th scope="col" className="p-2 text-left font-medium text-slate-600">
              <button 
                type="button" 
                className="inline-flex items-center gap-1" 
                onClick={() => handleSort('name')}
              >
                Name {sortBy === 'name' ? <span>{sortDir === 'asc' ? '▲' : '▼'}</span> : null}
              </button>
            </th>
            <th scope="col" className="p-2 text-left font-medium text-slate-600">Godparent</th>
            <th scope="col" className="p-2 text-left font-medium text-slate-600">
              <button 
                type="button" 
                className="inline-flex items-center gap-1" 
                onClick={() => handleSort('status')}
              >
                Status {sortBy === 'status' ? <span>{sortDir === 'asc' ? '▲' : '▼'}</span> : null}
              </button>
            </th>
            <th scope="col" className="p-2 text-left font-medium text-slate-600">
              <button 
                type="button" 
                className="inline-flex items-center gap-1" 
                onClick={() => handleSort('rsvpAt')}
              >
                RSVP {sortBy === 'rsvpAt' ? <span>{sortDir === 'asc' ? '▲' : '▼'}</span> : null}
              </button>
            </th>
            <th scope="col" className="p-2 text-left font-medium text-slate-600">Accepted</th>
            <th scope="col" className="p-2 text-left font-medium text-slate-600">Declined</th>
            <th scope="col" className="p-2 text-left font-medium text-slate-600">Invite</th>
            <th scope="col" className="p-2 text-left hidden md:table-cell">QR</th>
            <th scope="col" className="p-2 text-left hidden md:table-cell">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td className="p-3" colSpan={8}>Loading...</td></tr>
          ) : ordered.length ? ordered.map(g => (
            <Fragment key={g.uniqueId}>
              <tr className={`border-t ${isDark ? 'border-[#1a2147]' : 'border-[#e5e7ef]'} ${zebra}`}>
                <td className="p-2">
                  <div className="flex items-center justify-between md:block">
                    <span>{g.name}</span>
                    <button 
                      type="button" 
                      className="md:hidden underline text-xs" 
                      onClick={() => toggleExpanded(g.uniqueId)}
                    >
                      {expanded[g.uniqueId] ? 'Hide' : 'More'}
                    </button>
                  </div>
                </td>
                <td className="p-2">
                  {g.isGodparent ? (
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs border border-[#7a5cff] bg-[#1b1638] text-[#cfd6ff]">
                      VIP
                    </span>
                  ) : 'No'}
                </td>
                <td className="p-2">
                  <span className={
                    'inline-block px-2 py-0.5 rounded-full text-xs border ' +
                    (g.status === 'Pending' ? 'border-[#564a1a] bg-[#1e223f] text-[#ffd166]' : 
                     g.status === 'Confirmed' ? 'border-[#1f6b40] bg-[#122a24] text-[#3bd180]' : 
                     'border-[#6e2237] bg-[#2a161e] text-[#ff7a8a]')
                  }>
                    {g.status}
                  </span>
                </td>
                <td className="p-2">{g.rsvpAt}</td>
                <td className="p-2">{g.godparentAcceptedAt}</td>
                <td className="p-2">{g.godparentDeclinedAt}</td>
                <td className="p-2">
                  <a className="underline" href={`/invites/${g.uniqueId}`} target="_blank" rel="noreferrer">
                    /invites/{g.uniqueId}
                  </a>
                </td>
                <td className="p-2 hidden md:table-cell">
                  <button type="button" onClick={() => handleCopyImage(g.uniqueId)} aria-label="Copy QR image" className="group relative inline-block outline-none">
                    <img
                      alt={`QR for ${g.uniqueId}`}
                      src={`/api/qr?url=/invites/${g.uniqueId}&size=96`}
                      width={96}
                      height={96}
                      className={`rounded border ${borderCard} bg-white cursor-pointer`}
                    />
                    <div className={`pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 text-[10px] ${tooltipRound} ${tooltipBg} shadow-md transition-opacity opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100`}>
                      <div className={`absolute right-full top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 ${tooltipBgColor}`}/>
                      {imgCopiedId === g.uniqueId ? 'Copied!' : 'Click to copy image'}
                    </div>
                  </button>
                </td>
                <td className="p-2 hidden md:table-cell">
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="secondary"
                      className="focus-visible:ring-2 focus-visible:ring-[#4c6fff]"
                      onClick={() => handleCopy(g.uniqueId)}
                    >
                      {copiedId === g.uniqueId ? 'Copied!' : 'Copy'}
                    </Button>
                    <a
                      className="underline"
                      href={`/api/qr?url=/invites/${g.uniqueId}&size=512`}
                      download={`invite-${g.uniqueId}.png`}
                    >
                      Download
                    </a>
                  </div>
                </td>
              </tr>

              {/* Mobile expanded content */}
              {expanded[g.uniqueId] ? (
                <tr className="md:hidden">
              <td colSpan={9} className="p-2">
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => handleCopyImage(g.uniqueId)} aria-label="Copy QR image" className="group relative inline-block outline-none">
                        <img 
                          alt={`QR for ${g.uniqueId}`} 
                          src={`/api/qr?url=/invites/${g.uniqueId}&size=96`} 
                          width={96} 
                          height={96} 
                          className={`rounded border ${borderCard} bg-white cursor-pointer`} 
                        />
                        <div className={`pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 text-[10px] ${tooltipRound} ${tooltipBg} shadow-md transition-opacity opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100`}>
                          <div className={`absolute right-full top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 ${tooltipBgColor}`}/>
                          {imgCopiedId === g.uniqueId ? 'Copied!' : 'Click to copy image'}
                        </div>
                      </button>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          className="focus-visible:ring-2 focus-visible:ring-[#4c6fff]"
                          onClick={() => handleCopy(g.uniqueId)}
                        >
                          {copiedId === g.uniqueId ? 'Copied!' : 'Copy'}
                        </Button>
                        <a 
                          className="underline" 
                          href={`/api/qr?url=/invites/${g.uniqueId}&size=512`} 
                          download={`invite-${g.uniqueId}.png`}
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : null}
            </Fragment>
          )) : (
            <tr><td className="p-3" colSpan={8}>No guests</td></tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
