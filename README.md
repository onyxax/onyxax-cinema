# 🎬 Onyxax Cinema

A cinematic streaming desktop application built with **Electron + React**. Browse and watch movies, TV series, and anime through a single, elegant, privacy-focused interface — with rich metadata from TMDB, saved progress, multi-language support, and Discord Rich Presence.

## ✨ Features

- **Streaming** — Movies, TV series, and anime with multiple servers, autoplay for the next episode, and persisted watch progress.
- **Rich metadata** — Powered by the TMDB API with poster art, logos, ratings, and trailers.
- **Safety filtering** — Content is filtered by keyword and adult flags before it ever reaches the library.
- **Multi-language UI** — 10 languages (Arabic, English, French, Spanish, German, Italian, Portuguese, Russian, Chinese, Japanese) with automatic RTL layout for Arabic.
- **Accounts & profiles** — Email/password auth via Supabase, avatar upload via Cloudinary, and a personal library (saved movies, series, anime).
- **Discord Rich Presence** — Shows what you're watching with a custom "Download the app" button.
- **In-app updates** — Checks GitHub releases on startup, downloads, and installs silently or manually.
- **Protected player** — Player URLs are generated in the Electron main process and delivered encrypted to the renderer.

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- npm 10+

### Installation

```bash
npm install
```

### Environment variables

Copy the template and fill in your own values:

```bash
cp .env.example .env
```

Required keys: Supabase (URL + anon key), TMDB API key, Cloudinary cloud name + API key, Discord application ID, and the GitHub repository that hosts releases (for the updater).

### Development

```bash
npm run dev        # Vite dev server (renderer only)
npm run electron:dev  # Full Electron app in dev mode
```

### Production build

```bash
npm run typecheck  # TypeScript checks (renderer + Electron main)
npm run lint       # ESLint
npm run build      # Production bundle
npm run dist       # Build + package the Windows installer (NSIS)
```

Installer output goes to `release/<version>/`.

## 🗂️ Project Structure

```
├── electron/            # Electron main & preload processes
│   ├── main.ts          # Window, IPC, Discord RPC, updater, encrypted player URLs
│   └── preload.ts       # contextBridge API + frame protection
├── src/
│   ├── components/      # UI components (Dock, Navbar, Hero, Player, modals...)
│   ├── context/         # Auth context
│   ├── hooks/           # useDiscordRPC
│   ├── pages/           # Home, Watch, Details, CategoryPage, Search, MyList, Auth, Legal
│   ├── services/        # tmdb.ts, supabase.ts, cloudinary.ts
│   ├── types/           # Shared TypeScript types
│   ├── locales.ts       # All translations (10 languages)
│   └── i18n.ts          # i18next setup, RTL + font handling
├── public/              # Static assets & app icons
├── scripts/             # Icon generation tooling
└── index.html
```

## 🔐 Security Notes

- Never commit the real `.env` — it is git-ignored. Use `.env.example` as the template.
- The player URL resolver runs **only** in the Electron main process; the renderer receives an AES-encrypted URL.
- DevTools, context menus, and screenshots of sensitive elements are blocked in the packaged app.

## 📦 Releases & Updates

1. Bump `version` in `package.json`.
2. `npm run dist` to produce the NSIS installer.
3. Upload `release/<version>/OnyxaxCinemaSetup<version>.exe` to a GitHub release named `OnyxaxCinemaSetup<version>`.
4. Set `VITE_UPDATE_GITHUB_REPO` to `owner/repo` so the in-app updater finds it.

## 📄 License

[MIT](LICENSE)
