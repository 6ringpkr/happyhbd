"use client";
import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';

interface InvitationsPanelProps {
  name: string;
  setName: (name: string) => void;
  isGodparent: boolean;
  setIsGodparent: (value: boolean) => void;
  isGenerating: boolean;
  onGenerate: (e: React.FormEvent<HTMLFormElement>) => void;
  result: string;
  genInviteUrl: string;
  genQrUrl: string;
  bulkFile: File | null;
  setBulkFile: (file: File | null) => void;
  bulkBusy: boolean;
  bulkDragOver: boolean;
  setBulkDragOver: (value: boolean) => void;
  onBulkProcess: () => void;
  bulkHint: string;
  theme: 'dark' | 'light';
  inputClass: string;
  textMuted: string;
  textSecondary: string;
  btnPrimary: string;
  btnNeutral: string;
  borderCard: string;
  sectionCard: string;
  tabListClass: string;
  tabTriggerClass: string;
  roundedSection: string;
}

export function InvitationsPanel({
  name,
  setName,
  isGodparent,
  setIsGodparent,
  isGenerating,
  onGenerate,
  result,
  genInviteUrl,
  genQrUrl,
  bulkFile,
  setBulkFile,
  bulkBusy,
  bulkDragOver,
  setBulkDragOver,
  onBulkProcess,
  bulkHint,
  theme,
  inputClass,
  textMuted,
  textSecondary,
  btnPrimary,
  btnNeutral,
  borderCard,
  sectionCard,
  tabListClass,
  tabTriggerClass,
  roundedSection
}: InvitationsPanelProps) {
  const isDark = theme === 'dark';

  return (
    <section className={`${sectionCard} border ${roundedSection} p-4 space-y-4`}>
      <h2 className="text-lg font-medium">Invitations</h2>
      <Tabs defaultValue="single">
        <div className="flex items-center justify-between gap-3">
          <div />
          <TabsList className={`${tabListClass} shrink-0 min-w-[200px]`}>
            <TabsTrigger className={`${tabTriggerClass} w-1/2 justify-center`} value="single">Single</TabsTrigger>
            <TabsTrigger className={`${tabTriggerClass} w-1/2 justify-center`} value="bulk">Bulk</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="single">
            <div className="grid md:grid-cols-2 gap-6 pt-3">
              <form onSubmit={onGenerate} className="space-y-4">
                <div>
                  <label className={`block text-xs mb-1 ${textMuted}`}>Guest full name</label>
                  <Input
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    placeholder="e.g. Juan Dela Cruz"
                    required
                    className={`${inputClass} focus-visible:ring-2 focus-visible:ring-[#4c6fff]`}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className={`text-sm flex items-center gap-2 ${textSecondary}`}>
                    <input
                      type="checkbox"
                      checked={isGodparent}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsGodparent(e.target.checked)}
                    />
                    Godparent / VIP
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="submit"
                    disabled={isGenerating}
                    className={`${btnPrimary} focus-visible:ring-2 focus-visible:ring-[#4c6fff]`}
                  >
                    {isGenerating ? 'Generating…' : 'Generate'}
                  </Button>
                  {result ? <span className={`${textMuted} text-sm`}>{result}</span> : null}
                </div>
                <p className={`${textMuted} text-xs`}>VIP marks the guest as godparent and applies special styling in the dashboard.</p>
              </form>

              <div className={`p-4 ${isDark ? 'border-[#293057] bg-gradient-to-b from-[#0f1530] to-[#0a0f20]' : 'border-[#e5e7ef] bg-white'} border ${roundedSection} md:sticky md:top-4 h-fit`}>
                <h3 className="text-sm font-medium mb-2">Preview</h3>
                {!genInviteUrl ? (
                  <div className={`${textMuted} text-sm`}>Generate an invitation to see the link and QR preview here.</div>
                ) : (
                  <>
                    <div className="text-sm break-all mb-3">
                      <a className="underline" href={genInviteUrl} target="_blank" rel="noreferrer">{genInviteUrl}</a>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <PreviewQr
                        genQrUrl={genQrUrl}
                        borderCard={borderCard}
                        roundedSection={roundedSection}
                        textMuted={textMuted}
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(genInviteUrl)}
                          className={btnNeutral}
                        >
                          Copy Link
                        </Button>
                        <a
                          className={`px-3 py-2 border ${borderCard} ${roundedSection}`}
                          href={genQrUrl.replace('&size=200', '&size=512')}
                          download={`invite-${Date.now()}.png`}
                        >
                          Download QR
                        </a>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => { setName(''); setIsGodparent(false); }}
                          className={btnNeutral}
                        >
                          New Invite
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
        </TabsContent>
        <TabsContent value="bulk">
            <div className="pt-3 space-y-4">
              <div
                onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setBulkDragOver(true); }}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setBulkDragOver(true); }}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setBulkDragOver(false); }}
                onDrop={(e) => {
                  e.preventDefault();
                  setBulkDragOver(false);
                  const f = e.dataTransfer?.files?.[0] || null;
                  if (f) setBulkFile(f);
                }}
                className={`p-6 text-center ${roundedSection} border border-dashed ${
                  bulkDragOver
                    ? (isDark ? 'border-[#4c6fff] text-[#cdd5ff]' : 'border-[#4c6fff] text-[#334155]')
                    : (isDark ? 'border-[#2a356d] text-gray-400' : 'border-[#d0d5e2] text-[#475569]')
                } ${isDark ? 'bg-transparent' : 'bg-white'}`}
              >
                <div className="space-y-1">
                  <div>Drop CSV here or <label className="cursor-pointer underline"><input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => setBulkFile(e.target.files?.[0] || null)} />Choose file</label></div>
                  {bulkFile ? <div className={`inline-flex items-center gap-2 text-xs px-2 py-1 border ${borderCard} ${roundedSection}`}>{bulkFile.name}<button type="button" className="underline" onClick={() => setBulkFile(null)}>Clear</button></div> : null}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  disabled={bulkBusy}
                  onClick={onBulkProcess}
                  className={`${btnPrimary} focus-visible:ring-2 focus-visible:ring-[#4c6fff]`}
                >
                  {bulkBusy ? 'Processing…' : 'Process'}
                </Button>
                <a
                  className={`px-3 py-2 border ${isDark ? 'border-[#293057]' : 'border-[#e5e7ef]'} ${roundedSection}`}
                  href={'data:text/csv;charset=utf-8,' + encodeURIComponent('name,isGodparent\n')}
                  download="guests-template.csv"
                >
                  Template
                </a>
                <span className={`${textMuted} text-sm`}>CSV headers: <code>name,isGodparent</code></span>
              </div>
              {bulkHint ? <div className={`${textSecondary} text-sm`} aria-live="polite">{bulkHint}</div> : null}
            </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

function PreviewQr({ genQrUrl, borderCard, roundedSection, textMuted }: { genQrUrl: string; borderCard: string; roundedSection: string; textMuted: string; }) {
  const [copied, setCopied] = useState<boolean>(false);

  async function onCopyImage() {
    try {
      const url = genQrUrl.includes('&size=200') ? genQrUrl.replace('&size=200', '&size=512') : genQrUrl;
      const res = await fetch(url);
      const blob = await res.blob();
      // @ts-ignore ClipboardItem may not exist in lib DOM for TS
      const item = new ClipboardItem({ [blob.type || 'image/png']: blob });
      // @ts-ignore write may not exist on older browsers
      await navigator.clipboard.write([item]);
    } catch {
      navigator.clipboard.writeText(genQrUrl);
    } finally {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  }

  return (
    <button type="button" onClick={onCopyImage} aria-label="Copy QR image" className="group relative inline-flex outline-none">
      <img
        alt="QR"
        src={genQrUrl}
        width={160}
        height={160}
        className={`border ${borderCard} bg-white ${roundedSection} cursor-pointer`}
      />
      <div className={`pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 text-[11px] ${roundedSection.includes('none') ? 'rounded-none' : 'rounded-sm'} bg-black text-white dark:bg-white dark:text-black shadow-md transition-opacity opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100`}>
        <div className={`absolute right-full top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-black dark:bg-white`}/>
        {copied ? 'Copied!' : 'Click to copy image'}
      </div>
    </button>
  );
}
