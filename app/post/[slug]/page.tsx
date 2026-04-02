import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, Post, Verdict } from '@/lib/posts';
import ScoringInfoModal from '@/components/ScoringInfoModal';
import BuildV1Modal from '@/components/BuildV1Modal';
import BusinessTypeBadge from '@/components/BusinessTypeBadge';

/* ── Verdict config ──────────────────────────────────────── */
const VERDICT_CONFIG: Record<
  Verdict,
  { label: string; color: string; bg: string; border: string }
> = {
  GENIUS: {
    label: 'GENIUS',
    color: 'text-[#00FF9C]',
    bg: 'bg-[#00FF9C]/10',
    border: 'border-[#00FF9C]',
  },
  SOLID: {
    label: 'SOLID',
    color: 'text-[#60a5fa]',
    bg: 'bg-[#60a5fa]/10',
    border: 'border-[#60a5fa]',
  },
  RISKY: {
    label: 'RISKY',
    color: 'text-[#facc15]',
    bg: 'bg-[#facc15]/10',
    border: 'border-[#facc15]',
  },
  PASS: {
    label: 'PASS',
    color: 'text-[#ff716c]',
    bg: 'bg-[#ff716c]/10',
    border: 'border-[#ff716c]',
  },
};

const DIMENSION_GROUPS = [
  {
    category: 'SIGNAL',
    color: '#00FF9C',
    dimensions: [
      { key: 'market_pull', label: 'MARKET_PULL' },
      { key: 'timing', label: 'TIMING' },
      { key: 'differentiation', label: 'DIFFERENTIATION' },
    ],
  },
  {
    category: 'EXECUTION',
    color: '#60a5fa',
    dimensions: [
      { key: 'feasibility', label: 'FEASIBILITY' },
      { key: 'monetization', label: 'MONETIZATION' },
      { key: 'distribution', label: 'DISTRIBUTION' },
    ],
  },
  {
    category: 'RISK',
    color: '#ff716c',
    dimensions: [
      { key: 'founder_fit', label: 'FOUNDER_FIT' },
      { key: 'defensibility', label: 'DEFENSIBILITY' },
      { key: 'assumption_density', label: 'ASSUMPTION_DENSITY' },
    ],
  },
] as const;

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

  const techStack: string[] = Array.isArray(post.tech_stack)
    ? post.tech_stack
    : [];

  const verdict = VERDICT_CONFIG[post.verdict] ?? VERDICT_CONFIG.PASS;

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
        <div className="flex items-center gap-3 mb-4 text-[11px] uppercase tracking-widest">
          <span className="text-primary font-bold">ID: {slug}</span>
          <span className="text-on-surface-variant/40">|</span>
          <span className="text-on-surface-variant">STATUS: ANALYZING</span>
        </div>

        <h1 className="text-4xl font-black text-primary tracking-tighter leading-none uppercase mb-6 crt-glow">
          {post.title.toUpperCase()}
        </h1>

        {post.business_type && (
          <div className="mb-3">
            <BusinessTypeBadge type={post.business_type} />
          </div>
        )}

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
      <Section label="AI_ANALYSIS_ENGINE_V4" right={<ScoringInfoModal />}>
        {/* 1. Composite score + verdict badge */}
        <div className="flex items-center gap-6 mb-6 p-6 bg-surface-container border border-white/5">
          <div className="flex-shrink-0">
            <div className={`text-7xl font-black crt-glow ${verdict.color}`}>
              {Math.round(post.score)}
            </div>
            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
              COMPOSITE_SCORE / 100
            </div>
          </div>
          <div className="flex-shrink-0">
            <div
              className={`px-4 py-2 border text-sm font-black uppercase tracking-widest ${verdict.color} ${verdict.bg} ${verdict.border}`}
            >
              [ {verdict.label} ]
            </div>
          </div>
        </div>

        {/* 2. Category bars */}
        {(post.signal_score != null ||
          post.execution_score != null ||
          post.risk_score != null) && (
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <CategoryBar label="SIGNAL" value={post.signal_score} color="#00FF9C" />
            <CategoryBar
              label="EXECUTION"
              value={post.execution_score}
              color="#60a5fa"
            />
            <CategoryBar label="RISK" value={post.risk_score} color="#ff716c" />
          </div>
        )}

        {/* 3. Grouped dimension grid — 3 columns matching bars above */}
        <div className="grid grid-cols-3 gap-x-3">
          {/* Category headers */}
          {DIMENSION_GROUPS.map(({ category, color }) => (
            <div
              key={category}
              className="text-[9px] font-bold uppercase tracking-widest mb-2 pl-1"
              style={{ color }}
            >
              {category}
            </div>
          ))}
          {/* Dimension tiles — each column stacks vertically */}
          {Array.from({ length: 3 }).map((_, rowIdx) =>
            DIMENSION_GROUPS.map(({ dimensions }) => {
              const { key, label } = dimensions[rowIdx];
              const val = post[key as keyof Post] as number | null;
              const reason = post[`${key}_reason` as keyof Post] as string | null;
              if (val == null) return <div key={key} />;
              return (
                <DimensionTile key={key} label={label} score={val} reason={reason} />
              );
            })
          )}
        </div>
      </Section>

      {/* ── KILL_SHOT ─────────────────────────────────────── */}
      {post.kill_shot && (
        <Section label="KILL_SHOT">
          <div className="p-6 bg-[#ff716c]/5 border-l-4 border-[#ff716c] border border-[#ff716c]/20">
            <p className="text-sm text-[#ff716c] leading-relaxed font-bold uppercase tracking-wide">
              {post.kill_shot}
            </p>
          </div>
        </Section>
      )}

      {/* ── WHY IT MIGHT WORK / FAIL ──────────────────────── */}
      {(post.why_it_might_work || post.why_it_might_fail) && (
        <Section label="VECTOR_ANALYSIS">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {post.why_it_might_work && (
              <div className="p-6 bg-surface-container border border-white/5 border-l-4 border-l-[#00FF9C]">
                <div className="text-[10px] text-[#00FF9C] uppercase tracking-widest mb-3 font-bold">
                  [+] WHY_IT_MIGHT_WORK
                </div>
                <p className="text-sm text-on-surface leading-relaxed">
                  {post.why_it_might_work}
                </p>
              </div>
            )}
            {post.why_it_might_fail && (
              <div className="p-6 bg-surface-container border border-white/5 border-l-4 border-l-[#ff716c]">
                <div className="text-[10px] text-[#ff716c] uppercase tracking-widest mb-3 font-bold">
                  [-] WHY_IT_MIGHT_FAIL
                </div>
                <p className="text-sm text-on-surface leading-relaxed">
                  {post.why_it_might_fail}
                </p>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ── BIGGEST_ASSUMPTION ────────────────────────────── */}
      {post.biggest_assumption && (
        <Section label="BIGGEST_ASSUMPTION">
          <div className="p-6 bg-[#facc15]/5 border border-[#facc15]/20 border-l-4 border-l-[#facc15]">
            <p className="text-sm text-on-surface leading-relaxed">
              {post.biggest_assumption}
            </p>
          </div>
        </Section>
      )}

      {/* ── COMPETITIVE_MOAT ──────────────────────────────── */}
      {post.competitive_moat && (
        <Section label="COMPETITIVE_MOAT">
          <div className="p-6 bg-surface-container border border-white/5 border-l-4 border-l-primary">
            <p className="text-sm text-on-surface leading-relaxed">
              {post.competitive_moat}
            </p>
          </div>
        </Section>
      )}

      {/* ── MVP_PATH ──────────────────────────────────────── */}
      {(post.mvp || post.first_action) && (
        <Section label="MVP_PATH">
          <div className="p-6 bg-surface-container border border-white/5">
            {post.mvp && (
              <p className="text-sm text-on-surface leading-relaxed mb-4">
                {post.mvp}
              </p>
            )}
            {post.first_action && (
              <div className="border-t border-white/5 pt-4 mt-2">
                <div className="text-[10px] text-primary uppercase tracking-widest mb-2 font-bold">
                  &gt; FIRST_ACTION
                </div>
                <p className="text-sm text-primary font-bold leading-relaxed crt-glow">
                  {post.first_action}
                </p>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ── TECH_STACK ────────────────────────────────────── */}
      {techStack.length > 0 && (
        <Section label="TECH_STACK">
          <div className="flex flex-wrap gap-4">
            {techStack.map((slug) => (
              <div key={slug} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-surface-container border border-white/10 flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://cdn.simpleicons.org/${slug}`}
                    alt={slug}
                    className="w-6 h-6 object-contain"
                    style={{ filter: 'brightness(0) invert(1) opacity(0.7)' }}
                  />
                </div>
                <span className="text-[9px] text-on-surface-variant uppercase tracking-widest">
                  {slug}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

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
        <BuildV1Modal prompt={post.claude_code_prompt} />
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

function CategoryBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number | null;
  color: string;
}) {
  if (value == null) return null;
  const pct = Math.min(Math.max(value, 0), 100);
  return (
    <div className="p-4 bg-surface-container border border-white/5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">
          {label}
        </span>
        <span className="text-[11px] font-bold" style={{ color }}>
          {pct}
        </span>
      </div>
      <div className="h-1.5 bg-white/5 w-full">
        <div
          className="h-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color, opacity: 0.7 }}
        />
      </div>
    </div>
  );
}

function DimensionTile({
  label,
  score,
  reason,
}: {
  label: string;
  score: number;
  reason: string | null;
}) {
  const pct = Math.min(Math.max(score, 0), 10);
  const color =
    pct >= 7 ? '#00FF9C' : pct >= 4 ? '#facc15' : '#ff716c';
  return (
    <div className="p-4 bg-surface-container border border-white/5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-on-surface-variant uppercase tracking-widest">
          {label}
        </span>
        <span className="text-sm font-black" style={{ color }}>
          {pct}
          <span className="text-[10px] text-on-surface-variant font-light">/10</span>
        </span>
      </div>
      {reason && (
        <p className="text-[10px] text-on-surface-variant/70 leading-relaxed">
          {reason}
        </p>
      )}
    </div>
  );
}
