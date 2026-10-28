# Local development

Setup, configuration, build, and verification instructions for the web app.

## Prerequisites

- Node.js 22 and npm
- A running [Clip Insights backend](https://github.com/Clip-Insights/backend) (local or deployed) to point `VITE_API_URL` at

## Setup

```bash
git clone https://github.com/Clip-Insights/web-app.git
cd web-app
npm ci
```

Create `.env.local` with a public Google OAuth client ID for local sign-in. For production builds, set both variables below; `.env.production.local` can hold local build configuration without changing the committed placeholders.

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Production backend base URL, without `/api` or a trailing slash. Development uses `http://localhost:8000`. |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth **Web application** client ID for Google sign-in |

Vite embeds these values in the browser bundle. Use public configuration only; backend credentials belong on the server. See [Architecture](../ARCHITECTURE.md) for session handling and API configuration.

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

**Conventions worth knowing** (full list in [AGENTS.md](../AGENTS.md)):

- API URLs are constructed by `getApiUrl` in `src/services/apiService.js`; authenticated requests use `AuthContext.authRequest`.
- Auth is centralized in `src/context/AuthContext.jsx` — read auth state/actions from it; don't duplicate token logic.
- Style with Tailwind utilities and the theme tokens in `tailwind.config.js`; avoid ad-hoc CSS files.
- Surface API errors via `react-toastify` — never fail silently, never use `alert()`.

## Build output

The app builds to a static SPA in `dist/`. The included `vercel.json` rewrites routes to `index.html` for client-side deep links. Build-time configuration supplies `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID`.

```bash
npm run build    # outputs a static bundle to dist/
```

