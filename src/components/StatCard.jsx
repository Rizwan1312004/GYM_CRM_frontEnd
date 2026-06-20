/**
 * ============================================================================
 * StatCard.jsx — A Reusable Statistics Card for the Dashboard
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 *   This file creates a single "stat card" — a small, beautiful card that
 *   displays a number (like total members, revenue, etc.) with a title and
 *   an icon. You'll see several of these lined up on the Dashboard page.
 *   Think of them like the scoreboards you'd see at the top of any admin panel.
 *
 * REACT CONCEPTS USED:
 *   - Functional Component: A simple function that returns JSX.
 *   - Props: Receives title, value, and icon to display.
 *   - Prop Renaming: The "icon" prop is renamed to "Icon" (capital I) so
 *     React treats it as a component that can be rendered with <Icon />.
 *
 * HOW IT FITS IN THE APP:
 *   Used on the Dashboard page to show key statistics at a glance.
 *   The parent component passes different title/value/icon combinations
 *   to create multiple cards (e.g., "Total Members: 150", "Revenue: $5000").
 *
 * LIBRARIES USED:
 *   - React: Core library for building the UI.
 *   - (Icons are passed in as props from the parent, typically from lucide-react)
 * ============================================================================
 */

/* Import React — needed for JSX syntax */
import React from 'react';

/**
 * StatCard — A dashboard statistics card component.
 *
 * PROPS IT RECEIVES:
 *   - title: The label for the stat (e.g., "Total Members", "Revenue")
 *   - value: The number or data to display (e.g., 150, "$5,000")
 *   - icon: The icon component to display. It's renamed to "Icon" (capital I)
 *           using the destructuring pattern { icon: Icon }. This is necessary
 *           because React requires component names to start with a capital letter.
 *           If we used lowercase "icon", React would think it's an HTML tag.
 *
 * WHAT IT RETURNS:
 *   A styled card with the stat title, value, and icon.
 *   Includes hover animations for a polished, interactive feel.
 */
function StatCard({ title, value, icon: Icon }) {
  return (
    /*
     * The outer card container.
     *
     * Tailwind "group" class explanation:
     *   "group" is a powerful Tailwind concept. When you add "group" to a parent,
     *   you can use "group-hover:" on any child to apply styles when the PARENT
     *   is hovered. This lets us animate the icon and bottom line when the
     *   user hovers anywhere on the card, not just on that specific element.
     *
     * Other key Tailwind classes:
     *   - rounded-2xl: Large border radius for a modern card look
     *   - shadow-sm hover:shadow-xl: Small shadow normally, bigger on hover
     *   - hover:shadow-indigo-100: The hover shadow has a subtle indigo tint
     *   - border border-slate-100 hover:border-indigo-200: Light border that
     *     turns indigo on hover
     *   - transition-all duration-300: Smoothly animate ALL property changes
     *   - relative overflow-hidden: Needed for the decorative elements inside
     */
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:shadow-indigo-100 border border-slate-100 hover:border-indigo-200 transition-all duration-300 relative overflow-hidden flex flex-col p-6">
      {/*
       * Decorative blurred circle in the top-right corner.
       * This is purely cosmetic — it creates a soft glow effect behind the icon.
       *
       * Tailwind classes:
       *   - absolute -right-4 -top-4: Positioned off the edge for a "peeking" effect
       *   - w-24 h-24: Size of the circle
       *   - bg-indigo-50/50: Very faint indigo at 50% opacity
       *   - rounded-full: Makes it a perfect circle
       *   - blur-2xl: Heavily blurred so it looks like a soft glow
       *   - group-hover:bg-indigo-100/50: Gets slightly more visible on card hover
       */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50/50 rounded-full blur-2xl group-hover:bg-indigo-100/50 transition-colors duration-500"></div>
      
      {/* Main content area — title/value on the left, icon on the right */}
      {/*
       * relative z-10: Ensures this content appears ABOVE the decorative blur circle.
       * z-10 means "stacking order 10" (higher numbers = closer to the viewer).
       */}
      <div className="flex justify-between items-start relative z-10">
        {/* Left side: Title and Value */}
        <div className="flex-1">
          {/* The stat label (e.g., "TOTAL MEMBERS") — uppercase and small */}
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
          {/* The stat number (e.g., "150") — large and bold */}
          <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </h3>
        </div>
        
        {/* Right side: The icon in a styled container */}
        {/*
         * Tailwind classes:
         *   - bg-gradient-to-br from-indigo-50 to-purple-50: Gradient background
         *     from light indigo to light purple (bottom-right direction)
         *   - group-hover:scale-110: Grows 10% bigger when the CARD is hovered
         *   - group-hover:-rotate-3: Tilts 3 degrees for a playful hover effect
         *   - transition-transform: Smoothly animates the scale and rotation
         */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
          {/* Render the icon component passed via props */}
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {/* Optional decorative bottom line */}
      {/*
       * This creates a colorful gradient line at the bottom of the card
       * that "slides in" from the left on hover.
       *
       * Tailwind classes:
       *   - absolute bottom-0 left-0 w-full h-1: Thin line at the card's bottom edge
       *   - bg-gradient-to-r from-indigo-500 to-purple-500: Indigo-to-purple gradient
       *   - transform scale-x-0: Initially invisible (scaled to 0 width)
       *   - group-hover:scale-x-100: Expands to full width on card hover
       *   - origin-left: The animation starts from the left side
       */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
    </div>
  );
}

/* Export the StatCard so it can be used on the Dashboard and other pages */
export default StatCard;
