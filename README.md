# IdeaTerminal

A terminal-inspired idea archive that automatically turns AI conversations into structured public posts.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-database-3ECF8E?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)

---

## What It Does

Most ideas die in chat windows. IdeaTerminal captures them.

The flow: have a conversation about a business, product, or workflow idea in Claude or ChatGPT. Trigger a skill that summarizes and structures the conversation. That structured payload gets sent to a Make.com pipeline, which enriches the data, generates a hero image, and writes a finished post to Supabase. The frontend reads those posts and displays them in a dark terminal / hacker OS aesthetic.

Each post is a structured idea log -- not a blog post. It includes a raw transcript of the original idea, an AI reality check, risk analysis, MVP framing, a verdict (GENIUS / MAYBE / COOKED), and a score.

---

## Architecture

```
Claude/ChatGPT conversation
        │
        ▼
  Claude Skill (conversation summarizer)
        │
        ▼
  Make.com scenario
  ├── title cleanup + slug generation
  ├── image prompt generation
  ├── hero image generation (AI)
  └── upload to Supabase Storage
        │
        ▼
  Supabase (PostgreSQL + Storage)
        │
        ▼
  Next.js frontend (this repo)
```

---

## Pages

| Route | Description |
|---|---|
| `/` | Live feed of published idea posts |
| `/post/[slug]` | Deep dive -- full analysis of a single idea |
| `/archive` | Dense table view of all posts |

---

## Post Structure

Every idea is parsed into the following fields:

| Field | Description |
|---|---|
| `title` | Cleaned idea title |
| `slug` | URL-safe identifier |
| `raw_input` | Original idea as submitted |
| `clean_summary` | Condensed version |
| `core_idea` | Single-sentence distillation |
| `why_it_might_work` | Bullish case |
| `why_it_might_fail` | Risk analysis |
| `mvp` | Minimum viable version |
| `verdict` | `GENIUS` / `MAYBE` / `COOKED` |
| `score` | Numeric 0-10 (decimals allowed) |
| `tags` | Category tags (jsonb array) |
| `tone` | Tone of the original conversation |
| `image_url` | Hero image from Supabase Storage |

---

## Tech Stack

- **Framework**: Next.js 15 (App Router) deployed on Vercel
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (`post-images` bucket)
- **Automation**: Make.com
- **Styling**: Tailwind CSS
- **Font**: JetBrains Mono
- **Language**: TypeScript

---

## Local Development

### Prerequisites

- Node.js 18+
- A Supabase project with the posts schema applied
- A Make.com scenario wired to your Supabase project

### Setup

```bash
git clone https://github.com/dmipatriot/IdeaTerminal.git
cd IdeaTerminal
npm install
```

Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database Schema

```sql
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source_platform text not null default 'claude',
  conversation_type text,
  title text not null,
  slug text not null unique,
  raw_input text not null,
  clean_summary text,
  core_idea text,
  why_it_might_work text,
  why_it_might_fail text,
  mvp text,
  verdict text not null check (verdict in ('GENIUS', 'MAYBE', 'COOKED')),
  score numeric(3,1) not null check (score >= 0 and score <= 10),
  tags jsonb not null default '[]'::jsonb,
  tone text,
  needs_review boolean not null default false,
  review_reason text,
  status text not null default 'draft' check (status in ('draft', 'ready', 'published', 'review', 'error')),
  image_url text,
  image_prompt text,
  image_style text,
  published_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);
```

Storage bucket: `post-images` (public). Images stored as `{slug}.png`.

Frontend queries posts where `status = 'published'` only.

---

## Design System

The UI is built around a terminal OS aesthetic -- black backgrounds, `#00FF9C` green as the primary accent, JetBrains Mono throughout, zero border radius, and a persistent scanline overlay. It should feel like a system processing ideas, not a blog.

Verdict colors: green for GENIUS, red for COOKED, gray for MAYBE.

---

## Project Status

Active development. Make pipeline and Supabase backend are complete. Frontend in progress.
