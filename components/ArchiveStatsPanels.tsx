import type { ArchiveStats, VerdictCount } from '@/lib/getArchiveStats';

const MONTH_SINGLE = ['J','F','M','A','M','J','J','A','S','O','N','D'];

interface Props {
  stats: ArchiveStats;
}

const VERDICT_ORDER = ['GENIUS', 'SOLID', 'RISKY', 'PASS'] as const;

const VERDICT_STYLES: Record<string, { border: string; text: string; bar: string }> = {
  GENIUS: { border: 'border-[#00FF9C]', text: 'text-[#00FF9C]', bar: 'bg-[#00FF9C]/30' },
  SOLID:  { border: 'border-[#4db8ff]', text: 'text-[#4db8ff]', bar: 'bg-[#4db8ff]/30' },
  RISKY:  { border: 'border-[#ffaa00]', text: 'text-[#ffaa00]', bar: 'bg-[#ffaa00]/30' },
  PASS:   { border: 'border-[#333]',    text: 'text-[#666]',    bar: 'bg-[#333]/60'    },
};

function getDimBarClass(avg: number): string {
  if (avg >= 6.5) return 'bg-[#00FF9C]/60';
  if (avg < 5.5)  return 'bg-[#3d2a00]';
  return 'bg-[#2a6644]';
}

function getDimTextClass(avg: number): string {
  if (avg >= 6.5) return 'text-[#00FF9C]';
  if (avg < 5.5)  return 'text-[#ffaa00]';
  return 'text-[#444]';
}

export default function ArchiveStatsPanels({ stats }: Props) {
  const { submissionsByMonth, verdictDistribution, dimensionAverages } = stats;

  // Panel 1: SUBMISSIONS_BY_MONTH
  const peak = submissionsByMonth.reduce((a, b) => (b.count > a.count ? b : a), submissionsByMonth[0]);
  const total = submissionsByMonth.reduce((sum, m) => sum + m.count, 0);
  const yMax = Math.max(4, peak.count);
  const yStep = yMax <= 8 ? 1 : Math.ceil(yMax / 5);
  const yTicks: number[] = [];
  for (let i = yMax; i >= 0; i -= yStep) yTicks.push(i);
  if (yTicks[yTicks.length - 1] !== 0) yTicks.push(0);

  // Panel 2: VERDICT_DISTRIBUTION
  const verdictMap: Record<string, number> = {};
  for (const v of verdictDistribution) {
    verdictMap[v.verdict] = v.count;
  }
  const verdictTotal = verdictDistribution.reduce((sum, v) => sum + v.count, 0);
  const hitCount = (verdictMap['GENIUS'] ?? 0) + (verdictMap['SOLID'] ?? 0);
  const hitRate = verdictTotal > 0 ? Math.round((hitCount / verdictTotal) * 100) : 0;
  const verdictPeak = verdictTotal > 0
    ? verdictDistribution.reduce((a: VerdictCount, b: VerdictCount) => (b.count > a.count ? b : a))
    : null;

  // Panel 3: DIMENSION_AVERAGES
  const topDim = dimensionAverages[0] ?? null;
  const weakDim = dimensionAverages[dimensionAverages.length - 1] ?? null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      {/* SUBMISSIONS_BY_MONTH */}
      <div className="border border-[#00FF9C]/10 bg-surface-container-lowest p-5 flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
            SUBMISSIONS_BY_MONTH
          </span>
        </div>
        <div className="text-[9px] text-on-surface-variant/40 uppercase tracking-widest mb-4">
          {new Date().getFullYear()} // PUBLISHED ONLY
        </div>
        {/* Chart: y-axis + bars / spacer + x-labels */}
        <div
          className="grid gap-x-1 flex-1 min-h-0"
          style={{ gridTemplateColumns: '14px 1fr', gridTemplateRows: '1fr 14px' }}
        >
          {/* Y-axis ticks */}
          <div className="flex flex-col justify-between items-end">
            {yTicks.map((t) => (
              <span key={t} className="text-[8px] text-on-surface-variant/40 leading-none">{t}</span>
            ))}
          </div>
          {/* Bars */}
          <div className="flex items-end gap-px">
            {submissionsByMonth.map((m) => (
              <div key={m.label} className="flex-1 h-full flex flex-col justify-end">
                <div
                  className={`w-full ${m.count > 0 && m.count === peak.count ? 'bg-[#00FF9C]' : 'bg-[#222]'}`}
                  style={{ height: m.count > 0 ? `${(m.count / yMax) * 100}%` : '0%' }}
                />
              </div>
            ))}
          </div>
          {/* Spacer */}
          <div />
          {/* X-axis labels */}
          <div className="flex gap-px">
            {MONTH_SINGLE.map((l, i) => (
              <span key={i} className="flex-1 text-center text-[8px] text-on-surface-variant/40 leading-none">
                {l}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/5 text-[9px] text-on-surface-variant/50 uppercase tracking-widest flex justify-between">
          <span>PEAK: {peak.count > 0 ? peak.label : 'N/A'} ({peak.count})</span>
          <span>TOTAL: {total}</span>
        </div>
      </div>

      {/* VERDICT_DISTRIBUTION */}
      <div className="border border-[#00FF9C]/10 bg-surface-container-lowest p-5">
        <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">
          VERDICT_DISTRIBUTION
        </div>
        <div className="text-5xl font-black text-primary crt-glow mb-4">
          {hitRate}%
        </div>
        <div className="text-[9px] text-on-surface-variant/50 uppercase tracking-widest mb-4">
          HIT_RATE // GENIUS + SOLID
        </div>
        <div className="space-y-3">
          {VERDICT_ORDER.map((verdict) => {
            const count = verdictMap[verdict] ?? 0;
            const styles = VERDICT_STYLES[verdict];
            return (
              <div key={verdict} className="flex items-center gap-2">
                <span className={`text-[9px] border px-1.5 py-0.5 uppercase tracking-widest shrink-0 ${styles.border} ${styles.text}`}>
                  {verdict}
                </span>
                <div className="flex-1 h-1 bg-white/5">
                  <div
                    className={`h-full transition-all ${styles.bar}`}
                    style={{ width: verdictPeak && verdictPeak.count > 0 ? `${(count / verdictPeak.count) * 100}%` : '0%' }}
                  />
                </div>
                <span className={`text-[9px] font-bold shrink-0 ${styles.text}`}>{count}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-3 border-t border-white/5 text-[9px] text-on-surface-variant/50 uppercase tracking-widest">
          VERDICT_ENGINE_V4 // THRESHOLD: 80/65/50
        </div>
      </div>

      {/* DIMENSION_AVERAGES */}
      <div className="border border-[#00FF9C]/10 bg-surface-container-lowest p-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
            DIMENSION_AVERAGES
          </span>
        </div>
        {dimensionAverages.length === 0 ? (
          <div className="text-[10px] text-on-surface-variant/30 uppercase tracking-widest py-4">
            NO DATA YET
          </div>
        ) : (
          <div className="space-y-2">
            {dimensionAverages.map((d) => (
              <div key={d.key}>
                <div className="flex justify-between mb-1">
                  <span className="text-[9px] text-on-surface-variant uppercase tracking-widest">
                    {d.label}
                  </span>
                  <span className={`text-[9px] font-bold ${getDimTextClass(d.avg)}`}>
                    {d.avg.toFixed(1)}
                  </span>
                </div>
                <div className="h-1 bg-white/5">
                  <div
                    className={`h-full transition-all ${getDimBarClass(d.avg)}`}
                    style={{ width: `${(d.avg / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 pt-3 border-t border-white/5 text-[9px] text-on-surface-variant/50 uppercase tracking-widest">
          TOP: [{topDim ? topDim.label : 'N/A'}] // WEAK: [{weakDim ? weakDim.label : 'N/A'}]
        </div>
      </div>

    </div>
  );
}
