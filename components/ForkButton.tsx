'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ForkModal from './ForkModal';

export default function ForkButton({ parentPostId }: { parentPostId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  function handleSuccess() {
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="h-16 flex-1 border border-[#00FF9C] text-[#00FF9C] font-bold uppercase tracking-widest text-sm hover:bg-[#00FF9C]/5 transition-colors"
        style={{ letterSpacing: '1px' }}
      >
        ↦ FORK
      </button>

      <ForkModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        parentPostId={parentPostId}
        onSuccess={handleSuccess}
      />
    </>
  );
}
