import Link from 'next/link';
import { getAllPublishedPosts, Post, Verdict } from '@/lib/posts';

export const dynamic = 'force-dynamic';


function verdictChipClass(verdict: Verdict): string {
  switch (verdict) {
    case 'GENIUS':
      return 'border border-primary-container text-primary-container';
    case 'SOLID':
      return 'border border-[#60a5fa] text-[#60a5fa]';
    case 'RISKY':
      return 'border border-[#facc15] text-[#facc15]';
    case 'PASS':
      return 'border border-error text-error';
    default:
      return 'border border-secondary text-secondary opacity-60';
  }
}

function analysisBlockBorderClass(verdict: Verdict): string {
  switch (verdict) {
    case 'GENIUS':
      return 'border-l-4 border-primary-container/40';
    case 'SOLID':
      return 'border-l-4 border-[#60a5fa]/40';
    case 'RISKY':
      return 'border-l-4 border-[#facc15]/40';
    case 'PASS':
      return 'border-l-4 border-error/40';
    default:
      return 'border-l-4 border-secondary/40';
  }
}

function accentBarClass(verdict: Verdict): string {
  switch (verdict) {
    case 'GENIUS':
      return 'bg-primary-container/20 group-hover:bg-primary-container';
    case 'SOLID':
      return 'bg-[#60a5fa]/20 group-hover:bg-[#60a5fa]';
    case 'RISKY':
      return 'bg-[#facc15]/20 group-hover:bg-[#facc15]';
    case 'PASS':
      return 'bg-error/20 group-hover:bg-error';
    default:
      return 'bg-secondary/20 group-hover:bg-secondary';
  }
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

function truncateId(id: string): string {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

export default async function Home() {
  const posts = await getAllPublishedPosts();

  const count = posts.length;
  const avgScore = count > 0
    ? posts.reduce((s, p) => s + p.score, 0) / count
    : null;
  const riskyCount = posts.filter((p) => p.verdict === 'RISKY').length;
  const riskyRate = count > 0 ? (riskyCount / count) * 100 : null;
  const signalPosts = posts.filter((p) => p.signal_score != null);
  const avgSignal = signalPosts.length > 0
    ? signalPosts.reduce((s, p) => s + (p.signal_score ?? 0), 0) / signalPosts.length
    : null;

  const stats = [
    { label: 'IDEAS_ARCHIVED', value: count.toString() },
    { label: 'AVG_SCORE', value: avgScore != null ? avgScore.toFixed(1) : '--' },
    { label: 'RISKY_RATE', value: riskyRate != null ? riskyRate.toFixed(1) + '%' : '--' },
    { label: 'AVG_SIGNAL', value: avgSignal != null ? avgSignal.toFixed(1) : '--' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 md:px-8 py-8 max-w-4xl mx-auto">

        {/* System Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-10">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border border-primary-container/20 bg-surface p-3"
            >
              <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
                {stat.label}
              </div>
              <div className="text-primary font-bold crt-glow text-sm">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Idea Stream */}
        <div className="space-y-12">
          {posts.map((post: Post) => (
            <article key={post.id} className="relative group pl-6">
              {/* Left accent bar */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-[2px] transition-colors ${accentBarClass(post.verdict)}`}
              />

              {/* Header row */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-[11px] uppercase tracking-wider">
                <span className="text-primary-container font-bold">[SYSTEM: NEW_IDEA]</span>
                <span className="text-on-surface-variant">
                  // TIMESTAMP: {formatTimestamp(post.created_at)}
                </span>
                <span className="text-on-surface-variant">
                  // CID: #{truncateId(post.id)}
                </span>
                <span className={`ml-auto px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${verdictChipClass(post.verdict)}`}>
                  {post.verdict}
                </span>
              </div>

              {/* Title */}
              <Link href={`/post/${post.slug}`}>
                <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none uppercase mb-4 crt-glow">
                  <span className="text-primary-container mr-2">&gt; _</span>
                  {post.title.toUpperCase()}
                </h2>
              </Link>

              {/* Analysis block */}
              <div className={`bg-surface-container p-6 ${analysisBlockBorderClass(post.verdict)}`}>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">
                  AI_REALITY_CHECK // PROCESSING...
                </div>
                <p className="text-sm text-on-surface leading-relaxed mb-6">
                  {post.clean_summary ?? post.raw_input}
                </p>

                {/* Action links */}
                <div className="flex flex-wrap gap-4 text-[11px] uppercase tracking-wider">
                  <button className="text-primary hover:text-primary-container transition-colors">
                    [[ UPVOTE_DATA ]]
                  </button>
                  <button className="text-on-surface-variant hover:text-on-surface transition-colors">
                    [[ FLAG_ANOMALY ]]
                  </button>
                  <button className="text-on-surface-variant hover:text-on-surface transition-colors">
                    [[ SHARE_ENCRYPTED ]]
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom loading indicator */}
        <div className="flex items-center gap-3 mt-16 px-2">
          <div className="flex gap-1.5">
            <div className="w-1 h-1 bg-primary animate-ping" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 bg-primary animate-ping" style={{ animationDelay: '200ms' }} />
            <div className="w-1 h-1 bg-primary animate-ping" style={{ animationDelay: '400ms' }} />
          </div>
          <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">
            FETCHING_REMOTE_ASSETS...
          </span>
        </div>

      </div>
    </div>
  );
}
