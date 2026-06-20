/**
 * =============================================================================
 * FILE: App.jsx — The Main Application Component with Layout & Routing
 * =============================================================================
 *
 * WHAT THIS FILE DOES:
 *   This is the "headquarters" of the GYM CRM app. It defines:
 *     1. The overall page layout (sidebar on the left, main content on the right).
 *     2. The routing system — which page component to show for each URL.
 *     3. Global UI elements like the toast notification system.
 *
 *   When you navigate to "/members", this file is what decides to show
 *   the MembersList component. When you go to "/", it shows the Dashboard.
 *
 * REACT CONCEPTS USED:
 *   - useState          : Manages whether the mobile sidebar is open or closed.
 *   - Component composition : Combining smaller components (Sidebar, Header,
 *                             pages) into a complete layout.
 *   - React Router       : <Routes> and <Route> for URL-based page switching.
 *   - Fragments (<>)     : Grouping elements without adding extra DOM nodes.
 *   - Props              : Passing data/functions down to child components.
 *
 * LIBRARIES USED:
 *   - react-router-dom   : Client-side routing (page navigation without reloads).
 *   - react-hot-toast    : Beautiful, lightweight toast notifications (pop-up
 *                          messages like "Member added successfully!").
 *
 * HOW IT FITS IN THE APP:
 *   main.jsx renders <App /> → App renders <AuthenticatedLayout /> →
 *   AuthenticatedLayout renders the Sidebar + Header + whichever page
 *   matches the current URL.
 *
 * =============================================================================
 */

/* ── React Core Import ──────────────────────────────────────────────────────
 * React   : The core React library. Even though modern React (17+) doesn't
 *           strictly require importing React for JSX, some projects keep it
 *           for compatibility or clarity.
 * useState : A React Hook that lets you add "state" (data that can change
 *           over time) to a function component. Think of state like a
 *           whiteboard — you can write on it, erase it, and the component
 *           re-renders whenever the whiteboard changes.
 */
import React, { useState } from "react";

/* ── React Router Imports ───────────────────────────────────────────────────
 * Routes : A container that looks at the current URL and decides which
 *          <Route> inside it matches. Only the matching Route's component
 *          gets rendered. Think of it as a switchboard operator.
 * Route  : Defines a single URL-to-component mapping.
 *          Example: <Route path="/members" element={<MembersList />} />
 *          means "when the URL is /members, show the MembersList component."
 */
import { Routes, Route } from "react-router-dom";

/* ── Toast Notification Import ──────────────────────────────────────────────
 * Toaster : A component from the react-hot-toast library that renders toast
 *           notifications on screen. You place <Toaster /> once in your app,
 *           and then you can call toast.success("Yay!") or toast.error("Oops!")
 *           from ANY component — the Toaster will display them.
 *           Think of it like a notification center that listens for messages.
 */
import { Toaster } from "react-hot-toast";

/* ── Layout Component Imports ───────────────────────────────────────────────
 * Sidebar : The navigation panel on the left side of the screen. On mobile
 *           devices, it slides in/out (controlled by the isSidebarOpen state).
 * Header  : The top bar of the app, containing the hamburger menu button
 *           (for mobile) and possibly other controls like user info.
 */
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

/* ── Page Component Imports ─────────────────────────────────────────────────
 * Each of these is a full "page" component that gets rendered in the main
 * content area when its URL route is matched. They are the actual screens
 * the user sees and interacts with.
 */

/* Dashboard: The home/landing page with overview stats and charts. */
import Dashboard from "./pages/Dashboard";

//
/* MemberProfile: Shows detailed info about a single gym member (by their ID). */
import MemberProfile from "./pages/MemberProfile";
/* MembersList: Displays a table/list of all registered gym members. */
import MembersList from "./pages/MembersList";
//

/* ServicesList: Shows all available gym services (e.g., personal training). */
import ServicesList from "./pages/ServicesList";
/* SubscriptionsList: Displays all member subscriptions and their statuses. */
import SubscriptionsList from "./pages/SubscriptionsList";
/* AddSubscription: A form page for creating a new subscription. */
import AddSubscription from "./pages/AddSubscription";
/* EditSubscription: A form page for editing an existing subscription. */
import EditSubscription from "./pages/EditSubscription";
/* AddMember: A form page for registering a new gym member. */
import AddMember from "./pages/AddMember";

/* Attendance: Page for tracking/recording gym member check-ins. */
import Attendance from "./pages/Attendance";
/* ActivitiesList: Displays gym activities (classes, events, etc.). */
import ActivitiesList from "./pages/ActivitiesList";
//

/**
 * ── AuthenticatedLayout Component ──────────────────────────────────────────
 *
 * WHAT IT DOES:
 *   Defines the main layout structure for the entire app. It arranges:
 *     - A Sidebar on the left (for navigation links)
 *     - A main content area on the right (with a Header on top and the
 *       current page below it)
 *
 * WHY IT'S SEPARATE FROM App:
 *   Separating the layout into its own component keeps things organized.
 *   If you later add authentication (login), you could conditionally show
 *   this layout only for logged-in users (hence the name "Authenticated").
 *
 * PROPS: None — this is a self-contained layout component.
 *
 * RETURNS: The full page layout with sidebar, header, and routed page content.
 */
function AuthenticatedLayout() {
  /**
   * ── Sidebar Open/Close State ──────────────────────────────────────────
   * useState(false) creates a state variable called `isSidebarOpen`.
   *   - `isSidebarOpen` holds the current value (true = sidebar visible,
   *     false = sidebar hidden). Starts as `false` (closed by default).
   *   - `setIsSidebarOpen` is the function to update this value.
   *
   * This is primarily for MOBILE screens where the sidebar overlays the
   * content. On desktop, the sidebar is always visible via CSS.
   *
   * Flow:
   *   User clicks hamburger menu → setIsSidebarOpen(true) → sidebar slides in
   *   User clicks close/overlay  → setIsSidebarOpen(false) → sidebar slides out
   */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    /**
     * ── Root Layout Container ─────────────────────────────────────────
     * Tailwind classes explained:
     *   flex          → Uses CSS Flexbox to place children side by side
     *                   (Sidebar on left, main content on right).
     *   min-h-screen  → Makes the container at least as tall as the
     *                   browser window (no awkward short pages).
     *   bg-slate-100  → Light gray background color.
     *   font-sans     → Uses a clean sans-serif font family.
     *   text-slate-800 → Dark gray text color for good readability.
     *   relative      → Establishes a positioning context for any
     *                   absolutely-positioned children (like the mobile
     *                   sidebar overlay).
     */
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-800 relative">
      {/* SIDEBAR */}
      {/*
        The Sidebar component receives two props:
          isOpen  → Whether the sidebar should be visible (for mobile).
          onClose → A callback function the Sidebar calls when the user
                    wants to close it (e.g., clicking an overlay or X button).
        The arrow function () => setIsSidebarOpen(false) is an "inline
        callback" — it's a shorthand way of passing a function that sets
        the sidebar state to closed.
      */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* MAIN CONTENT */}
      {/*
        This <main> element holds everything to the RIGHT of the sidebar.
        Tailwind classes:
          flex-1       → Takes up all remaining horizontal space after
                         the sidebar (like a flexible rubber band).
          flex flex-col → Stacks children vertically (Header on top, page below).
          h-screen     → Full viewport height.
          overflow-x-hidden → Hides horizontal scrollbar (prevents
                              awkward sideways scrolling).
          overflow-y-auto   → Adds vertical scrollbar only when content
                              overflows (so pages can scroll).
          w-full       → Takes the full available width.
      */}
      <main className="flex-1 flex flex-col h-screen overflow-x-hidden overflow-y-auto w-full">
        {/*
          Header receives onMenuClick — when the user taps the hamburger
          menu icon, this callback fires and opens the sidebar.
        */}
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        {/*
          ── Routes: The URL → Page Mapping System ───────────────────
          <Routes> examines the current browser URL and renders ONLY
          the <Route> whose `path` matches. It's like a series of
          if/else statements:
            if URL is "/"              → show <Dashboard />
            else if URL is "/members"  → show <MembersList />
            else if URL is "/members/add" → show <AddMember />
            ... and so on.

          The `path` prop is the URL pattern to match.
          The `element` prop is the React component to render.
        */}
        <Routes>
          {/* Home page — the dashboard with stats and overview */}
          <Route path="/" element={<Dashboard />} />

          {/* Attendance tracking page */}
          <Route path="/attendance" element={<Attendance />} />

          {/* Activities/classes listing page */}
          <Route path="/activities" element={<ActivitiesList />} />

          {/* Gym services listing page */}
          <Route path="/services" element={<ServicesList />} />

          {/* Subscriptions management pages */}
          <Route path="/subscriptions" element={<SubscriptionsList />} />
          <Route path="/subscriptions/add" element={<AddSubscription />} />
          {/*
            Dynamic route with a URL parameter!
            ":id" is a placeholder that matches any value in the URL.
            For example:
              /subscriptions/edit/42  → :id becomes "42"
              /subscriptions/edit/99  → :id becomes "99"
            The EditSubscription component can read this ID using
            the useParams() hook from React Router.
          */}
          <Route
            path="/subscriptions/edit/:id"
            element={<EditSubscription />}
          />

          {/* Members management pages */}
          <Route path="/members" element={<MembersList />} />
          <Route path="/members/add" element={<AddMember />} />
          {/*
            Another dynamic route — :id will be the member's unique ID.
            Example: /members/7 would show the profile for member #7.
          */}
          <Route path="/members/:id" element={<MemberProfile />} />

          {/* Fallback route for unimplemented pages */}
          {/*
            The "*" (wildcard) path matches ANY URL that didn't match
            the routes above. This acts as a "404" or "catch-all" page.
            Instead of showing a blank screen for unknown URLs, users
            see a friendly "Page under construction..." message.
          */}
          <Route
            path="*"
            element={
              <div className="p-6 text-slate-500">
                Page under construction...
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

/**
 * ── App Component (Root Component) ──────────────────────────────────────────
 *
 * WHAT IT DOES:
 *   This is the top-level component rendered by main.jsx. It combines:
 *     1. <Toaster />              — The notification display system.
 *     2. <AuthenticatedLayout />  — The entire app layout with routing.
 *
 * WHY USE A FRAGMENT (<> </>)?
 *   In React, a component must return a single root element. If you need
 *   to return multiple sibling elements (like Toaster AND AuthenticatedLayout),
 *   you can wrap them in a Fragment (<> </>). Unlike a <div>, a Fragment
 *   doesn't create any extra HTML element in the DOM — it's invisible.
 *   It's purely a React convenience for grouping.
 *
 * PROPS: None.
 * RETURNS: The toast notification system + the full authenticated layout.
 */
function App() {
  return (
    <>
      {/*
        Toaster renders toast notifications in the top-right corner.
        The `position` prop controls where toasts appear on screen.
        Options include: "top-left", "top-center", "top-right",
        "bottom-left", "bottom-center", "bottom-right".
      */}
      <Toaster position="top-right" />

      {/* The main application layout with sidebar, header, and pages */}
      <AuthenticatedLayout />
    </>
  );
}

/* ── Default Export ──────────────────────────────────────────────────────────
 * "export default App" makes the App component available for import in
 * other files. In main.jsx, we do `import App from './App.jsx'` — this
 * is what it imports. "default" means it's the main thing this file exports,
 * so the importing file can name it whatever it wants.
 */
export default App;
