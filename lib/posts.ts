import { supabase } from './supabase';

export type Verdict = 'GENIUS' | 'SOLID' | 'RISKY' | 'PASS';
export type PostStatus = 'draft' | 'ready' | 'published' | 'review' | 'error';

export interface Post {
  id: string;
  created_at: string;
  updated_at: string;

  source_platform: string;
  conversation_type: string | null;

  title: string;
  slug: string;

  raw_input: string;
  clean_summary: string | null;
  core_idea: string | null;
  why_it_might_work: string | null;
  why_it_might_fail: string | null;
  competitive_moat: string | null;
  biggest_assumption: string | null;
  mvp: string | null;
  first_action: string | null;

  verdict: Verdict;
  score: number;
  kill_shot: string | null;

  signal_score: number | null;
  execution_score: number | null;
  risk_score: number | null;

  market_pull: number | null;
  market_pull_reason: string | null;
  timing: number | null;
  timing_reason: string | null;
  differentiation: number | null;
  differentiation_reason: string | null;
  feasibility: number | null;
  feasibility_reason: string | null;
  monetization: number | null;
  monetization_reason: string | null;
  distribution: number | null;
  distribution_reason: string | null;
  founder_fit: number | null;
  founder_fit_reason: string | null;
  defensibility: number | null;
  defensibility_reason: string | null;
  assumption_density: number | null;
  assumption_density_reason: string | null;

  tech_stack: string[] | null;

  tags: string[];
  tone: string | null;

  needs_review: boolean;
  review_reason: string | null;

  status: PostStatus;

  image_url: string | null;
  image_prompt: string | null;
  image_style: string | null;

  published_at: string | null;

  metadata: Record<string, unknown>;
}

export async function getAllPublishedPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Post[];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  return data as Post;
}
