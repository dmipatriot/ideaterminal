'use client';

import { useState, useEffect } from 'react';

export default function BuildV1Modal({
  prompt,
}: {
  prompt: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  async function handleCopy() {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="h-16 flex-1 bg-primary text-black font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-primary-container transition-colors"
      >
        <span className="material-symbols-outlined text-base">bolt</span>
        [ RUN BUILD_V1 ]
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90" />

          {/* Panel */}
          <div
            className="relative z-10 w-full max-w-3xl max-h-[92vh] bg-[#0e0e0e] border border-[#00FF9C]/30 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#00FF9C]/15 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-[11px] font-bold text-primary tracking-widest uppercase">
                  CLAUDE_CODE_PROMPT // PLANNING_MODE
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[10px] text-on-surface-variant border border-on-surface-variant/30 px-3 py-1 hover:border-primary hover:text-primary transition-colors uppercase tracking-widest font-bold"
              >
                [ ABORT ]
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col p-6 gap-4 min-h-0">
              {prompt ? (
                <textarea
                  readOnly
                  value={prompt}
                  className="flex-1 min-h-[400px] w-full bg-black border border-[#00FF9C]/20 text-[#00FF9C] font-mono text-[11px] leading-relaxed p-4 resize-none terminal-scroll focus:outline-none focus:border-[#00FF9C]/50"
                />
              ) : (
                <div className="flex-1 flex items-center justify-center border border-[#ff716c]/20 bg-[#ff716c]/5">
                  <span className="text-[11px] text-[#ff716c] uppercase tracking-widest font-bold">
                    PROMPT_NOT_AVAILABLE // RE-RUN_ANALYSIS
                  </span>
                </div>
              )}

              {/* Footer actions */}
              <div className="flex gap-3 flex-shrink-0">
                {prompt && (
                  <button
                    onClick={handleCopy}
                    className="flex-1 h-10 border border-primary/40 text-primary font-bold uppercase tracking-widest text-[11px] hover:bg-primary/10 transition-colors"
                  >
                    <span className={copied ? '' : 'animate-pulse'}>
                      {copied ? '[ COPIED ]' : '[ COPY TO CLIPBOARD ]'}
                    </span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="h-10 px-6 border border-on-surface-variant/20 text-on-surface-variant font-bold uppercase tracking-widest text-[11px] hover:border-error/40 hover:text-error transition-colors"
                >
                  [ CLOSE ]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
