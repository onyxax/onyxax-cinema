# Onyxax Cinema

<p align="center">
  <img src="public/favicon.svg" alt="Onyxax Cinema" width="128" height="128">
</p>

<p align="center">
  <strong>A cinematic desktop experience for movies, TV series & anime — in one elegant app.</strong><br>
  <em>Built with Electron • React • TypeScript • TMDB • Supabase</em>
</p>

<p align="center">
  <a href="https://github.com/onyxax/onyxax-cinema/actions"><img src="https://img.shields.io/github/actions/workflow/status/onyxax/onyxax-cinema/ci.yml?branch=main&label=CI&style=flat&logo=github&logoColor=white&labelColor=111827&color=d97757&cacheSeconds=3600" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-111827?style=flat&labelColor=111827&color=d97757&logo=opensourceinitiative&logoColor=white&cacheSeconds=3600" alt="License"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node-%3E%3D22-111827?style=flat&labelColor=111827&color=339933&logo=nodedotjs&logoColor=white&cacheSeconds=3600" alt="Node"></a>
  <a href="https://github.com/onyxax/onyxax-cinema/releases"><img src="https://img.shields.io/github/package-json/v/onyxax/onyxax-cinema?label=Version&style=flat&labelColor=111827&color=d97757&logo=semanticrelease&logoColor=white&cacheSeconds=3600" alt="Version"></a>
</p>

<p align="center">
  <a href="https://github.com/onyxax/onyxax-cinema/releases/latest"><img src="https://img.shields.io/github/v/release/onyxax/onyxax-cinema?label=Download%20for%20Windows&style=for-the-badge&logo=windows&logoColor=white&labelColor=111827&color=d97757" alt="Download for Windows"></a>
</p>

<p align="center">
  <a href="https://github.com/onyxax/onyxax-cinema/releases">Releases</a> •
  <a href="https://github.com/onyxax/onyxax-cinema/issues">Issues</a> •
  <a href="#download">Download</a> •
  <a href="#getting-started">For Developers</a>
</p>

---

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/list.svg" width="18" height="18" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%); vertical-align:-4px"> Quick Navigation

| <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/users.svg" width="14" height="14" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%)"> **For Everyone** | <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/code-2.svg" width="14" height="14" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%)"> **For Developers** |
| :--- | :--- |
| [Download](#download) — Get the app in 3 clicks | [Getting Started](#getting-started) — Run the code locally |
| [Features](#features) — What you can watch & do | [Project Structure](#project-structure) — How the code is organized |
| [Overview](#overview) — What is Onyxax Cinema? | [Tech Stack](#tech-stack) — What it's built with |

---

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/book-open.svg" width="20" height="20" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%); vertical-align:-4px"> Overview

**Onyxax Cinema** aggregates **movies**, **TV series**, and **anime** into a single, beautifully crafted desktop interface.

> Rich **TMDB** metadata • **Multi-server** playback • Persisted **watch progress** • **Discord Rich Presence**

- **Safety-first** — adult content is filtered by **keywords + TMDB adult flags + AniList verification** before it ever reaches your library.
- **Protected player** — stream URLs are resolved **only in the Electron main process** and delivered to the renderer **AES-256-CBC encrypted**.
- **Polished UX** — cinematic hero, Quick Preview on hover, grid / premium list views, and a collapsible dock.

---

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/sparkles.svg" width="20" height="20" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%); vertical-align:-4px"> Features

| <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/layout-grid.svg" width="14" height="14" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%)"> | Feature | Details |
| :---: | :--- | :--- |
| <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/film.svg" width="16" height="16" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%)"> | **Catalog** | Movies, TV series & anime with posters, ratings, trailers & recommendations via **TMDB API** |
| <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/play.svg" width="16" height="16" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%)"> | **Multi-Server Playback** | Multiple providers, **autoplay next episode**, resume from last position |
| <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/shield.svg" width="16" height="16" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%)"> | **Safety Filtering** | Keyword blocklist + `adult` flags + **AniList** adult verification for anime |
| <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/globe.svg" width="16" height="16" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%)"> | **Localization** | **10 languages** — `ar` `en` `fr` `es` `de` `it` `pt` `ru` `zh` `ja` • Auto `RTL` for Arabic & `Tajawal` font |
| <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/users.svg" width="16" height="16" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%)"> | **Accounts & Profiles** | Email/password auth via **Supabase**, avatar upload via **Cloudinary**, personal library |
| <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/gamepad-2.svg" width="16" height="16" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%)"> | **Discord Rich Presence** | Live title, `S01E05 • 57% • 19m left`, poster as `large_image`, app logo as permanent `small_image` |
| <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/refresh-cw.svg" width="16" height="16" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%)"> | **Automatic Updates** | Checks **GitHub Releases** on startup, downloads & installs **silently or manually** |
| <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/lock.svg" width="16" height="16" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%)"> | **Protected Player** | URLs generated in `main.ts`, never exposed in renderer source |
| <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/monitor.svg" width="16" height="16" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%)"> | **Designed for Windows** | **NSIS** installer, silent-update support — *Windows 10/11* |

---

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/download.svg" width="20" height="20" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%); vertical-align:-4px"> Download

<p align="center">
  <a href="https://github.com/onyxax/onyxax-cinema/releases/latest"><img src="https://img.shields.io/github/v/release/onyxax/onyxax-cinema?label=Download%20for%20Windows&style=for-the-badge&logo=windows&logoColor=white&labelColor=111827&color=d97757" alt="Download for Windows"></a>
</p>

**3 steps to watch:**

| Step | What to do | |
| :---: | :--- | :---: |
| **1** | Click the big **Download for Windows** button above | <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/mouse-pointer-click.svg" width="16" height="16" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%)"> |
| **2** | Open the downloaded `OnyxaxCinemaSetup1.2.9.exe` and click **Next → Install** | <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/package-open.svg" width="16" height="16" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%)"> |
| **3** | Open **Onyxax Cinema** from Desktop/Start and start watching | <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/play.svg" width="16" height="16" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%)"> |

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

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/layers.svg" width="20" height="20" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%); vertical-align:-4px"> Tech Stack

| Layer | Technology |
| :--- | :--- |
| <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/monitor.svg" width="14" height="14" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%)"> Desktop Shell | **Electron 41** |
| <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/atom.svg" width="14" height="14" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%)"> UI | **React 19** + **TypeScript** + **Vite 8** |
| <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/palette.svg" width="14" height="14" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%)"> Styling | **Tailwind CSS 4** + CSS variables |
| <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/database.svg" width="14" height="14" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%)"> Data | **TMDB API** • **Supabase** (auth) • **Cloudinary** (media) |
| <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/share-2.svg" width="14" height="14" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%)"> State | **React Context + Hooks** |
| <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/languages.svg" width="14" height="14" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%)"> i18n | **i18next** • 10 locales • RTL handling |
| <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/plug.svg" width="14" height="14" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%)"> Integrations | **Discord RPC** • **PeerJS** |

<p align="center">
  <img src="https://skillicons.dev/icons?i=electron,react,ts,vite,tailwind,supabase&perline=6" alt="Tech Icons">
</p>

---

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/rocket.svg" width="20" height="20" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%); vertical-align:-4px"> Getting Started

### <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/code-2.svg" width="16" height="16" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%); vertical-align:-3px"> For Developers & Contributors

#### <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/check-circle.svg" width="16" height="16" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%); vertical-align:-3px"> Prerequisites

- **Node.js** `22+`
- **npm** `10+`

#### <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/download.svg" width="16" height="16" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%); vertical-align:-3px"> Installation

```bash
npm install
```

### <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/key.svg" width="16" height="16" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%); vertical-align:-3px"> Environment Variables

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

### <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/terminal.svg" width="16" height="16" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%); vertical-align:-3px"> Development

```bash
npm run dev          # Renderer in browser (vite)
npm run electron:dev # Full Electron app in dev mode
```

### <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/package.svg" width="16" height="16" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%); vertical-align:-3px"> Production Build

```bash
npm run typecheck    # TypeScript checks (renderer + Electron main)
npm run lint         # ESLint
npm run build        # Production bundle → dist/ + dist-electron/
npm run dist         # Build + package NSIS installer → release/<version>/
```

The installer is written to `release/<version>/OnyxaxCinemaSetup<version>.exe`.

---

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/folder-tree.svg" width="20" height="20" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%); vertical-align:-4px"> Project Structure

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

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/shield-check.svg" width="20" height="20" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%); vertical-align:-4px"> Security

- **No secrets in git** — `.env` is ignored, only `.env.example` is tracked.
- **Encrypted stream URLs** — resolver runs **exclusively in main process**; renderer receives only `iv:ciphertext`.
- **Hardened window** — `devTools: false` in packaged builds, `contextMenus` & `F12/Ctrl+Shift+I` blocked in `electron/main.ts` + `preload.ts`.
- **Frame protection** — `X-Frame-Options/CSP` stripped + `Access-Control-Allow-Origin: *` for player iframes only.

---

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/package-check.svg" width="20" height="20" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%); vertical-align:-4px"> Releases & Updates

1. Bump `version` in `package.json`
2. Run `npm run dist` to produce the NSIS installer
3. Upload `release/<version>/OnyxaxCinemaSetup<version>.exe` to a **GitHub Release** named `OnyxaxCinemaSetup<version>`
4. Ensure `VITE_UPDATE_GITHUB_REPO` points to `owner/repo` so the in-app updater (`CHECK_FOR_UPDATES` in `main.ts`) can find the release

The updater checks on startup (`App.tsx` → `CHECK_FOR_UPDATES`) and supports **silent** (`/S`) or **manual** install.

---

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/scale.svg" width="20" height="20" style="filter: invert(52%) sepia(38%) saturate(820%) hue-rotate(325deg) brightness(92%) contrast(88%); vertical-align:-4px"> License

**MIT** — see [LICENSE](LICENSE).

<p align="center">
  Made with precision by <strong>Onyxax</strong> — Cinema, elevated.
</p>
