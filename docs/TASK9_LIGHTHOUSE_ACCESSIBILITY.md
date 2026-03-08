# Task 9 — Lighthouse Accessibility Evidence

Date: 2026-03-08

## Goal
Reach Lighthouse Accessibility score **>= 90** for the client app.

## Audit Environment
- App served with production build (`vite build` + `vite preview`)
- URL audited: `http://localhost:4173`
- Tool: Lighthouse CLI (headless Chrome)

## Command Used
```bash
cd client
npm run build
npm run preview -- --port 4173
npx --yes lighthouse http://localhost:4173 \
  --only-categories=accessibility \
  --quiet \
  --chrome-flags='--headless' \
  --output=json \
  --output-path=/tmp/mini-notes-lighthouse-a11y.json
```

## Result
- Accessibility score: **94 / 100** ✅
- Requirement met: **Yes** (`>= 90`)

## Notes
- Lighthouse flagged a remaining color contrast issue on at least one UI element.
- The assignment threshold is satisfied. If desired, contrast can be tuned further in a follow-up pass.
