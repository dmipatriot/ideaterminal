const HTML_TAG_RE = /<[^>]*>/g;
const FORK_NAME_RE = /^[a-zA-Z0-9\s\-_]+$/;
const TAG_ITEM_RE = /^[a-z0-9\-]+$/;

/** Strip HTML tags and trim. Used for author_note. */
export function sanitizeText(input: string): string {
  return input.replace(HTML_TAG_RE, '').trim();
}

/**
 * Validate and sanitize fork_name.
 * Returns null if the value is empty after trimming or contains invalid characters.
 */
export function sanitizeForkName(input: string): string | null {
  const stripped = input.replace(HTML_TAG_RE, '').trim().replace(/\s+/g, ' ');
  if (!stripped) return null;
  if (!FORK_NAME_RE.test(stripped)) return null;
  return stripped;
}

/**
 * Validate an array of tag/stack strings.
 * Each item must be lowercase alphanumeric + hyphens, max 40 chars.
 * Returns null if input is not an array, if the array is empty,
 * or if ANY item fails validation (strict — no silent drops).
 */
export function sanitizeTagArray(input: unknown): string[] | null {
  if (!Array.isArray(input)) return null;
  if (input.length === 0) return null;
  const allValid = input.every(
    (item): item is string =>
      typeof item === 'string' &&
      item.length <= 40 &&
      TAG_ITEM_RE.test(item)
  );
  return allValid ? (input as string[]) : null;
}
