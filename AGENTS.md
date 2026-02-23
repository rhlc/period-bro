# Repository Guidelines

## Project Structure & Module Organization
This repository is a lightweight client-side PWA with no backend or bundler.

- `index.html`: App shell and all UI sections (setup, dashboard, settings modal).
- `js/app.js`: Core behavior (cycle calculations, rendering, localStorage persistence, event handlers).
- `css/style.css`: Global styles, theme variables, component styling, and animations.
- `manifest.json`: PWA metadata (name, icons, display mode).
- `sw.js`: Service worker for offline caching.

Keep new code in these same layers: markup in `index.html`, logic in `js/`, and presentation in `css/`.

## Build, Test, and Development Commands
No build step is required.

- `python3 -m http.server 8000`: Run locally at `http://localhost:8000`.
- `npx serve .` (optional): Alternative static server.
- `python3 -m http.server 8000 --bind 127.0.0.1`: Useful when testing PWA behavior in a clean browser profile.

After changes to `sw.js`, hard-refresh or clear site data to avoid stale cache behavior.

## Coding Style & Naming Conventions
- Use 2-space indentation in HTML, CSS, and JavaScript.
- Prefer `const`/`let`; avoid `var`.
- Use `camelCase` for JS identifiers (`getCycleInfo`, `setupDateInput`).
- Use descriptive IDs/classes in kebab-case for DOM/CSS (`#cycle-length-display`, `.tip-card`).
- Keep functions small and single-purpose; colocate helper functions near related logic.

## Testing Guidelines
There is no automated test suite yet. Use manual verification before opening a PR:

1. Start with no saved data and complete first-run setup.
2. Validate `dd/mm/yyyy` input formatting and rejection of invalid/future dates.
3. Verify cycle phase rendering and progress bar updates across several cycle lengths.
4. Confirm settings edit/reset flows and persistence via reload.
5. Check install/offline behavior after service worker updates.

## Commit & Pull Request Guidelines
Follow existing commit style: short, imperative subject lines (e.g., `Fix date input styling`, `Change date input format to dd/mm/yyyy`).

- Keep commits focused to one concern.
- PRs should include: summary, test steps performed, and screenshots/GIFs for UI changes.
- Link related issues/tasks when applicable.
- Call out any PWA/cache-impacting changes explicitly (especially `sw.js` and `manifest.json`).
