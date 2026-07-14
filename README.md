# Clip Insights — Web App

React + Vite web app for [Clip Insights](https://github.com/Clip-Insights): the account dashboard where users sign in and manage the PDFs they export from the browser extension. It talks to the same [Clip Insights backend](https://github.com/Clip-Insights/backend) as the extension.

> For contributor standards, coding conventions, and a fuller project overview, see **[AGENTS.md](./AGENTS.md)**.

## What it does

- **Auth** — email/password login and signup, Google sign-in, email verification, and password reset, all against the backend's `/api/account/` endpoints.
- **Dashboard** — storage usage and account overview with gauge/widget visualizations.
- **Files & folders** — browse, search, rename, move, and delete the PDFs exported from the extension; organize them into folders. Backed by the backend's S3-backed file storage.
- **Plans / pricing** — view plan tiers and storage quotas.
- **Static pages** — marketing / informational content.

## Tech stack

- **React 18 + Vite**, JavaScript/JSX (not TypeScript)
- **TailwindCSS** for styling
- **react-router-dom** for routing
- **axios** through a single API client in `src/services/apiService.js`
- **@react-oauth/google** + `crypto-js` for auth and token handling
- **react-toastify** (notifications), **lucide-react** (icons), **react-d3-speedometer** / **react-spinners** (dashboard widgets)
- **ESLint** for linting (no test framework configured yet — see [AGENTS.md](./AGENTS.md))

## Prerequisites

- Node.js 18+ and npm
- A running [Clip Insights backend](https://github.com/Clip-Insights/backend) (local or deployed) to point `VITE_API_URL` at

## Setup

```bash
npm install
```

Create a `.env` file (a `.env.production` is used for production builds):

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the Clip Insights backend API |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth **Web application** client ID for Google sign-in |

Config is read via `import.meta.env` — never hard-code the API URL or secrets.

## Commands

```bash
npm run dev      # Vite dev server (http://localhost:5173)
npm run build    # production build -> dist/
npm run preview  # preview the production build locally
npm run lint     # ESLint over the project
```

## Project structure

```
src/
  pages/        # route screens: Dashboard, Files, Folders, Login, Signup,
                # ResetPassword, VerifyEmail, Pricing, Static
  components/    # reusable UI grouped by area (Cards, Dashboard, Header, Navbar, Sidebar, Loader)
  layouts/       # page shells (with / without navbar)
  context/       # React context providers (AuthContext)
  services/      # apiService.js (axios client + endpoints) and helpers
  routes/        # routes.jsx
  utils/         # route metadata and helpers
```

**Conventions worth knowing** (full list in [AGENTS.md](./AGENTS.md)):

- All HTTP goes through `src/services/apiService.js` — don't call `axios` directly from components.
- Auth is centralized in `src/context/AuthContext.jsx` — read auth state/actions from it; don't duplicate token logic.
- Style with Tailwind utilities and the theme tokens in `tailwind.config.js`; avoid ad-hoc CSS files.
- Surface API errors via `react-toastify` — never fail silently, never use `alert()`.

## Deployment

The app is a static SPA and deploys to **Vercel**. `vercel.json` rewrites all routes to `index.html` so client-side routing works on deep links. Set `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID` as project environment variables in Vercel.

```bash
npm run build    # outputs a static bundle to dist/
```

## Related repositories

- **[backend](https://github.com/Clip-Insights/backend)** — the Django REST API this app calls
- **[chrome-extension](https://github.com/Clip-Insights/chrome-extension)** — the browser extension that exports the PDFs managed here
