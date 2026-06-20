/**
 * =============================================================================
 * FILE: vite.config.js — Vite Build Tool Configuration
 * =============================================================================
 *
 * WHAT THIS FILE DOES:
 *   This file configures Vite, the build tool that powers the GYM CRM app's
 *   development experience. Vite (French for "fast" ⚡) is a modern build
 *   tool that:
 *     - Runs a lightning-fast development server with Hot Module Replacement
 *       (HMR) — your changes appear in the browser instantly without a
 *       full page reload.
 *     - Bundles your code for production (combines all your JS, CSS, and
 *       assets into optimized files ready for deployment).
 *
 * WHAT ARE PLUGINS?
 *   Plugins extend Vite's capabilities. Think of Vite as a base car, and
 *   plugins are add-ons like GPS, heated seats, etc. Each plugin teaches
 *   Vite how to handle something it doesn't know about by default.
 *
 * PLUGINS USED HERE:
 *   1. @vitejs/plugin-react  → Teaches Vite how to understand React's JSX
 *                               syntax and enables Fast Refresh (instant
 *                               updates in the browser while preserving
 *                               component state during development).
 *   2. @tailwindcss/vite     → Integrates Tailwind CSS directly into Vite's
 *                               build pipeline. Tailwind is a utility-first
 *                               CSS framework that lets you style elements
 *                               using small utility classes like "p-4",
 *                               "text-center", "bg-blue-500", etc.
 *
 * HOW IT FITS IN THE APP:
 *   When you run `npm run dev`, Vite reads THIS config file to know how to
 *   start the dev server. When you run `npm run build`, Vite reads it to
 *   know how to create the production bundle.
 *
 * =============================================================================
 */

/* ── Vite Core Import ───────────────────────────────────────────────────────
 * defineConfig is a helper function from Vite. It doesn't change any
 * behavior — it's purely for developer experience. It provides:
 *   - TypeScript autocompletion (your editor suggests valid config options)
 *   - Type checking (catches typos in config property names)
 * You could export a plain object instead, but defineConfig makes it nicer.
 */
import { defineConfig } from "vite";

/* ── React Plugin Import ────────────────────────────────────────────────────
 * @vitejs/plugin-react is the official Vite plugin for React projects.
 * It enables:
 *   - JSX transformation (converting <div> syntax into React.createElement calls)
 *   - Fast Refresh (hot-reloading components without losing state)
 *   - Automatic React runtime injection (so you don't need to manually
 *     import React in every file that uses JSX)
 */
import react from "@vitejs/plugin-react";

/* ── Tailwind CSS Plugin Import ─────────────────────────────────────────────
 * @tailwindcss/vite is the official Tailwind CSS integration for Vite.
 * It processes your Tailwind utility classes (like "p-4", "flex",
 * "bg-slate-100") and generates the actual CSS. In production, it also
 * performs "tree-shaking" — removing any unused Tailwind classes to keep
 * your CSS bundle as small as possible.
 */
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
/**
 * ── Export the Configuration ───────────────────────────────────────────────
 *
 * defineConfig() takes an object with various configuration options.
 * Here we only use the `plugins` array, but you could also configure:
 *   - server    : dev server port, proxy settings, HTTPS, etc.
 *   - build     : output directory, minification, source maps, etc.
 *   - resolve   : path aliases (e.g., "@" → "./src")
 *   - css       : CSS preprocessor options (Sass, Less, etc.)
 *
 * The `plugins` array lists all Vite plugins to activate:
 *   - react()       → called as a function because plugins are factory
 *                     functions that return the actual plugin object.
 *                     You can pass options like react({ jsxRuntime: 'classic' }).
 *   - tailwindcss() → same pattern — calling it activates the plugin.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
