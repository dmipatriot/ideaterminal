import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPublishedPosts } from '@/lib/posts';
import { getArchiveStats } from '@/lib/getArchiveStats';
import ArchiveRow from './ArchiveRow';
import ArchiveStatsPanels from '@/components/ArchiveStatsPanels';

export const metadata: Metadata = {
  title: 'Archive | IdeaTerminal',
  description: 'Every idea scored and filed. Browse the full archive of AI-evaluated concepts sorted by verdict and score.',
  alternates: {
    canonical: 'https://ideaterminal.vercel.app/archive',
  },
  openGraph: {
    title: 'Archive | IdeaTerminal',
    description: 'Every idea scored and filed. Browse the full archive of AI-evaluated concepts sorted by verdict and score.',
    url: 'https://ideaterminal.vercel.app/archive',
    type: 'website',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Archive | IdeaTerminal',
    description: 'Every idea scored and filed. Browse the full archive of AI-evaluated concepts sorted by verdict and score.',
    images: ['/og-default.png'],
  },
};

const PAGE_SIZE = 20;

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const [allPosts, stats] = await Promise.all([getAllPublishedPosts(), getArchiveStats()]);
  const total = allPosts.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam ?? 1) || 1), totalPages);
  const offset = (page - 1) * PAGE_SIZE;
  const posts = allPosts.slice(offset, offset + PAGE_SIZE);
  const showing = posts.length;

  return (
    <div className="cursor-crosshair min-h-screen bg-background px-4 md:px-8 py-10 max-w-6xl mx-auto">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-primary crt-glow uppercase tracking-tighter mb-2">
          &gt; _ARCHIVE_DUMP_STREAM
        </h1>
        <p className="text-xs text-on-surface-variant uppercase tracking-widest">
          {total} RECORD{total !== 1 ? 'S' : ''} FOUND // DATABASE: IDEATERMINAL_V4 // STATUS: ONLINE
        </p>
      </div>

      {/* ── Table container ────────────────────────────────── */}
      <div className="border border-[#00FF9C]/10 bg-surface-container-lowest overflow-hidden mb-8">

        {/* Controls bar */}
        <div className="bg-[#00FF9C]/5 border-b border-[#00FF9C]/10 p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[10px] text-on-surface-variant font-mono uppercase tracking-widest">
            <span className="text-primary/60">QUERY:</span>{' '}
            SELECT * FROM IDEAS WHERE STATUS=&apos;PUBLISHED&apos;{' '}
            <span className="text-on-surface-variant/50">// LIMIT: 100</span>
          </div>
          <div className="flex gap-2">
            <button className="text-[10px] border border-primary/20 text-primary/60 hover:text-primary hover:border-primary/40 px-3 py-1.5 uppercase tracking-widest transition-colors">
              [ EXPORT_CSV ]
            </button>
            <button className="text-[10px] border border-primary/20 text-primary/60 hover:text-primary hover:border-primary/40 px-3 py-1.5 uppercase tracking-widest transition-colors">
              [ FILTER_RECORDS ]
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-bold whitespace-nowrap">
                  HEX_ID
                </th>
                <th className="px-4 py-3 text-left text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-bold">
                  SCHEMA_NAME
                </th>
                <th className="px-4 py-3 text-left text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-bold hidden md:table-cell whitespace-nowrap">
                  CATEGORY
                </th>
                <th className="px-4 py-3 text-left text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-bold hidden lg:table-cell whitespace-nowrap">
                  TIMESTAMP
                </th>
                <th className="px-4 py-3 text-left text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-bold whitespace-nowrap">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-[11px] text-on-surface-variant/40 uppercase tracking-widest"
                  >
                    NO RECORDS FOUND // STREAM EMPTY
                  </td>
                </tr>
              ) : (
                posts.map((post) => <ArchiveRow key={post.id} post={post} />)
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="bg-surface-container-high border-t border-[#00FF9C]/10 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[10px] text-on-surface-variant uppercase tracking-widest">
            PAGE{' '}
            <span className="text-primary font-bold">
              [ {String(page).padStart(2, '0')} / {String(totalPages).padStart(2, '0')} ]
            </span>
            {' '}// SHOWING{' '}
            <span className="text-on-surface">{showing}</span> OF{' '}
            <span className="text-on-surface">{total}</span> ENTRIES
          </div>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={`/archive?page=${page - 1}`}
                className="text-[10px] border border-primary/20 text-primary/60 hover:text-primary hover:border-primary/40 px-3 py-1.5 uppercase tracking-widest transition-colors"
              >
                [ PREV ]
              </Link>
            ) : (
              <span className="text-[10px] border border-white/5 text-on-surface-variant/20 px-3 py-1.5 uppercase tracking-widest">
                [ PREV ]
              </span>
            )}
            {page < totalPages ? (
              <Link
                href={`/archive?page=${page + 1}`}
                className="text-[10px] border border-primary/20 text-primary/60 hover:text-primary hover:border-primary/40 px-3 py-1.5 uppercase tracking-widest transition-colors"
              >
                [ NEXT ]
              </Link>
            ) : (
              <span className="text-[10px] border border-white/5 text-on-surface-variant/20 px-3 py-1.5 uppercase tracking-widest">
                [ NEXT ]
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Visualization module ────────────────────────────── */}
      <ArchiveStatsPanels stats={stats} />
    </div>
  );
}
