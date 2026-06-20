/**
 * =============================================================================
 * FILE: main.jsx — The Entry Point of the GYM CRM React Application
 * =============================================================================
 *
 * WHAT THIS FILE DOES:
 *   This is the very first JavaScript file that runs when someone opens the
 *   GYM CRM app in their browser. Think of it as the "ignition key" that
 *   starts the whole application.
 *
 *   Its job is simple but critical:
 *     1. Find the empty <div id="root"> element in the HTML page (index.html).
 *     2. Tell React to take control of that <div> and render our app inside it.
 *     3. Wrap the app in helpful wrappers like StrictMode and BrowserRouter.
 *
 * REACT CONCEPTS USED:
 *   - createRoot()  : The modern way (React 18+) to connect React to the DOM.
 *   - StrictMode     : A development-only wrapper that helps catch bugs early.
 *   - BrowserRouter  : Enables client-side page navigation (no full page reloads).
 *   - JSX            : The HTML-like syntax you see below (e.g., <App />).
 *
 * HOW IT FITS IN THE APP:
 *   index.html  →  main.jsx (this file)  →  App.jsx  →  all other components
 *   The browser loads index.html, which loads this file, which renders <App />.
 *
 * =============================================================================
 */

/* ── React Core Imports ─────────────────────────────────────────────────────
 * StrictMode: A special React component that doesn't render any visible UI.
 *   Instead, it activates extra development-time checks and warnings for all
 *   components inside it. For example, it will warn you if you're using
 *   deprecated (outdated) React features. It has ZERO effect in production.
 */
import { StrictMode } from 'react'

/* ── React DOM Import ───────────────────────────────────────────────────────
 * createRoot: This function is part of React 18's "new root API."
 *   It tells React which HTML element on the page it should manage and
 *   render components into. Before React 18, we used ReactDOM.render() instead.
 *   'react-dom/client' is the sub-package specifically for browser rendering.
 */
import { createRoot } from 'react-dom/client'

/* ── React Router Import ────────────────────────────────────────────────────
 * BrowserRouter: This component enables "client-side routing." Normally, when
 *   you click a link, the browser sends a request to the server and loads a
 *   whole new page. BrowserRouter intercepts that and lets React swap out
 *   components instead — making navigation feel instant and smooth.
 *   It uses the browser's History API (the back/forward buttons still work!).
 */
import { BrowserRouter } from 'react-router-dom'

/* ── Global CSS Import ──────────────────────────────────────────────────────
 * This imports our global stylesheet. In a Vite + React project, you can
 * import CSS files directly into JavaScript — Vite handles bundling them.
 * index.css typically contains Tailwind CSS directives (@tailwind base, etc.)
 * and any custom global styles that apply to the whole application.
 */
import './index.css'

/* ── Root Component Import ──────────────────────────────────────────────────
 * App is the top-level component of our application. Everything else
 * (Sidebar, Header, pages, etc.) lives inside <App />.
 * The '.jsx' extension tells us this file contains JSX (React's HTML-like syntax).
 */
import App from './App.jsx'

/**
 * ── APPLICATION BOOTSTRAP ──────────────────────────────────────────────────
 *
 * This is where the magic happens! Let's break it down step by step:
 *
 * 1. document.getElementById('root')
 *    → Finds the <div id="root"></div> element in index.html.
 *      This is the "container" where our entire React app will live.
 *
 * 2. createRoot(...)
 *    → Creates a React "root" — basically telling React: "Hey, you're in
 *      charge of this DOM element now. Render stuff here."
 *
 * 3. .render(...)
 *    → Actually renders our component tree into that root element.
 *
 * The component tree (what gets rendered) is structured like Russian nesting
 * dolls — each wrapper adds a capability:
 *
 *   <StrictMode>          ← Outer layer: enables dev-time checks
 *     <BrowserRouter>     ← Middle layer: enables URL-based navigation
 *       <App />           ← Inner layer: our actual application
 *     </BrowserRouter>
 *   </StrictMode>
 *
 * The order matters! BrowserRouter must wrap any component that uses
 * routing features (like <Routes>, <Link>, useNavigate, etc.).
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
