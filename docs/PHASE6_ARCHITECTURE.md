# Phase 6 architecture and rollout

## Available now

- Local workspaces isolate tasks, projects, goals, habits, notes, time entries, and activity. Version 3 of the existing persisted store migrates prior data into Personal. The active workspace can be switched or deleted; deleting the last workspace is blocked.
- The local scheduling engine creates seven-day suggestions using priority, deadline, working hours, one break, and existing timed tasks. The user chooses suggestions before applying. It reports existing overlaps and tasks that do not fit.
- The assistant page shows deterministic facts derived from current workspace data. `AIProvider` is a server integration boundary; the shipped provider is explicitly unconfigured and does not answer questions or generate AI summaries.
- `CalendarProvider` defines OAuth and sync operations. No provider is connected. Settings also supports local `.ics` export and reviewed import for all-day and UTC events; unsupported time zone formats are skipped.

## Backend boundary

The `src/prisma/contract.prisma` file is a proposed Prisma ORM 8 PostgreSQL data contract. It is not active. The app has no database URL, Prisma client, or auth credentials. `src/server/contracts.ts` outlines auth and repository contracts. Before activating them:

1. Install Prisma ORM 8 and the PostgreSQL provider packages, configure `DATABASE_URL` only on the server, and emit the contract.
2. Plan and review the initial migration with Prisma before applying it. Do not run a migration against a user database until the data transfer plan is tested.
3. Implement server-side validation for all mutations, a password hashing library, session rotation and revocation, and OAuth account linking. Every repository call must verify workspace membership server-side. Client workspace switching is a local organizational feature, not a security boundary.
4. Build an explicit local-to-server import flow with conflict resolution and backups. Keep existing local data until the user verifies the migrated account.
5. Implement Google and Microsoft OAuth with PKCE and state checks. Encrypt refresh tokens at rest on the server. Request narrow scopes and keep provider secrets outside client bundles. Add sync cursors, idempotent upserts, cancellation handling, and conflict review before applying remote changes.
6. Add a server AI provider only after credentials and user consent are available. Send a minimized, authorized workspace snapshot, validate structured output, and label generated responses separately from local facts.

No authentication, PostgreSQL persistence, external calendar sync, or AI model call is currently enabled.

## API proposal

`/api/v1/workspaces` and `/api/v1/workspaces/:id` for workspace management; nested `/tasks`, `/projects`, `/goals`, `/habits`, `/notes`, and `/time-entries` for scoped CRUD; `/calendar-connections/:provider/start` and `/callback` for OAuth; `/calendar-events/sync` for explicit sync; `/assistant/query` for a consented provider-backed response. Every endpoint requires a verified session and workspace membership check, and uses schema validation before writes. Errors use a stable `{code, message}` envelope and appropriate HTTP status.
