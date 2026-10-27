# Clip Insights · Web app

The account and document dashboard for [Clip Insights](https://github.com/Clip-Insights). Sign in, find the PDFs saved from your video study sessions, organize them into folders, and track your storage and plan usage.

[Open web app](https://app.clipinsights.org) · [Website](https://clipinsights.org) · [Architecture](./ARCHITECTURE.md) · [System overview](https://github.com/Clip-Insights/.github/blob/main/docs/ARCHITECTURE.md)

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
- **axios** and the Fetch API for backend requests; URL helpers in `src/services/apiService.js`
- **@react-oauth/google** + `crypto-js` for auth and token handling
- **react-toastify** (notifications), **lucide-react** (icons), **react-d3-speedometer** / **react-spinners** (dashboard widgets)
- **ESLint** for linting (no test framework configured yet — see [AGENTS.md](./AGENTS.md))

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

Vite embeds these values in the browser bundle. Use public configuration only; backend credentials belong on the server. See [Architecture](./ARCHITECTURE.md) for session handling and API configuration.

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

- API URLs are constructed by `getApiUrl` in `src/services/apiService.js`; authenticated requests use `AuthContext.authRequest`.
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
- **[main-site](https://github.com/Clip-Insights/main-site)** — the public website and product guides

Contributor standards are in [AGENTS.md](./AGENTS.md).
