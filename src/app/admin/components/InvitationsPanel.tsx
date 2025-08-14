"use client";
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
  tabTriggerClass
}: InvitationsPanelProps) {
  const isDark = theme === 'dark';

  return (
    <section className={`${sectionCard} border rounded-xl p-4 space-y-4`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Invitations</h2>
        <Tabs defaultValue="single">
          <TabsList className={tabListClass}>
            <TabsTrigger className={tabTriggerClass} value="single">Single</TabsTrigger>
            <TabsTrigger className={tabTriggerClass} value="bulk">Bulk</TabsTrigger>
          </TabsList>
          <TabsContent value="single">
            <div className="grid md:grid-cols-2 gap-4 pt-3">
              <form onSubmit={onGenerate} className="grid grid-cols-1 gap-3 content-start">
                <div>
                  <label className={`block text-xs mb-1 ${textMuted}`}>Guest full name</label>
                  <Input 
                    value={name} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} 
                    placeholder="Enter Guest's Full Name" 
                    required 
                    className={`${inputClass} focus-visible:ring-2 focus-visible:ring-[#4c6fff]`} 
                  />
                </div>
                <label className={`text-sm flex items-center gap-2 ${textSecondary}`}>
                  <input 
                    type="checkbox" 
                    checked={isGodparent} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsGodparent(e.target.checked)} 
                  /> Godparent / VIP
                </label>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={isGenerating} 
                    className={`${btnPrimary} focus-visible:ring-2 focus-visible:ring-[#4c6fff]`}
                  >
                    {isGenerating ? 'Generating…' : 'Generate'}
                  </Button>
                  {result ? <span className={`${textMuted} text-sm self-center`}>{result}</span> : null}
                </div>
                <p className={`${textMuted} text-xs`}>Tip: VIP marks the guest as godparent and applies special styling in the dashboard.</p>
              </form>
              <div className={`rounded-lg border p-3 ${isDark ? 'border-[#293057] bg-gradient-to-b from-[#0f1530] to-[#0a0f20]' : 'border-[#e5e7ef] bg-[#ffffff]'} md:sticky md:top-4 h-fit`}>
                <h3 className="text-sm font-medium text-[#7aa2ff] mb-2">Generated Invitation</h3>
                {!genInviteUrl ? (
                  <div className={`${textMuted} text-sm`}>Generate an invitation to see the link and QR preview here.</div>
                ) : (
                  <>
                    <div className="text-sm break-all">
                      <a className="text-[#7aa2ff] underline" href={genInviteUrl} target="_blank" rel="noreferrer">{genInviteUrl}</a>
                    </div>
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <img alt="QR" src={genQrUrl} width={144} height={144} className={`rounded border ${borderCard} bg-white`} />
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          onClick={() => navigator.clipboard.writeText(genInviteUrl)} 
                          className={btnNeutral}
                        >
                          Copy Link
                        </Button>
                        <a 
                          className={`px-3 py-2 rounded-lg border ${borderCard}`} 
                          href={genQrUrl.replace('&size=200', '&size=512')} 
                          download={`invite-${Date.now()}.png`}
                        >
                          Download QR
                        </a>
                        <Button 
                          type="button" 
                          variant="secondary" 
                          onClick={() => { 
                            // Reset form state
                            setName('');
                            setIsGodparent(false);
                          }} 
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
            <div className="pt-3 space-y-3">
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
                className={`flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed ${
                  bulkDragOver 
                    ? (isDark ? 'border-[#4c6fff] text-[#cdd5ff]' : 'border-[#4c6fff] text-[#334155]') 
                    : (isDark ? 'border-[#2a356d] text-gray-400' : 'border-[#d0d5e2] text-[#475569]')
                } ${isDark ? 'bg-gradient-to-b from-[#11183a] to-[#0c1330]' : 'bg-white'}`}
              >
                Drop CSV here or
                <label className="cursor-pointer underline">
                  <input 
                    type="file" 
                    accept=".csv,text/csv" 
                    className="hidden" 
                    onChange={(e) => setBulkFile(e.target.files?.[0] || null)} 
                  /> Choose file
                </label>
                {bulkFile ? <span className={`${textSecondary}`}>({bulkFile.name})</span> : null}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button 
                  disabled={bulkBusy} 
                  onClick={onBulkProcess} 
                  className={`${btnPrimary} focus-visible:ring-2 focus-visible:ring-[#4c6fff]`}
                >
                  {bulkBusy ? 'Processing…' : 'Process'}
                </Button>
                <a 
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'border-[#293057]' : 'border-[#e5e7ef]'}`} 
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
      </div>
    </section>
  );
}
