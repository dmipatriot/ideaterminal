'use client';
import { useState } from 'react';

export default function TechStackIcon({ name }: { name: string }) {
  const [failed, setFailed] = useState(false);

  // Simple Icons slugs are lowercase alphanumeric only
  const iconSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Abbreviation: initials if multi-word, else first 2 chars
  const abbrev = (() => {
    const words = name.replace(/[^a-zA-Z0-9 ]/g, ' ').trim().split(/\s+/);
    const initials = words.map((w) => w[0]).join('').toUpperCase();
    return initials.length >= 2 ? initials.slice(0, 2) : name.slice(0, 2).toUpperCase();
  })();

  return (
    <div title={name} className="flex flex-col items-center gap-2 cursor-default">
      <div className="w-10 h-10 bg-surface-container border border-white/10 flex items-center justify-center p-2">
        {!failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://cdn.simpleicons.org/${iconSlug}`}
            alt={name}
            className="w-6 h-6 object-contain"
            style={{ filter: 'brightness(0) invert(1) opacity(0.7)' }}
            onError={() => setFailed(true)}
          />
        ) : (
          <span className="text-[10px] font-bold text-on-surface-variant tracking-widest">
            {abbrev}
          </span>
        )}
      </div>
      <span className="text-[9px] text-on-surface-variant uppercase tracking-widest">
        {name}
      </span>
    </div>
  );
}
