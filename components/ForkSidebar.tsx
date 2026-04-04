'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Fork } from '@/lib/forks';
import ForkModal from './ForkModal';

interface Props {
  forks: Fork[];
  parentPostId: string;
  postSlug: string;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function ForkDetail({ fork }: { fork: Fork }) {
  return (
    <div className="border-t border-surface-container px-3 py-3 flex flex-col gap-2">
      <div className="text-[9px] text-[#00FF9C] uppercase tracking-[2px] font-bold">
        FORK_DETAIL
      </div>
      <div className="text-[12px] text-secondary font-medium break-words">
        {fork.fork_name}
      </div>
      <div
        className="text-[10px] text-on-surface-variant/55 leading-relaxed break-words whitespace-pre-wrap"
        style={{ lineHeight: '1.6' }}
      >
        {fork.author_note}
      </div>
      {fork.suggested_tags && fork.suggested_tags.length > 0 && (
        <div className="flex flex-col gap-0.5">
          <div className="text-[9px] text-on-surface-variant/35 uppercase tracking-widest">
            TAGS
          </div>
          <div className="text-[10px] text-on-surface-variant/55">
            {fork.suggested_tags.join(', ')}
          </div>
        </div>
      )}
      {fork.suggested_tech_stack && fork.suggested_tech_stack.length > 0 && (
        <div className="flex flex-col gap-0.5">
          <div className="text-[9px] text-on-surface-variant/35 uppercase tracking-widest">
            TECH_STACK
          </div>
          <div className="text-[10px] text-on-surface-variant/55">
            {fork.suggested_tech_stack.join(', ')}
          </div>
        </div>
      )}
      <div className="text-[9px] text-on-surface-variant/25">
        {relativeTime(fork.created_at)}
      </div>
    </div>
  );
}

function ForkTree({
  forks,
  postSlug,
  selectedId,
  onSelectFork,
  onAddFork,
}: {
  forks: Fork[];
  postSlug: string;
  selectedId: string | null;
  onSelectFork: (fork: Fork) => void;
  onAddFork: () => void;
}) {
  return (
    <div className="flex flex-col">
      {/* Parent node */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-surface-container-low border-l-2 border-[#00FF9C]">
        <span className="text-[9px] text-on-surface-variant/50">▼</span>
        <span className="text-[11px] text-secondary font-medium truncate">
          {postSlug}/
        </span>
      </div>

      {/* Fork nodes */}
      {forks.map((fork) => (
        <button
          key={fork.id}
          onClick={() => onSelectFork(fork)}
          className={`flex items-center gap-1.5 pl-7 pr-3 py-1.5 border-l border-white/5 text-left w-full transition-colors ${
            selectedId === fork.id
              ? 'bg-[#00FF9C]/10 text-secondary'
              : 'text-on-surface-variant/70 hover:bg-[#00FF9C]/5 hover:text-on-surface-variant'
          }`}
        >
          <span className="text-[8px] opacity-50 flex-shrink-0">▶</span>
          <span className="text-[10px] truncate overflow-hidden whitespace-nowrap">
            {fork.fork_name}
          </span>
        </button>
      ))}

      {/* Add fork hint */}
      <button
        onClick={onAddFork}
        className="flex items-center gap-1.5 pl-7 pr-3 py-1.5 border-l border-dashed border-on-surface-variant/20 text-left w-full hover:border-[#00FF9C]/30 transition-colors"
      >
        <span className="text-[10px] italic text-on-surface-variant/20 hover:text-on-surface-variant/40 transition-colors">
          + add fork...
        </span>
      </button>
    </div>
  );
}

export default function ForkSidebar({ forks, parentPostId, postSlug }: Props) {
  const [selectedFork, setSelectedFork] = useState<Fork | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const router = useRouter();

  function handleSelectFork(fork: Fork) {
    setSelectedFork((prev) => (prev?.id === fork.id ? null : fork));
  }

  function handleSuccess() {
    router.refresh();
  }

  const treeContent = (
    <>
      <ForkTree
        forks={forks}
        postSlug={postSlug}
        selectedId={selectedFork?.id ?? null}
        onSelectFork={handleSelectFork}
        onAddFork={() => setModalOpen(true)}
      />
      {selectedFork && <ForkDetail fork={selectedFork} />}
    </>
  );

  return (
    <>
      {/* Desktop sidebar — sticky right column */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 sticky top-14 self-start mt-44 h-[calc(100vh-3.5rem)] overflow-y-auto terminal-scroll bg-background border-l border-surface-container">
        {/* Header */}
        <div className="px-3 py-3 border-b border-surface-container flex-shrink-0">
          <span className="text-[10px] text-[#00FF9C] font-bold uppercase tracking-[2px]">
            ▸ FORK_TREE
          </span>
        </div>
        <div className="flex-1 overflow-y-auto terminal-scroll">
          {treeContent}
        </div>
      </aside>

      {/* Mobile section — collapsible, below main content */}
      <div className="lg:hidden border-t border-surface-container mt-10">
        <button
          onClick={() => setMobileExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-[10px] text-[#00FF9C] font-bold uppercase tracking-[2px] hover:bg-[#00FF9C]/5 transition-colors"
        >
          <span>▸ FORK_TREE ({forks.length})</span>
          <span className="text-on-surface-variant/50">{mobileExpanded ? '▲' : '▼'}</span>
        </button>
        {mobileExpanded && (
          <div className="border-t border-surface-container">
            <ForkTree
              forks={forks}
              postSlug={postSlug}
              selectedId={selectedFork?.id ?? null}
              onSelectFork={handleSelectFork}
              onAddFork={() => setModalOpen(true)}
            />
            {selectedFork && <ForkDetail fork={selectedFork} />}
          </div>
        )}
      </div>

      <ForkModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        parentPostId={parentPostId}
        onSuccess={handleSuccess}
      />
    </>
  );
}
