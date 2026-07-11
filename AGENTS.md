# AGENTS.md — Clip Insights Frontend (web app)

**Role:** You are a senior React engineer working on the Clip Insights web app — the account dashboard where users sign in and manage their saved files/folders and storage. You own each task end to end: understand, plan, implement to the standards below, verify, and self-review.

This file is **standards and guidelines**. A short project overview is included because this project has no separate architecture doc.

---

## Tech stack (at a glance)

- **React 18 + Vite**, **JavaScript/JSX** (not TypeScript).
- **TailwindCSS** for styling (`tailwind.config.js`, utility-first; avoid bespoke CSS files).
- **Routing:** `react-router-dom` (`src/routes/routes.jsx`).
- **HTTP:** `axios` through a single client in `src/services/apiService.js` (talks to the Clip Insights backend).
- **Auth:** `src/context/AuthContext.jsx` + `@react-oauth/google`; tokens handled with `crypto-js`.
- **UX:** `react-toastify` for notifications, `lucide-react` icons, `react-spinners`/`react-d3-speedometer` for dashboard widgets.
- **Lint:** ESLint (`eslint.config.js`). **No test framework is configured yet** (see testing rule).

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # production build (must pass before done)
npm run lint     # ESLint over the project (must pass before done)
npm run preview  # preview the production build
```

## Project structure

- `src/pages/*` — route screens (Dashboard, Files, Folders, Login, Signup, ResetPassword, VerifyEmail, Static).
- `src/components/*` — reusable UI grouped by area (Cards, Dashboard, Header, Navbar, Sidebar, Loader).
- `src/layouts/*` — page shells (with/without navbar).
- `src/context/*` — React context providers (auth).
- `src/services/*` — `apiService.js` (axios client + endpoints) and helpers.
- `src/routes/routes.jsx`, `src/utils/routeMeta.js` — routing and per-route metadata.

---

## Workflow for every change

1. **Discover** — read the relevant page/component/service and match existing patterns.
2. **Plan** — keep the change small and consistent with the structure above.
3. **Implement** — follow the coding standards.
4. **Verify** — run `npm run lint` and `npm run build`; manually click through the affected screens.
5. **Self-review** — re-read the diff and check the anti-patterns.

## Coding standards

- **All HTTP goes through `src/services/apiService.js`.** Don't call `axios` directly from components; add/extend a service function and keep the base URL/auth handling centralized.
- **Logic in hooks/context, presentation in components.** Keep components focused; lift shared state to context.
- **Auth is centralized** in `AuthContext` — read auth state/actions from it; never duplicate token logic in components.
- **Style with Tailwind utilities**; reuse the theme tokens in `tailwind.config.js` rather than hard-coded hex values. Keep class lists readable.
- **User feedback via `react-toastify`** — no `alert()`. Handle and surface API errors; never fail silently.
- **Config via `import.meta.env`** (`.env.production` exists); never hard-code secrets or commit real credentials.
- **Accessibility & responsiveness** — semantic elements, keyboard-focusable controls, layouts that work down to mobile widths.
- **Comments explain *why*, not *what*.** No commented-out code or leftover `TODO`s.

### Critical anti-patterns (do not do these)

- Calling `axios`/`fetch` directly inside components instead of `apiService`.
- Duplicating auth/token logic outside `AuthContext`.
- Hard-coding API URLs or secrets.
- Introducing ad-hoc CSS files when a Tailwind utility exists.
- Swallowing API errors with no user-visible feedback.

---

## Testing rule (mandatory)

**When you add or change functionality you must (a) verify existing behaviour still works, and (b) cover the new/changed behaviour with a test.** A change is not done until it is verified.

- This project has **no automated test setup yet.** When you introduce non-trivial, testable logic (services, utilities, context reducers), set up **Vitest + React Testing Library** and add tests alongside the code, then keep that suite green going forward.
- Until then, the minimum bar for every change is: `npm run lint` clean, `npm run build` succeeds, and a **manual click-through** of the affected screens (including the error and empty states).
- Test behaviour, not implementation; mock network calls so tests stay fast and offline.
