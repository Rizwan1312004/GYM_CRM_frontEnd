/**
 * ============================================================================
 * Header.jsx — The Top Navigation Bar for The GYM Manager Application
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 *   This file creates the horizontal bar at the very top of the app.
 *   On mobile screens, it shows a hamburger menu button (☰) that opens
 *   the sidebar. On desktop, the button is hidden since the sidebar is
 *   always visible. Think of it as the "toolbar" of the app.
 *
 * REACT CONCEPTS USED:
 *   - Functional Component: Header is a simple function that returns JSX.
 *   - Props: Receives "onMenuClick" — a callback function from the parent
 *     that toggles the sidebar open/closed.
 *   - Event Handling: The onClick event on the button calls onMenuClick.
 *
 * HOW IT FITS IN THE APP:
 *   The Header sits at the top of the main content area, next to (or above)
 *   the Sidebar. The parent layout component passes an "onMenuClick" function
 *   that toggles the Sidebar's open/close state on mobile devices.
 *
 * LIBRARIES USED:
 *   - lucide-react (Menu): Provides the hamburger menu icon (three horizontal
 *     lines) used for the mobile navigation toggle button.
 * ============================================================================
 */

/* Import React — required for writing JSX (the HTML-like syntax in components) */
import React from 'react';

/*
 * Import the "Menu" icon from lucide-react.
 * This renders the classic "hamburger" icon (☰) — three stacked horizontal lines
 * commonly used to indicate a collapsible navigation menu.
 */
import { Menu } from 'lucide-react';

/**
 * Header — The top navigation bar component.
 *
 * PROPS IT RECEIVES:
 *   - onMenuClick: A function passed from the parent component. When called,
 *     it toggles the sidebar open/closed. Think of it like a TV remote button —
 *     the Header has the button, but the parent decides what happens when pressed.
 *
 * WHAT IT RETURNS:
 *   A horizontal bar with a hamburger menu button (visible only on mobile)
 *   and placeholder space for future features (like user profile, notifications).
 */
function Header({ onMenuClick }) {
  return (
    /*
     * <header> is a semantic HTML element — it tells the browser
     * "this is the header area of the page."
     *
     * Tailwind classes:
     *   - h-16: Fixed height of 4rem (64px), matching the sidebar logo area
     *   - bg-[#1e2336]: Custom dark navy color (matches the sidebar)
     *   - shadow-sm: Subtle shadow below the header for depth
     *   - flex justify-between items-center: Flexbox layout — items spaced
     *     evenly with space between left and right, vertically centered
     *   - px-4 md:px-6: Horizontal padding (smaller on mobile, bigger on desktop)
     */
    <header className="h-16 bg-[#1e2336] shadow-sm flex justify-between items-center px-4 md:px-6">
      {/* Left side of the header */}
      <div className="flex items-center">
        {/*
         * Hamburger menu button — only visible on mobile screens.
         *
         * When clicked, it calls onMenuClick() which toggles the sidebar.
         *
         * Tailwind classes:
         *   - md:hidden: Hidden on medium screens and above (desktop).
         *     This is the key class! On desktop, the sidebar is always
         *     visible, so this button isn't needed.
         *   - text-slate-300 hover:text-white: Gray icon that turns white on hover
         *   - mr-4: Right margin to space it from other elements
         *   - p-1: Small padding to make the click target a bit bigger
         *   - focus:outline-none: Removes the default browser focus ring
         *
         * aria-label: An accessibility attribute that tells screen readers
         * what this button does (since it only has an icon, not text).
         */}
        <button 
          onClick={onMenuClick}
          className="md:hidden text-slate-300 hover:text-white mr-4 p-1 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {/* The Menu icon component. size={24} sets it to 24x24 pixels. */}
          <Menu size={24} />
        </button>
      </div>

      {/* Right side of the header — currently empty, could hold user profile,
          notifications, or other toolbar items in the future */}
      <div>
      </div>
    </header>
  );
}

/* Export the Header so it can be imported and used in the layout */
export default Header;
