# Carvv

**Turn any question, link, or topic into a swipeable, on-brand carousel story.** Carvv is an AI research-to-carousel studio: it researches a subject in real time, drafts an editorial storyline, lays it out across beautiful slide templates, and lets you style, edit, and share the result, all from a mobile-first interface.

This repository is a pixel-faithful React implementation of the original Carvv product mockup, wired to a real backend, real AI, and real data fetching.

---

## Screens

Every screen below is captured from the implemented design and shipped in this repo under [`docs/screenshots/`](docs/screenshots/).

| Splash | Onboarding | Auth |
| --- | --- | --- |
| ![Splash](docs/screenshots/splash.svg) | ![Onboarding](docs/screenshots/onboarding.svg) | ![Auth](docs/screenshots/auth.svg) |

| Create | Generating | Storyboard |
| --- | --- | --- |
| ![Create](docs/screenshots/create.svg) | ![Generating](docs/screenshots/generating.svg) | ![Storyboard](docs/screenshots/storyboard.svg) |

| Viewer | Editor | Feed |
| --- | --- | --- |
| ![Viewer](docs/screenshots/viewer.svg) | ![Editor](docs/screenshots/editor.svg) | ![Feed](docs/screenshots/feed.svg) |

| Studio | Palette Studio |
| --- | --- |
| ![Studio](docs/screenshots/studio.svg) | ![Palette Studio](docs/screenshots/palette-studio.svg) |

---

## Features

- **Prompt-to-story pipeline**: type a topic or paste a link; Carvv scrapes the source, asks the AI for a structured storyline, and renders it as a staged, animated generation sequence.
- **Storyboard editor**: reorder, restyle, and rewrite slides across multiple layout templates.
- **Carousel viewer**: swipeable, presentation-style playback of the finished story.
- **Brand studio**: palettes, typography, and brand presets applied consistently across every slide.
- **Library & feed**: every project is saved to your account and synced across devices.
- **Real authentication**: email + password with a 6-digit email verification code, plus anonymous guest sessions.
- **Cloud sync**: projects, profiles, and assets persist in Appwrite TablesDB with row-level security.
- **Graceful offline/demo mode**: with no backend configured, the app runs in a fully functional local demo mode, pixel-identical to the live experience.

## Tech Stack

| Layer | Technology |
| --- | --- |
| UI | React 18 + Vite, hand-rolled CSS design system (no UI framework) |
| Backend platform | Appwrite (auth, session management, TablesDB database) |
| AI | OpenRouter, model `nvidia/nemotron-3-ultra-550b-a55b:free` |
| Scraping / data fetching | Cheerio-based server-side fetcher (`GET /api/scrape`) |
| Server | Node.js + Express (AI proxy, scraper, static hosting) |

## Project Structure

```
the-carvv-app/
├── index.html
├── package.json
├── vite.config.js          # dev server + /api proxy to the Express server
├── server/
│   └── index.js            # Express: /api/ai/story, /api/scrape, static serving
├── src/
│   ├── main.jsx            # React entry
│   ├── App.jsx             # router / screen orchestration
│   ├── styles.css          # full design system (tokens, components, motion)
│   ├── assets/             # photography bundled as data-URI modules
│   ├── data/               # templates, seed projects, asset registry
│   ├── lib/                # tokens, theme, icons, UI primitives, store, appwrite
│   │   ├── appwrite.js     # auth + cloud sync layer
│   │   └── store.jsx       # session restore, hydration, debounced sync
│   ├── screens/            # boot, onboarding/auth, create, viewer, editor,
│   │                       # library, studio, share, settings
│   ├── services/
│   │   ├── ai.js           # OpenRouter client + story normalizer
│   │   └── pipeline.js     # scrape → AI → normalize pipeline with staged UI
│   └── slides/             # slide template renderer
└── docs/screenshots/       # every screen of the implemented design
```

## Getting Started

### Prerequisites

- Node.js 18+
- An [Appwrite](https://appwrite.io) project (cloud or self-hosted)
- An [OpenRouter](https://openrouter.ai) API key

### Installation

```bash
git clone https://github.com/KoushikNavuluri/the-carvv-app.git
cd the-carvv-app
npm install
```

### Environment Variables

Copy the example file and fill in your values. **Never commit real keys.**

```bash
cp .env.example .env
```

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_APPWRITE_ENDPOINT` | client | Appwrite API endpoint (e.g. `https://nyc.cloud.appwrite.io/v1`) |
| `VITE_APPWRITE_PROJECT_ID` | client | Appwrite project ID (`carvv`) |
| `OPENROUTER_API_KEY` | server only | OpenRouter key, used exclusively by the Express proxy |
| `OPENROUTER_MODEL` | server | Defaults to `nvidia/nemotron-3-ultra-550b-a55b:free` |
| `PORT` | server | API server port (default `8787`) |

### Run Locally

```bash
# terminal 1: API + AI proxy + scraper on :8787
npm run dev:api

# terminal 2: Vite dev server (proxies /api to :8787)
pm run dev
```

Open the printed local URL. The app is designed mobile-first, so a narrow viewport (or device emulation) shows it at its best.

### Production

```bash
npm run build     # outputs static bundle to dist/
npm start         # Express serves dist/ plus the /api routes
```

Deploy the Node server anywhere that runs long-lived Node (Render, Railway, Fly.io, a VPS). For static-only hosts, deploy `dist/` and run `server/index.js` separately, pointing `VITE_API_URL` at it.

## Appwrite Configuration

The app expects an Appwrite project named **`carvv`** with:

1. **Auth**: Email/password enabled. Sign-up creates the account, then a 6-digit email token (`createEmailToken`) powers the verification screen; anonymous sessions power guest mode.
2. **Database**: a TablesDB database `carvv-db` with three tables, all using row-level security and `create("users")` permission:
   - `projects`: one row per carousel project (title, topic, template, palette, status, timestamps, plus a `payload` text column holding the full project JSON). Indexed by user.
   - `profiles`: per-user brand settings, preferences, and palette (unique per user).
   - `assets`: per-user uploaded/generated asset metadata. Indexed by user.
3. **Platforms**: register your web origin (e.g. `http://localhost:5173`) so the web SDK is allowed to call the API.

If the Appwrite env vars are absent, the app automatically runs in demo mode with local state only.

## AI Integration (OpenRouter)

The browser **never** sees the OpenRouter key. All AI calls flow through the Express server:

```
client services/ai.js → POST /api/ai/story → OpenRouter (server-held key)
```

`server/index.js` requests a strictly-structured storyline (title, slides, layout hints, speaker notes) from `nvidia/nemotron-3-ultra-550b-a55b:free`, and `services/ai.js` normalizes the model output into the app's internal story schema. If the model is unreachable, rate-limited, or returns malformed JSON, the pipeline falls back to a local editorial generator so the product always works.

## Data Fetching & Scraping Architecture

Real-time source material comes from a server-side scraping endpoint:

- `GET /api/scrape?url=…` fetches the target page with a browser-like User-Agent.
- **Cheerio** parses the HTML and extracts structured content: title, headings, paragraphs, and lead images/media.
- Safety rails: response size caps, timeouts, and a host allowlist/SSRF guard (no localhost/private-network targets).
- The scraped extract feeds the AI storyline prompt, grounding generated stories in the actual source.

The pipeline (`services/pipeline.js`) coordinates the staged "researching → outlining → designing" UI with the async scrape + AI work, so the generation screen stays truthful about what is happening.

## Design Fidelity

This implementation reproduces the supplied mockup exactly: spacing, typography, color tokens, sizing, positioning, components, interaction states, and responsive behavior. The screens above are the reference and the target. If anything ever drifts, treat the screens in `docs/screenshots/` as the source of truth and open an issue.

## License

MIT
