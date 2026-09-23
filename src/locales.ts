// Legacy barrel — now delegates to split files in src/locales/*
// This keeps `import { resources } from './locales'` working while allowing per-language editing.
// To add a language: create src/locales/<code>.ts (export default translation) and register in src/locales/index.ts
export { resources } from './locales/index';
export type { Lang } from './locales/index';
