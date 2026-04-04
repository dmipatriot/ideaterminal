import { supabase } from './supabase';

export interface Fork {
  id: string;
  parent_post_id: string;
  fork_name: string;
  author_note: string;
  suggested_tags: string[] | null;
  suggested_tech_stack: string[] | null;
  status: string;
  created_at: string;
}

export async function getForksByPostId(postId: string): Promise<Fork[]> {
  const { data, error } = await supabase
    .from('forks')
    .select('*')
    .eq('parent_post_id', postId)
    .order('created_at', { ascending: true });

  if (error) return [];
  return (data ?? []) as Fork[];
}
