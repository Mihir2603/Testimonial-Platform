# Agent Instructions — PraiseWall

## Project context

This is an SDE-1 take-home assignment: a testimonial platform with submit → moderate → display flow.

## Stack

- **Frontend:** React (Vite) in `client/`
- **Backend:** Express in `server/`
- **Database:** SQLite via better-sqlite3
- **Widget:** Vanilla JS in `embed/`

## Priority order

Always respect this order when adding features:

1. P0 core loop: submit → dashboard approve → wall display
2. P1: embed widget, customization, junk/duplicate handling, states
3. P2: AI feature, deployment

## Conventions

- Use ES modules (`"type": "module"`)
- API returns camelCase JSON (`photoUrl`, `createdAt`)
- DB columns use snake_case (`photo_url`, `created_at`)
- No authentication — dashboard is open
- Single business — no multi-tenant logic
- Keep changes minimal and focused

## Running locally

```bash
npm install && npm run install:all && npm run dev
```

API: http://localhost:3001  
App: http://localhost:5173

## Do not build

- Auth/login
- Payments
- Multi-user/team support
- Email notifications

## File locations

| Concern | Path |
|---------|------|
| API routes | `server/src/routes/testimonials.js` |
| DB setup | `server/src/db.js` |
| React pages | `client/src/pages/` |
| Shared UI | `client/src/components/Shared.jsx` |
| Widget | `embed/widget.js` |
| Demo site | `embed/demo.html` |
