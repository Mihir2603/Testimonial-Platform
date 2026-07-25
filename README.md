# PraiseWall — Testimonial Platform

A small testimonial platform where businesses collect customer reviews, moderate them, and display approved ones on a public wall or embedded widget.

## What's done

### P0 — Core loop (complete)
- **Submit form** (`/submit`) — name, email, company, testimonial text, star rating, optional photo
- **Backend API** — Express + SQLite, persists all submissions
- **Moderation dashboard** (`/dashboard`) — list submissions, approve/reject actions, filter by status
- **Public wall** (`/` or `/wall`) — shows approved testimonials only; rejected never appear

### P1 — Embeddable widget (complete)
- **Script-tag widget** (`embed/widget.js`) — loads approved testimonials on any external site
- **Demo page** (`embed/demo.html`) — third-party HTML page proving the embed works
- **Customization** — `data-accent`, `data-layout` (grid/list), `data-api`, `data-container`
- **Duplicate/junk filtering** — rejects spam patterns and duplicate submissions within 24h
- **Pagination** — dashboard paginated; wall has "Load more" lazy loading
- **Empty, loading, and error states** — throughout all pages and the widget

### P2 — Partially done
- **AI-powered sentiment/summary** — optional Groq API support via `GROQ_API_KEY`, with a heuristic fallback
- **Live deployment** — not done

## Tech stack

| Layer    | Choice                          |
|----------|---------------------------------|
| Frontend | React 19 + Vite + React Router  |
| Backend  | Node.js + Express               |
| Database | SQLite (better-sqlite3)         |
| Widget   | Vanilla JS script tag           |

## Prerequisites

- Node.js 18+

## Setup & run

```bash
# From project root (E:\Projects\testimonial-platform)
npm install
npm run install:all
npm run dev
```

This starts:
- **API** at http://localhost:3001
- **Frontend** at http://localhost:5173

## Test the core flow

1. Open http://localhost:5173/submit — submit a testimonial
2. Open http://localhost:5173/dashboard — see it as **pending**
3. Click **Approve**
4. Open http://localhost:5173/wall — see it on the public wall

## Embed widget demo

With the server running, open `embed/demo.html` in a browser (or visit http://localhost:3001/embed/demo.html).

For a production-style preview, build the client and set `VITE_API_URL` if the API is not running at `http://localhost:3001`.

Embed on any site:

```html
<div id="praisewall-widget"></div>
<script
  src="http://localhost:3001/embed/widget.js"
  data-api="http://localhost:3001"
  data-accent="#6366f1"
  data-layout="grid"
  data-container="praisewall-widget"
></script>
```

## API endpoints

| Method | Path                        | Description                    |
|--------|-----------------------------|--------------------------------|
| POST   | `/api/testimonials`         | Submit a testimonial           |
| GET    | `/api/testimonials`         | List all (filter by `status`)  |
| GET    | `/api/testimonials/approved`| Approved only (wall + widget)  |
| PATCH  | `/api/testimonials/:id`     | Approve or reject              |
| GET    | `/api/health`               | Health check                   |

## Project structure

```
testimonial-platform/
├── client/          React frontend
├── server/          Express API + SQLite
├── embed/           Widget script + demo HTML
├── AGENTS.md        Agent steering notes
├── JOURNAL.md       Build journal
└── README.md
```

## Agent setup

See `AGENTS.md` and `.cursor/rules/` — these files guided the Cursor agent during development.
