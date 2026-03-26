'use client';

import { useState, useEffect } from 'react';

export default function ScoringInfoModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-base text-primary/50 hover:text-primary cursor-pointer transition-colors font-mono leading-none"
        title="HOW IDEAS ARE EVALUATED"
        aria-label="Open scoring system info"
      >
        ⓘ
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/85" />

          {/* Panel */}
          <div
            className="relative z-10 w-full max-w-2xl max-h-[80vh] bg-[#0e0e0e] border border-[#00FF9C]/30 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#00FF9C]/15">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-[11px] font-bold text-primary tracking-widest uppercase">
                  SCORING_SYSTEM // HOW_IDEAS_ARE_EVALUATED
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[10px] text-on-surface-variant border border-on-surface-variant/30 px-3 py-1 hover:border-primary hover:text-primary transition-colors uppercase tracking-widest font-bold"
              >
                [ CLOSE ]
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto terminal-scroll flex-1 px-6 py-5 space-y-6 text-[11px] leading-relaxed">

              {/* Composite score */}
              <div>
                <div className="text-primary font-bold uppercase tracking-widest mb-2">
                  COMPOSITE_SCORE
                </div>
                <p className="text-on-surface-variant">
                  A 0–100 score weighted across three categories.
                  Signal and Execution each count 40%. Risk counts 20%.
                </p>
              </div>

              <div className="border-t border-white/5" />

              {/* Signal */}
              <div>
                <div className="text-[#00FF9C] font-bold uppercase tracking-widest mb-2">
                  SIGNAL (40%) — How strong is the opportunity?
                </div>
                <div className="space-y-2 pl-3 border-l border-[#00FF9C]/20">
                  <div>
                    <span className="text-on-surface font-bold">MARKET_PULL</span>
                    <span className="text-on-surface-variant"> — Is there real existing demand, or does demand need to be created?</span>
                  </div>
                  <div>
                    <span className="text-on-surface font-bold">TIMING</span>
                    <span className="text-on-surface-variant"> — Is the market window open right now? Too early means educating the market. Too late means it's crowded.</span>
                  </div>
                  <div>
                    <span className="text-on-surface font-bold">DIFFERENTIATION</span>
                    <span className="text-on-surface-variant"> — Does this have a genuine angle that separates it from what already exists, or is it a commodity play?</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5" />

              {/* Execution */}
              <div>
                <div className="text-[#60a5fa] font-bold uppercase tracking-widest mb-2">
                  EXECUTION (40%) — Can it actually get built and sold?
                </div>
                <div className="space-y-2 pl-3 border-l border-[#60a5fa]/20">
                  <div>
                    <span className="text-on-surface font-bold">FEASIBILITY</span>
                    <span className="text-on-surface-variant"> — Can one person build and operate this without a team or funding?</span>
                  </div>
                  <div>
                    <span className="text-on-surface font-bold">MONETIZATION</span>
                    <span className="text-on-surface-variant"> — Is there a direct near-term path to revenue? Does someone pay, and is it obvious who and why?</span>
                  </div>
                  <div>
                    <span className="text-on-surface font-bold">DISTRIBUTION</span>
                    <span className="text-on-surface-variant"> — Does the builder already have access to the target audience, or does this require building from zero?</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5" />

              {/* Risk */}
              <div>
                <div className="text-[#ff716c] font-bold uppercase tracking-widest mb-2">
                  RISK (20%) — What can kill it?
                </div>
                <div className="space-y-2 pl-3 border-l border-[#ff716c]/20">
                  <div>
                    <span className="text-on-surface font-bold">FOUNDER_FIT</span>
                    <span className="text-on-surface-variant"> — Does this person have the specific skills and context to execute this better than someone random?</span>
                  </div>
                  <div>
                    <span className="text-on-surface font-bold">DEFENSIBILITY</span>
                    <span className="text-on-surface-variant"> — How hard is this to copy once it gains traction?</span>
                  </div>
                  <div>
                    <span className="text-on-surface font-bold">ASSUMPTION_DENSITY</span>
                    <span className="text-on-surface-variant"> — How many unvalidated assumptions is this built on? High score = few assumptions. Low score = built on sand.</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5" />

              {/* Verdicts */}
              <div>
                <div className="text-primary font-bold uppercase tracking-widest mb-3">
                  VERDICTS
                </div>
                <div className="space-y-1.5 font-mono">
                  <div className="flex items-center gap-4">
                    <span className="text-on-surface-variant w-16">80–100</span>
                    <span className="text-[#00FF9C] font-bold">GENIUS</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-on-surface-variant w-16">65–79</span>
                    <span className="text-[#60a5fa] font-bold">SOLID</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-on-surface-variant w-16">50–64</span>
                    <span className="text-[#facc15] font-bold">RISKY</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-on-surface-variant w-16">0–49</span>
                    <span className="text-[#ff716c] font-bold">PASS</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
