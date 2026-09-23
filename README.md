# Onyxax Cinema

<p align="center">
  <img src="public/AppIcon256.png" alt="Onyxax Cinema" width="128" height="128">
</p>

<p align="center">
  <strong>A cinematic desktop experience for movies, TV series & anime — in one elegant app.</strong><br>
  <em>Built with Electron • React • TypeScript • TMDB • Supabase</em>
</p>

<p align="center">
  <img src="public/preview.png" alt="Onyxax Cinema Preview" width="860">
</p>

<p align="center">
  <a href="https://github.com/onyxax/onyxax-cinema/releases" style="display:inline-block; padding:9px 18px; margin:4px; background:#111827; color:#fff; border-radius:8px; text-decoration:none; font-weight:600; font-size:13px; border:1px solid #1f2937;">Releases</a>
  <a href="https://github.com/onyxax/onyxax-cinema/issues" style="display:inline-block; padding:9px 18px; margin:4px; background:#111827; color:#fff; border-radius:8px; text-decoration:none; font-weight:600; font-size:13px; border:1px solid #1f2937;">Issues</a>
  <a href="#download" style="display:inline-block; padding:9px 18px; margin:4px; background:#d97757; color:#fff; border-radius:8px; text-decoration:none; font-weight:700; font-size:13px; border:1px solid #d97757;">Download</a>
  <a href="#getting-started" style="display:inline-block; padding:9px 18px; margin:4px; background:#fff; color:#111827; border-radius:8px; text-decoration:none; font-weight:600; font-size:13px; border:1px solid #e5e7eb;">For Developers</a>
</p>

---

## <img src="https://api.iconify.design/lucide:list.svg?color=%23d97757" width="18" height="18" style="vertical-align:-4px; display:inline-block"> Quick Navigation

| <img src="https://api.iconify.design/lucide:users.svg?color=%23d97757" width="16" height="16" style="vertical-align:-2px; display:inline-block"> **For Everyone** | <img src="https://api.iconify.design/lucide:code-2.svg?color=%23d97757" width="16" height="16" style="vertical-align:-2px; display:inline-block"> **For Developers** |
| :--- | :--- |
| [Download](#download) — Get the app in 3 clicks | [Getting Started](#getting-started) — Run the code locally |
| [Features](#features) — What you can watch & do | [Project Structure](#project-structure) — How the code is organized |
| [Overview](#overview) — What is Onyxax Cinema? | [Tech Stack](#tech-stack) — What it's built with |

---

<a id="overview"></a>
## <img src="https://api.iconify.design/lucide:book-open.svg?color=%23d97757" width="20" height="20" style="vertical-align:-4px; display:inline-block"> Overview

**Onyxax Cinema** aggregates **movies**, **TV series**, and **anime** into a single, beautifully crafted desktop interface.

> Rich **TMDB** metadata • **Multi-server** playback • Persisted **watch progress** • **Discord Rich Presence**

- **Safety-first** — adult content is filtered by **keywords + TMDB adult flags + AniList verification** before it ever reaches your library.
- **Protected player** — stream URLs are resolved **only in the Electron main process** and delivered to the renderer **AES-256-CBC encrypted**.
- **Polished UX** — cinematic hero, Quick Preview on hover, grid / premium list views, and a collapsible dock.

---

<a id="features"></a>
## <img src="https://api.iconify.design/lucide:sparkles.svg?color=%23d97757" width="20" height="20" style="vertical-align:-4px; display:inline-block"> Features

| <img src="https://api.iconify.design/lucide:layout-grid.svg?color=%23d97757" width="14" height="14" style="vertical-align:-4px; display:inline-block"> | Feature | Details |
| :---: | :--- | :--- |
| <img src="https://api.iconify.design/lucide:film.svg?color=%23d97757" width="16" height="16" style="vertical-align:-4px; display:inline-block"> | **Catalog** | Movies, TV series & anime with posters, ratings, trailers & recommendations via **TMDB API** |
| <img src="https://api.iconify.design/lucide:play.svg?color=%23d97757" width="16" height="16" style="vertical-align:-4px; display:inline-block"> | **Multi-Server Playback** | Multiple providers, **autoplay next episode**, resume from last position |
| <img src="https://api.iconify.design/lucide:shield.svg?color=%23d97757" width="16" height="16" style="vertical-align:-4px; display:inline-block"> | **Safety Filtering** | Keyword blocklist + `adult` flags + **AniList** adult verification for anime |
| <img src="https://api.iconify.design/lucide:globe.svg?color=%23d97757" width="16" height="16" style="vertical-align:-4px; display:inline-block"> | **Localization** | **10 languages** — `ar` `en` `fr` `es` `de` `it` `pt` `ru` `zh` `ja` • Auto `RTL` for Arabic & `Tajawal` font |
| <img src="https://api.iconify.design/lucide:users.svg?color=%23d97757" width="16" height="16" style="vertical-align:-4px; display:inline-block"> | **Accounts & Profiles** | Email/password auth via **Supabase**, avatar upload via **Cloudinary**, personal library |
| <img src="https://api.iconify.design/lucide:gamepad-2.svg?color=%23d97757" width="16" height="16" style="vertical-align:-4px; display:inline-block"> | **Discord Rich Presence** | Live title, `S01E05 • 57% • 19m left`, poster as `large_image`, app logo as permanent `small_image` |
| <img src="https://api.iconify.design/lucide:refresh-cw.svg?color=%23d97757" width="16" height="16" style="vertical-align:-4px; display:inline-block"> | **Automatic Updates** | Checks **GitHub Releases** on startup, downloads & installs **silently or manually** |
| <img src="https://api.iconify.design/lucide:lock.svg?color=%23d97757" width="16" height="16" style="vertical-align:-4px; display:inline-block"> | **Protected Player** | URLs generated in `main.ts`, never exposed in renderer source |
| <img src="https://api.iconify.design/lucide:monitor.svg?color=%23d97757" width="16" height="16" style="vertical-align:-4px; display:inline-block"> | **Designed for Windows** | **NSIS** installer, silent-update support — *Windows 10/11* |

---

<a id="download"></a>
## <img src="https://api.iconify.design/lucide:download.svg?color=%23d97757" width="20" height="20" style="vertical-align:-4px; display:inline-block"> Download

<p align="center">
  <a href="https://github.com/onyxax/onyxax-cinema/releases/latest"><img src="https://img.shields.io/badge/Download%20for%20Windows-1.2.9-111827?style=for-the-badge&labelColor=111827&color=d97757&logo=windows&logoColor=white" alt="Download for Windows"></a>
</p>

**3 steps to watch:**

| Step | What to do | |
| :---: | :--- | :---: |
| **1** | Click the big **Download for Windows** button above | <img src="https://api.iconify.design/lucide:mouse-pointer-click.svg?color=%23d97757" width="16" height="16" style="vertical-align:-4px; display:inline-block"> |
| **2** | Open the downloaded `OnyxaxCinemaSetup1.2.9.exe` and click **Next → Install** | <img src="https://api.iconify.design/lucide:package-open.svg?color=%23d97757" width="16" height="16" style="vertical-align:-4px; display:inline-block"> |
| **3** | Open **Onyxax Cinema** from Desktop/Start and start watching | <img src="https://api.iconify.design/lucide:play.svg?color=%23d97757" width="16" height="16" style="vertical-align:-4px; display:inline-block"> |

- **System:** Windows 10 / 11 (64-bit) — no extra setup.
- **Updates:** The app checks on startup and can update silently — you don't need to do anything.
- **No account needed** to browse; create one only if you want a personal list.

<details>
<summary><strong>Having trouble downloading?</strong> Click to see help</summary>

- If Windows SmartScreen says “Unknown publisher” → Click **More info → Run anyway** (normal for new apps).
- If antivirus blocks it → It's a false positive from the fresh installer — allow it or download from **Releases** page directly.
- Still stuck? Open an [Issue](https://github.com/onyxax/onyxax-cinema/issues) and write in any language — we’ll help.

</details>

---

<a id="tech-stack"></a>
## <img src="https://api.iconify.design/lucide:layers.svg?color=%23d97757" width="20" height="20" style="vertical-align:-4px; display:inline-block"> Tech Stack

| Layer | Technology |
| :--- | :--- |
| <img src="https://api.iconify.design/lucide:monitor.svg?color=%23d97757" width="14" height="14" style="vertical-align:-4px; display:inline-block"> Desktop Shell | **Electron 41** |
| <img src="https://api.iconify.design/lucide:atom.svg?color=%23d97757" width="14" height="14" style="vertical-align:-4px; display:inline-block"> UI | **React 19** + **TypeScript** + **Vite 8** |
| <img src="https://api.iconify.design/lucide:palette.svg?color=%23d97757" width="14" height="14" style="vertical-align:-4px; display:inline-block"> Styling | **Tailwind CSS 4** + CSS variables |
| <img src="https://api.iconify.design/lucide:database.svg?color=%23d97757" width="14" height="14" style="vertical-align:-4px; display:inline-block"> Data | **TMDB API** • **Supabase** (auth) • **Cloudinary** (media) |
| <img src="https://api.iconify.design/lucide:share-2.svg?color=%23d97757" width="14" height="14" style="vertical-align:-4px; display:inline-block"> State | **React Context + Hooks** |
| <img src="https://api.iconify.design/lucide:languages.svg?color=%23d97757" width="14" height="14" style="vertical-align:-4px; display:inline-block"> i18n | **i18next** • 10 locales • RTL handling |
| <img src="https://api.iconify.design/lucide:plug.svg?color=%23d97757" width="14" height="14" style="vertical-align:-4px; display:inline-block"> Integrations | **Discord RPC** • **PeerJS** |

<p align="center">
  <img src="https://skillicons.dev/icons?i=electron,react,ts,vite,tailwind,supabase&perline=6" alt="Tech Icons">
</p>

---

<a id="getting-started"></a>
## <img src="https://api.iconify.design/lucide:rocket.svg?color=%23d97757" width="20" height="20" style="vertical-align:-4px; display:inline-block"> Getting Started

### <img src="https://api.iconify.design/lucide:code-2.svg?color=%23d97757" width="16" height="16" style="vertical-align:-3px; display:inline-block"> For Developers & Contributors

#### <img src="https://api.iconify.design/lucide:check-circle.svg?color=%23d97757" width="16" height="16" style="vertical-align:-3px; display:inline-block"> Prerequisites

- **Node.js** `22+`
- **npm** `10+`

#### <img src="https://api.iconify.design/lucide:download.svg?color=%23d97757" width="16" height="16" style="vertical-align:-3px; display:inline-block"> Installation

```bash
npm install
```

### <img src="https://api.iconify.design/lucide:key.svg?color=%23d97757" width="16" height="16" style="vertical-align:-3px; display:inline-block"> Environment Variables

Copy the template and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Required |
| :--- | :--- | :---: |
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key | — |
| `VITE_TMDB_API_KEY` | TMDB API key (`themoviedb.org/settings/api`) | Yes |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `VITE_CLOUDINARY_API_KEY` | Cloudinary API key | — |
| `VITE_DISCORD_CLIENT_ID` | Discord Application ID for Rich Presence | — |
| `VITE_UPDATE_GITHUB_REPO` | `owner/repo` hosting release builds (updater) | — |

### <img src="https://api.iconify.design/lucide:terminal.svg?color=%23d97757" width="16" height="16" style="vertical-align:-3px; display:inline-block"> Development

```bash
npm run dev          # Renderer in browser (vite)
npm run electron:dev # Full Electron app in dev mode
```

### <img src="https://api.iconify.design/lucide:package.svg?color=%23d97757" width="16" height="16" style="vertical-align:-3px; display:inline-block"> Production Build

```bash
npm run typecheck    # TypeScript checks (renderer + Electron main)
npm run lint         # ESLint
npm run build        # Production bundle → dist/ + dist-electron/
npm run dist         # Build + package NSIS installer → release/<version>/
```

The installer is written to `release/<version>/OnyxaxCinemaSetup<version>.exe`.

---

<a id="project-structure"></a>
## <img src="https://api.iconify.design/lucide:folder-tree.svg?color=%23d97757" width="20" height="20" style="vertical-align:-4px; display:inline-block"> Project Structure

```
├── electron/            # Electron main & preload processes
│   ├── main.ts          # Window, IPC, Discord RPC, updater, encrypted stream URLs
│   └── preload.ts       # contextBridge API + frame protection
├── src/
│   ├── components/      # UI — Dock, Hero, MovieCard, Player, QuickPreview, ...
│   ├── context/         # AuthContext (Supabase session + RPC toggle)
│   ├── hooks/           # useDiscordRPC, usePinned, usePreviewData, ...
│   ├── pages/           # Home, Watch, Details, Category, Search, MyList, Auth, Legal
│   ├── services/        # tmdb, supabase, cloudinary
│   ├── types/           # TMDB & app types
│   ├── locales/         # Split translations (10 languages)
│   ├── locales.ts       # Barrel for i18n resources
│   └── i18n.ts          # i18next setup, RTL & font handling
├── public/              # Static assets & icons
├── scripts/             # Icon generation tooling
└── index.html
```

---

## <img src="https://api.iconify.design/lucide:shield-check.svg?color=%23d97757" width="20" height="20" style="vertical-align:-4px; display:inline-block"> Security

- **No secrets in git** — `.env` is ignored, only `.env.example` is tracked.
- **Encrypted stream URLs** — resolver runs **exclusively in main process**; renderer receives only `iv:ciphertext`.
- **Hardened window** — `devTools: false` in packaged builds, `contextMenus` & `F12/Ctrl+Shift+I` blocked in `electron/main.ts` + `preload.ts`.
- **Frame protection** — `X-Frame-Options/CSP` stripped + `Access-Control-Allow-Origin: *` for player iframes only.

---

## <img src="https://api.iconify.design/lucide:package-check.svg?color=%23d97757" width="20" height="20" style="vertical-align:-4px; display:inline-block"> Releases & Updates

1. Bump `version` in `package.json`
2. Run `npm run dist` to produce the NSIS installer
3. Upload `release/<version>/OnyxaxCinemaSetup<version>.exe` to a **GitHub Release** named `OnyxaxCinemaSetup<version>`
4. Ensure `VITE_UPDATE_GITHUB_REPO` points to `owner/repo` so the in-app updater (`CHECK_FOR_UPDATES` in `main.ts`) can find the release

The updater checks on startup (`App.tsx` → `CHECK_FOR_UPDATES`) and supports **silent** (`/S`) or **manual** install.

---

## <img src="https://api.iconify.design/lucide:scale.svg?color=%23d97757" width="20" height="20" style="vertical-align:-4px; display:inline-block"> License

**MIT** — see [LICENSE](LICENSE).

<p align="center">
  Made with precision by <strong>Onyxax</strong> — Cinema, elevated.
</p>
