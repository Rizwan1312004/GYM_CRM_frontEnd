/**
 * ============================================================================
 * ActivityFeed.jsx — Latest Activities Feed for the Dashboard
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 *   This file creates a simple "Latest Activities" panel that will eventually
 *   show a feed of recent actions in the gym (e.g., new member signups,
 *   check-ins, subscription renewals). Currently, it's a placeholder that
 *   displays "No items found" — ready to be filled with real data later.
 *
 * REACT CONCEPTS USED:
 *   - Functional Component: A simple function that returns JSX.
 *   - No props, no state, no hooks — this is as simple as a React component gets!
 *     It's a great example to see the bare minimum structure of a component.
 *
 * HOW IT FITS IN THE APP:
 *   This component is placed on the Dashboard page, typically below the
 *   stat cards. It gives admins a quick view of what's happening at the gym.
 *
 * LIBRARIES USED:
 *   - React: Core library for building the component.
 * ============================================================================
 */

/* Import React — needed for JSX (the HTML-like syntax used below) */
import React from 'react';

/**
 * ActivityFeed — Displays a feed of recent gym activities.
 *
 * PROPS IT RECEIVES:
 *   None — this component doesn't take any props yet. When real data is added,
 *   it would likely receive an array of activity objects as a prop.
 *
 * WHAT IT RETURNS:
 *   A card with a "Latest Activities" header and a placeholder message.
 *   This is a "presentational" component — it just shows UI, no logic.
 */
function ActivityFeed() {
  return (
    /* Outer card container with white background, rounded corners, and a border */
    <div className="bg-white rounded-md shadow-sm border border-slate-200">
      {/*
       * Card header — displays the section title "Latest Activities".
       * The border-b creates a horizontal line separating the header from content.
       */}
      <div className="px-5 py-4 border-b border-slate-200 font-semibold text-slate-800">
        Latest Activities
      </div>

      {/*
       * Card body — currently shows a "No items found" placeholder.
       * When activities are available, this would be replaced with a list/map
       * of activity items.
       *
       * Tailwind classes:
       *   - p-10: Generous padding for a spacious empty state
       *   - flex justify-center items-center: Centers the text both horizontally
       *     and vertically
       *   - bg-slate-50/50: Very faint gray background (50% opacity)
       *   - m-4 rounded: Margin and rounded corners for an inset card effect
       */}
      <div className="p-10 flex justify-center items-center bg-slate-50/50 m-4 rounded border border-slate-100 text-slate-600 font-medium">
        No items found
      </div>
    </div>
  );
}

/* Export the ActivityFeed so it can be imported into the Dashboard page */
export default ActivityFeed;
