import { supabase } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rateLimit';
import { sanitizeForkName, sanitizeText, sanitizeTagArray } from '@/lib/sanitize';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Honeypot check — bots fill it, humans don't
  if (body.contact_url || body.url) {
    return Response.json({ ok: true }, { status: 200 });
  }

  // Rate limiting by IP — prefer Vercel's trusted edge header (cannot be spoofed by callers)
  const ip =
    request.headers.get('x-vercel-forwarded-for') ??
    request.headers.get('x-real-ip') ??
    'unknown';

  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return Response.json(
      { error: 'Too many submissions. Try again later.' },
      { status: 429 }
    );
  }

  // Validate parent_post_id
  const parentPostId = body.parent_post_id;
  if (typeof parentPostId !== 'string' || !UUID_RE.test(parentPostId)) {
    return Response.json({ error: 'Invalid parent_post_id' }, { status: 400 });
  }

  // Validate field presence and lengths
  const rawForkName = body.fork_name;
  const rawAuthorNote = body.author_note;

  if (typeof rawForkName !== 'string' || rawForkName.trim().length === 0) {
    return Response.json({ error: 'fork_name is required', field: 'fork_name' }, { status: 400 });
  }
  if (typeof rawAuthorNote !== 'string' || rawAuthorNote.trim().length === 0) {
    return Response.json({ error: 'author_note is required', field: 'author_note' }, { status: 400 });
  }
  if (rawForkName.length > 80) {
    return Response.json({ error: 'Fork name must be 80 characters or fewer', field: 'fork_name' }, { status: 400 });
  }
  if (rawAuthorNote.length > 2000) {
    return Response.json({ error: 'Author note must be 2000 characters or fewer', field: 'author_note' }, { status: 400 });
  }

  // Validate tag arrays
  const rawTags = body.suggested_tags;
  const rawStack = body.suggested_tech_stack;

  if (rawTags !== undefined && rawTags !== null) {
    if (!Array.isArray(rawTags)) {
      return Response.json({ error: 'suggested_tags must be an array', field: 'suggested_tags' }, { status: 400 });
    }
    if (rawTags.length > 10) {
      return Response.json({ error: 'suggested_tags cannot exceed 10 items', field: 'suggested_tags' }, { status: 400 });
    }
  }
  if (rawStack !== undefined && rawStack !== null) {
    if (!Array.isArray(rawStack)) {
      return Response.json({ error: 'suggested_tech_stack must be an array', field: 'suggested_tech_stack' }, { status: 400 });
    }
    if (rawStack.length > 10) {
      return Response.json({ error: 'suggested_tech_stack cannot exceed 10 items', field: 'suggested_tech_stack' }, { status: 400 });
    }
  }

  // Sanitize
  const forkName = sanitizeForkName(rawForkName);
  if (!forkName) {
    return Response.json(
      { error: 'Fork name contains invalid characters. Use letters, numbers, spaces, hyphens, or underscores.', field: 'fork_name' },
      { status: 400 }
    );
  }

  const authorNote = sanitizeText(rawAuthorNote);
  if (!authorNote) {
    return Response.json({ error: 'author_note is required', field: 'author_note' }, { status: 400 });
  }

  const suggestedTags = rawTags != null ? sanitizeTagArray(rawTags) : null;
  const suggestedStack = rawStack != null ? sanitizeTagArray(rawStack) : null;

  // Validate sanitized tag items
  if (rawTags != null && Array.isArray(rawTags) && rawTags.length > 0 && !suggestedTags) {
    return Response.json(
      { error: 'Tags must be lowercase alphanumeric with hyphens only', field: 'suggested_tags' },
      { status: 400 }
    );
  }
  if (rawStack != null && Array.isArray(rawStack) && rawStack.length > 0 && !suggestedStack) {
    return Response.json(
      { error: 'Tech stack items must be lowercase alphanumeric with hyphens only', field: 'suggested_tech_stack' },
      { status: 400 }
    );
  }

  // Insert via Supabase client (never raw SQL)
  const { error: insertError } = await supabase.from('forks').insert({
    parent_post_id: parentPostId,
    fork_name: forkName,
    author_note: authorNote,
    suggested_tags: suggestedTags ?? [],
    suggested_tech_stack: suggestedStack ?? [],
    status: 'pending',
  });

  if (insertError) {
    return Response.json({ error: 'Submission failed. Please try again.' }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 201 });
}
