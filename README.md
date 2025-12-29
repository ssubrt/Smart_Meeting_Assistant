This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Planning for V2.0 (Adding new Features)
Plan: Smart Meeting Assistant v2.0 Upgrade
Your Phase 1 is solid - you have a working video meeting app with real-time transcription. Your proposed features absolutely make sense and align perfectly with production requirements. Here's a comprehensive roadmap:

Phase 2 Core Features (Recommended Order)
 - Authentication System - Add NextAuth.js with Google OAuth, protect routes with middleware, create user sessions with JWT
- Dynamic Meeting Creation - Replace hardcoded CALL_ID with UUID-based meeting IDs, add "Create Meeting" and "Join Meeting" flows
- Database Schema - Set up PostgreSQL/MongoDB with tables for users, meetings, transcripts, participants
- Redis for Real-time Cache - Store active meeting transcripts in Redis with TTL, flush to database on meeting end
- API Routes Expansion - Add /meetings, /transcripts, users endpoints with proper validation
- Meeting Invite System - Generate shareable links, add copy-to-clipboard, show active participants

Redis vs Kafka Decision
Use REDIS for your use case because:

✅ Perfect for real-time transcript buffering with LPUSH/RPUSH
✅ Simple pub/sub for live transcript updates across tabs
✅ TTL-based expiry (auto-delete after meeting ends)
✅ Much simpler setup than Kafka
✅ Lower latency for read-heavy operations
Skip Kafka - it's overkill unless you need:

Event sourcing with replay
Processing millions of events/sec
Complex stream processing pipelines
Multi-consumer distributed systems


Architecture:
Meeting Active → Redis (live buffer) → On Meeting End → PostgreSQL (permanent storage)

Further Considerations
Authentication Provider? NextAuth.js supports Google, GitHub, Email. Want multiple providers or Google-only?
Database Choice? PostgreSQL (relational, JSON support) or MongoDB (flexible schema)? PostgreSQL recommended for meeting history queries.
Meeting Permissions? Host/co-host/participant roles with different controls (kick, mute all, end meeting)?
AI Features Priority? Meeting summaries, action items extraction, or Q&A bot first?
Recording Storage? Store video recordings in S3/Cloudflare R2 alongside transcripts?
Your plan is spot-on - the features you mentioned are exactly what production meeting apps need. Focus on auth → dynamic meetings → persistence first, then layer on AI features.