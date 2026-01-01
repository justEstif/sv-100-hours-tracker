# 100 Hours Tracker

Track long-term skill commitments with reflections and milestone synthesis.

Link: https://sv-100-hours-tracker.estifanos.cc/

## Problem

It's easy to sample many interests shallowly but hard to develop genuine depth. Most productivity tools optimize for task completion or streaks, not sustained engagement over months.

## Solution

A focused tracker for 3-4 annual "deep dives." Log time, write reflections, and synthesize your learning at milestones (25/50/75/100 hours). Optional AI analysis surfaces patterns you might have missed.

## Quick Start

```sh
bun install
bun run dev
```

## Configuration

Copy `.env.example` to `.env` and set your values.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | SQLite database path (e.g., `file:./local.db`) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | No | Google AI API key for AI-powered milestone feedback. Get one at [Google AI Studio](https://aistudio.google.com/apikey). If not set, milestones will be created without AI feedback. |

## Documentation

- [Decisions](docs/decisions/) - Architecture and design choices
