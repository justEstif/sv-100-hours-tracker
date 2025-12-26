# 100 Hours Tracker

## Problem

It's easy to sample many interests shallowly but hard to develop genuine depth in any of them. Most productivity tools optimize for task completion or streaks, not sustained engagement over months. Without a system for tracking cumulative investment and reflecting on progress, people abandon pursuits before reaching the point where real understanding and appreciation develop.

## Solution

A focused tracker for long-term skill and knowledge commitments. Users select 3-4 "deep dives" for the year and log focused time against each. The core loop is: log time → write a brief reflection → periodically review your arc. At milestones (25/50/75/100 hours), users write their own synthesis of what's changed in their understanding. An optional AI layer can then surface patterns or gaps the user missed—augmenting self-analysis rather than replacing it.

## Technical Approach

- **Stack**: Web app with a simple backend (Node or Python), SQLite for storage, deployed on Dokku via git-push
- **Core data model**: Commitments (title, category, goal hours), Time Logs (commitment_id, duration, date, reflection text), Milestones (commitment_id, hours_threshold, user_synthesis, ai_feedback if requested)
- **AI integration**: LLM API calls (Claude or similar) triggered on-demand—user clicks "What am I missing?" and the app sends relevant reflections as context, returns observations
- **Notifications**: Cron job for accountability nudges (no AI needed)—if no log in X days, send email via simple SMTP or webhook
- **Frontend**: Minimal UI—dashboard showing hours per commitment, timeline of reflections, milestone prompts. Could be React/Svelte or even server-rendered templates to start

## MVP Scope

For v1, focus on:

1. Add/edit commitments (max 4 active)
2. Log time with required reflection (even one sentence)
3. View progress dashboard (hours logged, recent reflections)
4. Milestone detection + prompt for user synthesis at 25/50/75/100 hours
5. Single AI feature: "What am I missing?" button that analyzes reflections and returns observations

**Out of scope for MVP**: Mobile app, social features, integrations with other tools, automated AI prompts.
