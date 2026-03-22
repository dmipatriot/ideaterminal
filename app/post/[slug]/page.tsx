import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, Post, Verdict } from '@/lib/posts';

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const tags: string[] = Array.isArray(post.tags)
    ? post.tags
    : typeof post.tags === 'string'
    ? JSON.parse(post.tags)
    : [];

  return (
    <div className="min-h-screen bg-background px-4 md:px-8 py-10 max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href="/archive"
        className="text-[11px] text-on-surface-variant/50 hover:text-on-surface-variant uppercase tracking-widest transition-colors mb-8 inline-block"
      >
        ← RETURN TO ARCHIVE
      </Link>

      {/* ── Entity header ─────────────────────────────────── */}
      <div className="mb-10">
        {/* Metadata row */}
        <div className="flex items-center gap-3 mb-4 text-[11px] uppercase tracking-widest">
          <span className="text-primary font-bold">ID: {slug}</span>
          <span className="text-on-surface-variant/40">|</span>
          <span className="text-on-surface-variant">STATUS: ANALYZING</span>
        </div>

        {/* Title */}
        <h1
          className="text-4xl font-black text-primary tracking-tighter leading-none uppercase mb-6"
          style={{ textShadow: '0 0 10px rgba(0,255,156,0.3)' }}
        >
          {post.title.toUpperCase()}
        </h1>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: string) => (
              <span
                key={tag}
                className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 font-bold uppercase tracking-widest"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Hero image ────────────────────────────────────── */}
      {post.image_url && (
        <div className="mb-10 relative w-full overflow-hidden">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full object-cover border border-primary/10"
            style={{ maxHeight: '400px' }}
          />
        </div>
      )}

      {/* ── RAW_INPUT ─────────────────────────────────────── */}
      <Section label="RAW_INPUT">
        <div className="relative p-8 bg-white/5 border-l-2 border-primary corner-accent">
          <p className="text-lg leading-relaxed font-light text-on-surface mb-6">
            {post.raw_input}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[10px] text-on-surface-variant/60 uppercase tracking-widest border-t border-white/5 pt-4">
            <span>SOURCE: USER_SUBMISSION</span>
            {post.created_at && (
              <span>
                {new Date(post.created_at)
                  .toISOString()
                  .replace('T', ' ')
                  .slice(0, 19)}{' '}
                UTC
              </span>
            )}
          </div>
        </div>
      </Section>

      {/* ── AI_ANALYSIS_ENGINE_V4 ─────────────────────────── */}
      <Section
        label="AI_ANALYSIS_ENGINE_V4"
        right={
          <span className="text-[11px] text-on-surface-variant uppercase tracking-widest">
            CORE_STRENGTH:{' '}
            <span className="text-primary font-bold">{post.score}/10</span>
          </span>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {/* Market Fit */}
          <BentoCard label="MARKET_FIT">
            <div className="text-2xl font-black crt-glow text-primary mb-2">
              {post.score >= 7 ? 'HIGH' : post.score >= 4 ? 'MEDIUM' : 'LOW'}
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              {post.core_idea ?? 'ANALYSIS PENDING...'}
            </p>
          </BentoCard>

          {/* Scalability */}
          <BentoCard label="SCALABILITY">
            <div className="text-2xl font-black crt-glow text-primary mb-2">
              {post.score}
              <span className="text-base font-light text-on-surface-variant">/10</span>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              {post.clean_summary ?? 'PROCESSING...'}
            </p>
          </BentoCard>
        </div>

        {/* Competitive Moat — full width */}
        <div className="bg-surface-container border border-white/5 border-l-4 border-l-primary p-6">
          <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">
            COMPETITIVE_MOAT
          </div>
          <p className="text-sm text-on-surface leading-relaxed">
            {post.why_it_might_work ?? 'NO DATA.'}
          </p>
        </div>
      </Section>

      {/* ── RISK_REPORT ───────────────────────────────────── */}
      <Section label="RISK_REPORT">
        <div className="p-6 bg-white/[0.02] border border-white/10">
          {/* Visual bar */}
          <div className="h-2 bg-white/5 flex overflow-hidden mb-6">
            <div
              className="bg-primary-container/70 h-full transition-all"
              style={{ width: `${Math.min(post.score * 10, 70)}%` }}
            />
            <div
              className="bg-error/60 h-full transition-all"
              style={{
                width: `${Math.max(10, 40 - post.score * 3)}%`,
              }}
            />
            <div className="bg-white/10 h-full flex-1" />
          </div>

          {/* Three columns */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <RiskStat
              label="FEASIBILITY"
              value={`${Math.round(post.score * 10)}%`}
            />
            <RiskStat
              label="REGULATORY"
              value={
                (post.why_it_might_fail?.length ?? 0) > 200
                  ? 'CRIT'
                  : (post.why_it_might_fail?.length ?? 0) > 80
                  ? 'MED'
                  : 'LOW'
              }
            />
            <RiskStat
              label="ADOPTION"
              value={post.score >= 6 ? 'VIABLE' : post.score >= 3 ? 'UNCERTAIN' : 'RISKY'}
            />
          </div>
        </div>
      </Section>

      {/* ── Terminal log decoration ───────────────────────── */}
      <div className="mb-10 bg-black border border-white/10 p-4 font-mono text-[10px] text-primary/40 h-24 overflow-hidden animate-pulse">
        <div>&gt; INITIALIZING MODULE_V4...</div>
        <div>&gt; LOADING ANALYSIS_KERNEL... [OK]</div>
        <div>&gt; CROSS-REFERENCING MARKET_SIGNALS... DONE</div>
        <div>&gt; RISK_MODEL CALIBRATED // THRESHOLD 0.72</div>
        <div>&gt; AWAITING EXECUTION SIGNAL...</div>
      </div>

      {/* ── Action buttons ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button className="h-16 flex-1 bg-primary text-black font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-primary-container transition-colors">
          <span className="material-symbols-outlined text-base">bolt</span>
          [ RUN BUILD_V1 ]
        </button>
        <button className="h-16 flex-1 border border-primary/30 text-primary font-bold uppercase tracking-widest text-sm hover:bg-primary/5 transition-colors">
          REQUEST_SEED_FUNDING
        </button>
      </div>
      <div className="text-center">
        <button className="text-[11px] text-error/40 hover:text-error uppercase tracking-widest transition-colors">
          -- abort_sequence --
        </button>
      </div>
    </div>
  );
}

/* ── Internal sub-components ───────────────────────────── */

function Section({
  label,
  right,
  children,
}: {
  label: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          <span className="text-xs font-bold text-on-surface-variant tracking-widest uppercase">
            {label}
          </span>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function BentoCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-container border border-white/5 p-6">
      <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-4">
        {label}
      </div>
      {children}
    </div>
  );
}

function RiskStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">
        {label}
      </div>
      <div className="text-sm font-bold text-on-surface crt-glow">{value}</div>
    </div>
  );
}

