import { supabase } from './supabase';

export interface MonthlySubmission {
  month: number;
  label: string;
  count: number;
}

export interface VerdictCount {
  verdict: string;
  count: number;
}

export interface DimensionAverage {
  key: string;
  label: string;
  avg: number;
}

export interface ArchiveStats {
  submissionsByMonth: MonthlySubmission[];
  verdictDistribution: VerdictCount[];
  dimensionAverages: DimensionAverage[];
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const DIMENSIONS = [
  { key: 'market_pull', label: 'MARKET_PULL' },
  { key: 'timing', label: 'TIMING' },
  { key: 'differentiation', label: 'DIFFERENTIATION' },
  { key: 'feasibility', label: 'FEASIBILITY' },
  { key: 'monetization', label: 'MONETIZATION' },
  { key: 'distribution', label: 'DISTRIBUTION' },
  { key: 'founder_fit', label: 'FOUNDER_FIT' },
  { key: 'defensibility', label: 'DEFENSIBILITY' },
  { key: 'assumption_density', label: 'ASSUMPTION_DENSITY' },
];

async function fetchSubmissionsByMonth(): Promise<MonthlySubmission[]> {
  const currentYear = new Date().getFullYear();
  const { data } = await supabase
    .from('posts')
    .select('created_at')
    .eq('status', 'published')
    .gte('created_at', `${currentYear}-01-01`)
    .lt('created_at', `${currentYear + 1}-01-01`);

  const counts = Array(12).fill(0) as number[];
  for (const row of data ?? []) {
    counts[new Date(row.created_at).getMonth()]++;
  }
  return MONTHS.map((label, i) => ({ month: i + 1, label, count: counts[i] }));
}

async function fetchVerdictDistribution(): Promise<VerdictCount[]> {
  const { data } = await supabase
    .from('posts')
    .select('verdict')
    .eq('status', 'published');

  const map: Record<string, number> = {};
  for (const row of data ?? []) {
    map[row.verdict] = (map[row.verdict] ?? 0) + 1;
  }
  return Object.entries(map).map(([verdict, count]) => ({ verdict, count }));
}

async function fetchDimensionAverages(): Promise<DimensionAverage[]> {
  const { data } = await supabase
    .from('posts')
    .select(DIMENSIONS.map((d) => d.key).join(','))
    .eq('status', 'published');

  return DIMENSIONS.map(({ key, label }) => {
    const vals = (data ?? [])
      .map((r) => (r as Record<string, unknown>)[key])
      .filter((v): v is number => typeof v === 'number' && v !== null);
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    return { key, label, avg: Math.round(avg * 10) / 10 };
  }).sort((a, b) => b.avg - a.avg);
}

export async function getArchiveStats(): Promise<ArchiveStats> {
  const [submissionsByMonth, verdictDistribution, dimensionAverages] = await Promise.all([
    fetchSubmissionsByMonth(),
    fetchVerdictDistribution(),
    fetchDimensionAverages(),
  ]);
  return { submissionsByMonth, verdictDistribution, dimensionAverages };
}
