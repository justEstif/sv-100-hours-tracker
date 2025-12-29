# 1. Initial Architecture

Date: 2024-12-25
Status: accepted

## Context

Building a tracker for long-term skill commitments (100 hours per pursuit). Need a simple, deployable stack that supports time logging, reflections, and optional AI analysis.

## Decision

**Stack:**

- SvelteKit web app with SQLite storage
- Deployed on Dokku via git-push
- LLM API (OpenCode using Gemini) for on-demand reflection analysis

**Data model:**

- Commitments: title, category, goal hours
- Time Logs: commitment_id, duration, date, reflection text
- Milestones: commitment_id, hours_threshold, user_synthesis, ai_feedback

**MVP scope:**

1. Add/edit commitments (max 4 active)
2. Log time with required reflection
3. Progress dashboard (hours logged, recent reflections)
4. Milestone prompts at 25/50/75/100 hours
5. "What am I missing?" AI analysis button

**Deferred:** Mobile app, social features, integrations, automated AI prompts.

## Consequences

- SQLite keeps deployment simple but limits concurrent writes
- Max 4 commitments enforces focus (core product philosophy)
- On-demand AI avoids complexity of background processing
- Dokku deployment means single-server, but sufficient for MVP scale
