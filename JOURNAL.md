# JOURNAL.md - Decision Journal

## 1. Prioritization

- Built the P0 loop first: submit form -> persisted API record -> dashboard approve/reject -> public wall showing only approved testimonials.
- After the core loop worked, added P1 items: script-tag widget, demo HTML page, accent/layout customization, duplicate/junk handling, pagination/lazy loading, and loading/empty/error states.
- Added a small P2 AI-style feature after P0/P1: sentiment and short summary on submit. It uses Groq when `GROQ_API_KEY` is present and falls back to a simple heuristic so the app still works locally.
- Deliberately skipped auth, payments, teams/multi-business logic, and email notifications because the brief names them as non-goals.
- Skipped live deployment for now because local P0/P1 completeness mattered more than hosting polish.

## 2. Key Decisions

### Decision: Use SQLite for persistence

- **Options:** SQLite, Postgres/MySQL, Supabase/Neon/MongoDB.
- **Why:** SQLite keeps the reviewer's setup simple and is enough for a single-business take-home app.

### Decision: Use an open dashboard

- **Options:** no auth, hardcoded password, full auth.
- **Why:** The brief explicitly says no authentication is needed, so `/dashboard` is intentionally open.

### Decision: Keep one business and one wall

- **Options:** single business, multi-tenant businesses, user/team accounts.
- **Why:** Multi-tenant logic would add schema and UI complexity without helping the required test flow.

### Decision: Use a script-tag widget

- **Options:** script tag or iframe.
- **Why:** A script tag is lightweight, easy to customize with `data-*` attributes, and the plain HTML demo proves it works outside the React app.

### Decision: Handle junk and duplicates in the API

- **Options:** frontend-only validation, API checks, moderation-only cleanup.
- **Why:** The API is the durable boundary. It rejects obvious junk text and duplicate email/text submissions within 24 hours before they enter moderation.

### Decision: Sentiment feature degrades gracefully

- **Options:** require a model API key, skip AI entirely, or provide a fallback.
- **Why:** Requiring a key would make local review fragile. The fallback keeps the product usable while still allowing a real model path through Groq.

## 3. Working With AI Agents

- **Tools and models used:** Cursor Composer with Claude for the first build; Codex/GPT-5 for this follow-up audit, documentation cleanup, and verification.
- **How you split the work:** I gave the agent the full assignment and project constraints, then reviewed the structure against P0/P1. I kept prioritization, requirement checking, and final verification as explicit human review points.
- **Your agent setup:** `AGENTS.md` captures repo rules: P0 first, ES modules, camelCase API JSON, snake_case DB columns, no auth, no multi-tenant. `.cursor/rules/project.mdc` mirrors the same rules for Cursor.
- **Important prompt 1:** Full assignment brief. It worked because it gave the agent evaluation order and non-goals.
- **Important prompt 2:** "not in c make it in d or e drive". It worked because it corrected the workspace location early.
- **Important prompt 3:** "check this is completed or not if completed then build and run". This forced a requirement audit instead of only trusting the existing README.
- **AI was wrong:** The README said P2 AI was not done, but the server actually had Groq/heuristic sentiment code. I noticed by reading `server/src/services/sentiment.js` and updated the docs.
- **Something you rejected:** I rewrote the earlier journal shape instead of leaving broad polished claims, because the provided template asks for direct decision and verification notes.

## 4. Verification

- Checked the brief against the implementation files:
  - submit form: `client/src/pages/SubmitPage.jsx`
  - dashboard moderation: `client/src/pages/DashboardPage.jsx`
  - public wall: `client/src/pages/WallPage.jsx`
  - API routes: `server/src/routes/testimonials.js`
  - database setup: `server/src/db.js`
  - widget/demo: `embed/widget.js`, `embed/demo.html`
- Ran on July 25, 2026:
  - `npm.cmd run build --prefix client` - passed.
  - Started the API server at `http://localhost:3001`.
  - `npm.cmd run test:flow` - passed. It verified health check, submit, pending dashboard listing, approve, public wall visibility, and junk rejection.
- Still fragile:
  - Dashboard is open by design.
  - Uploaded files are not removed when a testimonial is rejected.
  - SQLite is fine for this take-home but not high-concurrency production storage.
  - Live deployment is not complete.

## 5. If I Had 5 More Hours

1. Deploy API and frontend on free hosts and document the live URLs.
2. Add focused API integration tests that create, approve, reject, and list testimonials in an isolated test database.
3. Add a seed script for demo data.
4. Improve image handling with resizing and cleanup for rejected/deleted submissions.
5. Polish widget pagination or a "load more" option for large walls.
