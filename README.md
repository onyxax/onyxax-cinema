# Onyxax Cinema

<p align="center">
  <img src="public/favicon.svg" alt="Onyxax Cinema" width="128" height="128">
</p>

A cross-platform streaming desktop application for movies, TV series, and anime, built with Electron, React, and TypeScript.

[![CI](https://img.shields.io/github/actions/workflow/status/onyxax/onyxax-cinema/ci.yml?branch=main&label=CI&logo=github)](https://github.com/onyxax/onyxax-cinema/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-green.svg)](https://nodejs.org)
[![Version](https://img.shields.io/github/package-json/v/onyxax/onyxax-cinema)](https://github.com/onyxax/onyxax-cinema/releases)

## Overview

Onyxax Cinema aggregates movies, series, and anime into a single interface with rich TMDB metadata, multi-server playback, persisted watch progress, and Discord Rich Presence. Content is filtered against adult flags before reaching the library. The player is protected end-to-end: stream URLs are resolved in the Electron main process and delivered to the renderer encrypted.

## Links

- **Releases** — [github.com/onyxax/onyxax-cinema/releases](https://github.com/onyxax/onyxax-cinema/releases)
- **Issues** — [github.com/onyxax/onyxax-cinema/issues](https://github.com/onyxax/onyxax-cinema/issues)

## Features

- **Catalog** — movies, TV series, and anime with posters, ratings, trailers, and recommendations from the TMDB API
- **Multi-server playback** — multiple stream providers with autoplay for the next episode and resume support
- **Safety filtering** — adult content is filtered by keyword and external adult flags before it reaches the library
- **Localization** — 10 languages (Arabic, English, French, Spanish, German, Italian, Portuguese, Russian, Chinese, Japanese) with automatic RTL layout for Arabic
- **Accounts & profiles** — email/password authentication via Supabase, avatar upload via Cloudinary, and a personal library
- **Discord Rich Presence** — shows the currently watched title, progress, and an in-app "Download the app" button
- **Automatic updates** — checks GitHub releases on startup, downloads, and installs silently or manually
- **Protected player** — stream URLs are generated in the main process and delivered AES-encrypted to the renderer
- **Designed for Windows** — packaged as an NSIS installer with silent-update support (Windows 10/11)

## Tech Stack

| Layer | Technology |
| --- | --- |
| Desktop shell | Electron 41 |
| UI | React 19, TypeScript, Vite 8 |
| Styling | Tailwind CSS 4, custom CSS with CSS variables |
| Data | TMDB API, Supabase (auth), Cloudinary (media) |
| State | React Context + Hooks |
| Internationalization | i18next |
| Integration | Discord RPC, PeerJS |

## Getting Started

### Prerequisites

- Node.js 22+
- npm 10+

### Installation

```bash
npm install
```

### Environment Variables

Copy the template and fill in your own values:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
| `VITE_TMDB_API_KEY` | TMDB API key |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `VITE_CLOUDINARY_API_KEY` | Cloudinary API key |
| `VITE_DISCORD_CLIENT_ID` | Discord application ID for Rich Presence |
| `VITE_UPDATE_GITHUB_REPO` | `owner/repo` hosting release builds (used by the updater) |

### Development

```bash
npm run dev          # Renderer in the browser
npm run electron:dev # Full Electron app in development mode
```

### Production Build

```bash
npm run typecheck    # TypeScript checks (renderer + Electron main)
npm run lint         # ESLint
npm run build        # Production bundle
npm run dist         # Build and package the Windows installer (NSIS)
```

The installer is written to `release/<version>/`.

## Project Structure

```
├── electron/            # Electron main & preload processes
│   ├── main.ts          # Window management, IPC, Discord RPC, updater, encrypted stream URLs
│   └── preload.ts       # contextBridge API and frame protection
├── src/
│   ├── components/      # UI components (Dock, Navbar, Hero, Player, modals, ...)
│   ├── context/         # Application contexts (Auth)
│   ├── hooks/           # Shared hooks (Discord RPC)
│   ├── pages/           # Views (Home, Watch, Details, Category, Search, MyList, Auth, Legal)
│   ├── services/        # Data services (tmdb, supabase, cloudinary)
│   ├── types/           # Shared TypeScript types
│   ├── locales.ts       # Translations for all 10 languages
│   └── i18n.ts          # i18next setup, RTL and font handling
├── public/              # Static assets and icons
├── scripts/             # Icon generation tooling
└── index.html
```

## Security

- The real `.env` is git-ignored; only `.env.example` is committed.
- The stream URL resolver runs exclusively in the Electron main process; the renderer only receives an AES-encrypted URL.
- DevTools, context menus, and sensitive screenshots are disabled in packaged builds.

## Releases & Updates

1. Bump `version` in `package.json`.
2. Run `npm run dist` to produce the NSIS installer.
3. Upload `release/<version>/OnyxaxCinemaSetup<version>.exe` to a GitHub release named `OnyxaxCinemaSetup<version>`.
4. Ensure `VITE_UPDATE_GITHUB_REPO` points to `owner/repo` so the in-app updater can find the release.

## License

MIT — see [LICENSE](LICENSE).
