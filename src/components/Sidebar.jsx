/**
 * ============================================================================
 * Sidebar.jsx — The Navigation Sidebar for The GYM Manager Application
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 *   This file creates the left-side navigation panel (sidebar) that you see
 *   in the app. It contains links to different pages like Dashboard, Members,
 *   Attendance, etc. Think of it like a table of contents for the whole app.
 *
 * REACT CONCEPTS USED:
 *   - Functional Components: Both NavItem and Sidebar are functions that return JSX.
 *   - Props: Data passed from a parent component down to a child component
 *     (like passing "icon" and "label" to NavItem).
 *   - Prop Destructuring: Pulling out specific properties from the props object
 *     using { } syntax in the function parameters.
 *   - Conditional Rendering: Showing/hiding elements based on a condition
 *     (like the mobile backdrop only appearing when isOpen is true).
 *
 * HOW IT FITS IN THE APP:
 *   The Sidebar is rendered inside the main layout component. It stays visible
 *   on desktop screens (md and above), and slides in/out on mobile screens
 *   using the isOpen prop controlled by a hamburger menu button in the Header.
 *
 * LIBRARIES USED:
 *   - react-router-dom (NavLink): Provides navigation links that know which
 *     page is currently active, so we can highlight the current page.
 *   - lucide-react: A library of clean, minimal SVG icons used for each
 *     navigation item (Home, Users, etc.).
 * ============================================================================
 */

/* Import React — the core library needed to write React components */
import React from "react";

/*
 * NavLink is a special link component from React Router.
 * Unlike a regular <a> tag, NavLink:
 *   1. Doesn't cause a full page reload — it navigates "client-side"
 *   2. Knows whether the link is currently active (i.e., the user is on that page)
 *   3. Can apply different styles when active vs. inactive
 */
import { NavLink } from "react-router-dom";

/*
 * These are icon components from the "lucide-react" library.
 * Each one renders a small SVG icon. We use them next to navigation labels
 * to give the sidebar a polished, visual look.
 */
import {
  Home,
  Activity,
  CalendarCheck,
  Users,
  CreditCard,
  Server,
  RefreshCw,
} from "lucide-react";

/**
 * NavItem — A single navigation link in the sidebar.
 *
 * PROPS IT RECEIVES:
 *   - icon: The icon component to display (renamed to "Icon" with a capital I
 *           so React treats it as a component — this is a common pattern called
 *           "prop renaming" using { icon: Icon }).
 *   - label: The text to show next to the icon (e.g., "Dashboard", "Members").
 *   - path: The URL path this link navigates to (e.g., "/members").
 *   - exact: If true, this link is only highlighted when the URL matches exactly.
 *            This is important for "/" (Dashboard) so it doesn't stay highlighted
 *            when you visit "/members" or other sub-pages.
 *
 * WHAT IT RETURNS:
 *   A styled NavLink that highlights itself in blue when the user is on that page.
 */
function NavItem({ icon: Icon, label, path, exact }) {
  /*
   * If no "path" prop is provided, we auto-generate the path from the label.
   * For example, label="Subscriptions" becomes path="/subscriptions".
   * The || operator means "use path if it exists, otherwise use the fallback".
   */
  const to = path || `/${label.toLowerCase()}`;
  return (
    <NavLink
      to={to}
      /* "end" prop (set via the "exact" prop) ensures this link is only
       * marked active when the URL matches exactly. Without this, the
       * Dashboard link ("/") would be active on every page since every
       * URL starts with "/". */
      end={exact}
      /*
       * className receives a function instead of a plain string.
       * React Router calls this function with { isActive: true/false },
       * letting us apply different styles depending on whether the user
       * is currently on this page.
       *
       * Tailwind classes breakdown:
       *   - flex items-center: Lays out icon and text side by side
       *   - px-6 py-3: Padding (horizontal 6, vertical 3) for comfortable click area
       *   - text-sm font-medium: Small but readable text
       *   - transition-colors: Smooth color change on hover/active
       *   - bg-blue-600 text-white: Active state — blue background, white text
       *   - text-slate-300 hover:bg-slate-800: Inactive state — gray text,
       *     darkens on hover
       */
      className={({ isActive }) =>
        `flex items-center px-6 py-3 text-sm font-medium transition-colors ${isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`
      }
    >
      {/* Render the icon component. h-5 w-5 sets its size, mr-3 adds right margin. */}
      <Icon className="h-5 w-5 mr-3" />
      {/* Render the text label next to the icon */}
      {label}
    </NavLink>
  );
}

/**
 * Sidebar — The main sidebar navigation component.
 *
 * PROPS IT RECEIVES:
 *   - isOpen: A boolean (true/false) that controls whether the sidebar is
 *             visible on mobile. On desktop (md+), the sidebar is always visible.
 *   - onClose: A callback function that gets called when the user clicks the
 *              dark backdrop (overlay) on mobile to close the sidebar.
 *
 * WHAT IT RETURNS:
 *   The complete sidebar with a logo area at the top and navigation links below.
 *   On mobile, it also renders a semi-transparent dark backdrop behind the sidebar.
 */
function Sidebar({ isOpen, onClose }) {
  return (
    /*
     * <> and </> are "React Fragments" — they let us return multiple
     * elements without adding an extra DOM node (like a <div>).
     * We need this because we're returning both the backdrop AND the sidebar.
     */
    <>
      {/* Mobile Backdrop */}
      {/*
       * This is CONDITIONAL RENDERING using the && operator.
       * It reads: "If isOpen is true, THEN render this div."
       * When isOpen is false, nothing is rendered (React skips it).
       *
       * The backdrop is the dark semi-transparent overlay that appears
       * behind the sidebar on mobile. Clicking it closes the sidebar.
       *
       * Tailwind classes:
       *   - fixed inset-0: Covers the entire screen
       *   - bg-black/50: Black background at 50% opacity
       *   - z-40: Stacking order (behind sidebar which is z-50)
       *   - md:hidden: Only visible on mobile; hidden on medium+ screens
       */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside
        /*
         * This uses a TEMPLATE LITERAL (backtick string) with a ternary operator
         * to dynamically set CSS classes.
         *
         * The ternary: condition ? valueIfTrue : valueIfFalse
         *   - If isOpen: "translate-x-0" (sidebar is visible, at normal position)
         *   - If !isOpen: "-translate-x-full md:translate-x-0"
         *     (sidebar slides fully off-screen to the left on mobile,
         *      but stays visible on desktop thanks to md:translate-x-0)
         *
         * Key Tailwind classes:
         *   - fixed md:static: Fixed position on mobile, normal flow on desktop
         *   - inset-y-0 left-0: Anchored to the left edge, full height
         *   - z-50: High stacking order so it appears above other content
         *   - w-64: Width of 16rem (256px)
         *   - bg-[#1e2336]: Custom dark navy background color
         *   - transition-transform duration-300: Smooth slide animation
         */
        className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-[#1e2336] text-slate-300 flex flex-col 
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        {/* Logo / Brand area at the top of the sidebar */}
        <div className="h-16 flex items-center px-6 text-white font-bold text-xl tracking-wider border-b border-slate-700">
          The GYM Manager
        </div>

        {/* Navigation links container */}
        {/*
         * flex-1: Takes up all remaining vertical space
         * overflow-y-auto: Adds a scrollbar if there are too many links to fit
         * space-y-1: Small vertical gap between each NavItem
         */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {/* Each NavItem renders one navigation link with an icon and label */}
          {/* The "exact" prop on Dashboard ensures it's only active at "/" exactly */}
          <NavItem icon={Home} label="Dashboard" path="/" exact />
          <NavItem icon={Activity} label="Activities" path="/activities" />
          <NavItem icon={CalendarCheck} label="Attendance" path="/attendance" />
          <NavItem icon={Users} label="Members" path="/members" />
          <NavItem icon={CreditCard} label="Subscriptions" />

          <NavItem icon={Server} label="Services" path="/services" />
          <NavItem icon={RefreshCw} label="Cycles" />

        </nav>
      </aside>
    </>
  );
}

/* Export the Sidebar so other files can import and use it */
export default Sidebar;
