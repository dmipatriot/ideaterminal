'use client';

import { useState, useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  parentPostId: string;
  onSuccess: () => void;
}

interface FormData {
  fork_name: string;
  author_note: string;
  suggested_tags: string;
  suggested_tech_stack: string;
  contact_url: string; // honeypot
}

interface FieldErrors {
  fork_name?: string;
  author_note?: string;
  suggested_tags?: string;
  suggested_tech_stack?: string;
  global?: string;
}

const FORK_NAME_RE = /^[a-zA-Z0-9\s\-_]+$/;
const TAG_ITEM_RE = /^[a-z0-9\-]+$/;

function parseTagString(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function validateClient(data: FormData): FieldErrors {
  const errors: FieldErrors = {};

  const name = data.fork_name.trim();
  if (!name) {
    errors.fork_name = 'Fork name is required';
  } else if (name.length > 80) {
    errors.fork_name = 'Fork name must be 80 characters or fewer';
  } else if (!FORK_NAME_RE.test(name)) {
    errors.fork_name = 'Use letters, numbers, spaces, hyphens, or underscores only';
  }

  const note = data.author_note.trim();
  if (!note) {
    errors.author_note = 'Please describe what you would change';
  } else if (note.length > 2000) {
    errors.author_note = 'Must be 2000 characters or fewer';
  }

  if (data.suggested_tags.trim()) {
    const items = parseTagString(data.suggested_tags);
    if (items.length > 10) {
      errors.suggested_tags = 'Maximum 10 tags';
    } else {
      const invalid = items.find((t) => !TAG_ITEM_RE.test(t));
      if (invalid) {
        errors.suggested_tags = 'Tags must be lowercase alphanumeric with hyphens only (e.g. my-tag)';
      }
    }
  }

  if (data.suggested_tech_stack.trim()) {
    const items = parseTagString(data.suggested_tech_stack);
    if (items.length > 10) {
      errors.suggested_tech_stack = 'Maximum 10 items';
    } else {
      const invalid = items.find((t) => !TAG_ITEM_RE.test(t));
      if (invalid) {
        errors.suggested_tech_stack = 'Tech stack items must be lowercase alphanumeric with hyphens only (e.g. next-js)';
      }
    }
  }

  return errors;
}

export default function ForkModal({ isOpen, onClose, parentPostId, onSuccess }: Props) {
  const [form, setForm] = useState<FormData>({
    fork_name: '',
    author_note: '',
    suggested_tags: '',
    suggested_tech_stack: '',
    contact_url: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [optionalExpanded, setOptionalExpanded] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm({ fork_name: '', author_note: '', suggested_tags: '', suggested_tech_stack: '', contact_url: '' });
      setErrors({});
      setOptionalExpanded(false);
    }
  }, [isOpen]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const clientErrors = validateClient(form);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const tagsArray = form.suggested_tags.trim()
        ? parseTagString(form.suggested_tags)
        : [];
      const stackArray = form.suggested_tech_stack.trim()
        ? parseTagString(form.suggested_tech_stack)
        : [];

      const res = await fetch('/api/forks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_post_id: parentPostId,
          fork_name: form.fork_name,
          author_note: form.author_note,
          suggested_tags: tagsArray.length > 0 ? tagsArray : null,
          suggested_tech_stack: stackArray.length > 0 ? stackArray : null,
          contact_url: form.contact_url, // honeypot — server ignores if filled
        }),
      });

      if (res.status === 429) {
        setErrors({ global: 'Too many submissions. Try again later.' });
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.field) {
          setErrors({ [data.field]: data.error });
        } else {
          setErrors({ global: data.error ?? 'Submission failed. Please try again.' });
        }
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setErrors({ global: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85" />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-3xl max-h-[92vh] bg-background border border-[#00FF9C]/30 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#00FF9C]/15 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#00FF9C] rounded-full animate-pulse" />
            <span className="text-[11px] font-bold text-[#00FF9C] tracking-[2px] uppercase">
              ↦ SUBMIT FORK
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[10px] text-on-surface-variant border border-on-surface-variant/30 px-3 py-1 hover:border-[#00FF9C] hover:text-[#00FF9C] transition-colors uppercase tracking-widest font-bold"
          >
            X
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto terminal-scroll flex flex-col gap-4 p-6 min-h-0" noValidate>
          {/* Honeypot — visually hidden, not display:none so bots fill it */}
          <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
            <input
              type="text"
              name="contact_url"
              value={form.contact_url}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Fork Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-[2px]">
              FORK_NAME <span className="text-[#00FF9C]">*</span>
            </label>
            <input
              type="text"
              name="fork_name"
              value={form.fork_name}
              onChange={handleChange}
              placeholder="my-variation-name"
              maxLength={80}
              className="w-full bg-surface-container-lowest border border-white/5 text-secondary text-[11px] px-3 py-2 font-mono placeholder:text-on-surface-variant/30 focus:outline-none focus:border-[#00FF9C]/40"
            />
            {errors.fork_name && (
              <span className="text-[9px] text-error">{errors.fork_name}</span>
            )}
          </div>

          {/* Author Note */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-[2px]">
              WHAT_WOULD_YOU_CHANGE <span className="text-[#00FF9C]">*</span>
            </label>
            <textarea
              name="author_note"
              value={form.author_note}
              onChange={handleChange}
              rows={5}
              maxLength={2000}
              className="w-full bg-surface-container-lowest border border-white/5 text-secondary text-[11px] px-3 py-2 font-mono placeholder:text-on-surface-variant/30 focus:outline-none focus:border-[#00FF9C]/40 resize-none"
            />
            {errors.author_note && (
              <span className="text-[9px] text-error">{errors.author_note}</span>
            )}
          </div>

          {/* Optional overrides (collapsible) */}
          <div className="border border-white/5">
            <button
              type="button"
              onClick={() => setOptionalExpanded((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2 text-[9px] text-on-surface-variant/60 uppercase tracking-[2px] hover:text-on-surface-variant transition-colors"
            >
              <span>OPTIONAL_OVERRIDES</span>
              <span>{optionalExpanded ? '▲' : '▼'}</span>
            </button>

            {optionalExpanded && (
              <div className="px-3 pb-3 flex flex-col gap-3 border-t border-white/5">
                <div className="flex flex-col gap-1.5 pt-3">
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-[2px]">
                    SUGGESTED_TAGS
                  </label>
                  <input
                    type="text"
                    name="suggested_tags"
                    value={form.suggested_tags}
                    onChange={handleChange}
                    placeholder="saas, b2b, api (comma separated)"
                    className="w-full bg-surface-container-lowest border border-white/5 text-secondary text-[11px] px-3 py-2 font-mono placeholder:text-on-surface-variant/30 focus:outline-none focus:border-[#00FF9C]/40"
                  />
                  {errors.suggested_tags && (
                    <span className="text-[9px] text-error">{errors.suggested_tags}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-[2px]">
                    SUGGESTED_TECH_STACK
                  </label>
                  <input
                    type="text"
                    name="suggested_tech_stack"
                    value={form.suggested_tech_stack}
                    onChange={handleChange}
                    placeholder="next-js, supabase, stripe (comma separated)"
                    className="w-full bg-surface-container-lowest border border-white/5 text-secondary text-[11px] px-3 py-2 font-mono placeholder:text-on-surface-variant/30 focus:outline-none focus:border-[#00FF9C]/40"
                  />
                  {errors.suggested_tech_stack && (
                    <span className="text-[9px] text-error">{errors.suggested_tech_stack}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Global error */}
          {errors.global && (
            <div className="text-[10px] text-error border border-error/20 bg-error/5 px-3 py-2">
              {errors.global}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-10 bg-[#00FF9C] text-black font-black uppercase tracking-widest text-[11px] hover:bg-primary-container transition-colors disabled:opacity-50"
          >
            {submitting ? 'SUBMITTING...' : 'SUBMIT_FORK'}
          </button>

          <div className="text-[9px] text-on-surface-variant/25 text-center uppercase tracking-widest">
            NO_ACCOUNT_REQUIRED
          </div>
        </form>
      </div>
    </div>
  );
}
