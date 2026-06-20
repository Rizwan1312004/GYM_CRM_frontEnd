/**
 * =============================================================================
 * FILE: api.js — The Axios HTTP Client Configuration (API Service Layer)
 * =============================================================================
 *
 * WHAT THIS FILE DOES:
 *   This file creates and configures a reusable HTTP client using the Axios
 *   library. Instead of writing `fetch("http://localhost:5000/api/members")`
 *   every time you want to call the backend, you can just write
 *   `api.get("/members")` — much shorter and cleaner!
 *
 *   It acts as a "middleman" between your React components and the backend
 *   server. All API calls in the app go through this configured instance.
 *
 * WHAT IS AXIOS?
 *   Axios is a popular JavaScript library for making HTTP requests (GET, POST,
 *   PUT, DELETE, etc.). It's similar to the built-in `fetch()` API but with
 *   extra features like:
 *     - Automatic JSON parsing (no need to call response.json())
 *     - Request/response interceptors (middleware for HTTP calls)
 *     - Better error handling
 *     - Request cancellation support
 *
 * KEY CONCEPT — INTERCEPTORS:
 *   Interceptors are like security checkpoints at an airport:
 *     - Request interceptors  → check/modify every outgoing request BEFORE
 *                                it's sent (e.g., attach auth tokens).
 *     - Response interceptors → check/modify every incoming response BEFORE
 *                                it reaches your component (e.g., handle errors).
 *
 * HOW IT FITS IN THE APP:
 *   Components/Pages → import `api` → call api.get(), api.post(), etc.
 *   Example: In MembersList.jsx, you'd do:
 *     import api from '../services/api';
 *     const response = await api.get('/members');
 *
 * =============================================================================
 */

/* ── Axios Import ───────────────────────────────────────────────────────────
 * We import the `axios` library, which provides the `.create()` method
 * to build a custom, pre-configured HTTP client instance.
 * This was installed via: npm install axios
 */
import axios from 'axios';

/**
 * ── Create a Custom Axios Instance ─────────────────────────────────────────
 *
 * axios.create() builds a new Axios instance with custom default settings.
 * Instead of using the global `axios` directly, we create our own `api`
 * instance so we can set defaults (like the base URL) in ONE place.
 *
 * baseURL: This is the root URL that gets prepended to every request.
 *   For example, if baseURL is "http://localhost:5000/api", then:
 *     api.get("/members")  →  GET http://localhost:5000/api/members
 *     api.post("/services") → POST http://localhost:5000/api/services
 *
 * import.meta.env.VITE_API_URL:
 *   This reads the VITE_API_URL value from the environment variables.
 *   In Vite projects, environment variables are stored in a `.env` file
 *   at the project root. For example:
 *     .env file contains:  VITE_API_URL=http://localhost:5000/api
 *   The "VITE_" prefix is required — Vite only exposes env variables
 *   that start with VITE_ to the frontend code (for security reasons,
 *   so you don't accidentally expose server secrets).
 *   `import.meta.env` is Vite's way of accessing these variables
 *   (similar to `process.env` in Node.js, but for the browser).
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request Interceptor (removed)
/*
 * A request interceptor would go here if needed in the future.
 * Common use case: automatically attaching an authentication token
 * (like a JWT) to every outgoing request's headers. Example:
 *
 *   api.interceptors.request.use((config) => {
 *     const token = localStorage.getItem('token');
 *     if (token) {
 *       config.headers.Authorization = `Bearer ${token}`;
 *     }
 *     return config;
 *   });
 */

// Response Interceptor
/**
 * ── Response Interceptor ───────────────────────────────────────────────────
 *
 * This interceptor runs on EVERY response that comes back from the server.
 * It receives two callback functions:
 *
 *   1st function (success handler):
 *     Called when the server responds with a 2xx status code (200, 201, etc.).
 *     Here, we simply pass the response through unchanged.
 *
 *   2nd function (error handler):
 *     Called when the server responds with an error (4xx, 5xx status codes)
 *     or when the request fails entirely (network error, timeout, etc.).
 *     Right now, it just forwards the error using Promise.reject() so the
 *     calling code can handle it with try/catch or .catch().
 *
 *     Future improvement: You could add global error handling here, like:
 *       - 401 Unauthorized → automatically redirect to login page
 *       - 500 Server Error → show a "Something went wrong" toast notification
 *       - Network Error    → show an "Are you offline?" message
 *
 * Promise.reject(error):
 *   This re-throws the error so it continues to propagate. Without this,
 *   the error would be silently swallowed and your components wouldn't
 *   know something went wrong. It's like saying "I saw the error, but
 *   I'm passing it along for someone else to deal with."
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // We can handle global 401s or 500s here later
    return Promise.reject(error);
  }
);

/* ── Default Export ─────────────────────────────────────────────────────────
 * We export the configured `api` instance so other files can import and
 * use it. Every file that needs to talk to the backend will do:
 *   import api from '../services/api';
 *   const data = await api.get('/some-endpoint');
 *
 * Because we configured baseURL and interceptors here, every file that
 * uses `api` gets those settings automatically — no duplication needed!
 */
export default api;
