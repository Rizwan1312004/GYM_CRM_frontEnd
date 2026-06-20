/**
 * ============================================================================
 * Dashboard.jsx — The Main Dashboard Page of the GYM CRM Application
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 *   This is the "home page" of the GYM CRM app. When a user logs in or visits
 *   the main route, they see this Dashboard. It shows:
 *     1. Four "KPI stat cards" at the top (subscriptions, services, packages, members)
 *     2. A members table (left column) and a member panel (right column)
 *
 * REACT CONCEPTS USED:
 *   - useState: to store dashboard statistics, loading state, and error messages
 *   - useEffect: to fetch data from the server when the page first loads
 *   - Conditional rendering: showing loading skeletons OR real data
 *   - Array.map(): looping through data to render multiple cards
 *
 * HOW IT FITS INTO THE APP:
 *   This is a top-level page component. The React Router renders it when the
 *   user navigates to the "/" (home) route. It acts as the main overview screen
 *   where gym administrators can see a quick summary of their business.
 *
 * LIBRARIES USED:
 *   - React (useState, useEffect): Core library for building the UI
 *   - lucide-react: Provides lightweight, beautiful SVG icons
 *   - api (custom): An Axios instance configured with the backend base URL
 *   - StatCard, MembersTable, MemberPanel: Custom reusable components
 * ============================================================================
 */

// --- React Imports ---
// useState lets us create "state variables" — values that, when changed, cause
// the component to re-render (update what the user sees on screen).
// useEffect lets us run code at specific times — here, right when the page loads.
import React, { useState, useEffect } from "react";

// --- API Service Import ---
// 'api' is a pre-configured Axios instance (think of it as a helper for making
// HTTP requests to our backend server). It already knows the base URL, so we
// just need to provide the endpoint path like "/dashboard-stats/".
import api from "../services/api";

// --- Icon Imports from lucide-react ---
// These are SVG icon components. We rename some with "as" to avoid name clashes.
// For example, "CreditCard" is renamed to "CardIcon" so it doesn't conflict
// with any HTML element or other variable named CreditCard.
import {
  CreditCard as CardIcon,
  Layers,
  Box,
  Users as UsersIcon,
} from "lucide-react";

// --- Custom Component Imports ---
// StatCard: A reusable card that displays a title, a number, and an icon.
// MembersTable: A table component that lists all gym members.
// MemberPanel: A side panel showing member details or login info.
import StatCard from "../components/StatCard";
import MembersTable from "../components/MembersTable";
import MemberPanel from "../components/MemberPanel";

/**
 * Dashboard Component
 *
 * This is the main dashboard page. It doesn't receive any props — it fetches
 * its own data from the API and manages its own state internally.
 *
 * What it renders:
 *   - A row of 4 stat cards (or loading skeletons while data is loading)
 *   - A two-column layout with a members table and a member panel
 */
export default function Dashboard() {
  // -------------------------------------------------------------------------
  // STATE VARIABLES
  // -------------------------------------------------------------------------
  // Think of state like a whiteboard — when you erase and rewrite something,
  // React notices and updates the screen to match the new value.

  /**
   * statsData: Holds the dashboard statistics fetched from the backend.
   * It's an object with four keys, each initialized to 0.
   * setStatsData is the function we call to update this value.
   *
   * Example of what this might look like after fetching:
   * { total_subscriptions: 42, total_services: 8, total_packages: 5, total_members: 120 }
   */
  const [statsData, setStatsData] = useState({
    total_subscriptions: 0,
    total_services: 0,
    total_packages: 0,
    total_members: 0,
  });

  /**
   * isLoading: A boolean (true/false) that tracks whether we are currently
   * waiting for data from the server. We start as "true" because data is
   * being fetched as soon as the component loads.
   */
  const [isLoading, setIsLoading] = useState(true);

  /**
   * error: Stores an error message string if something goes wrong during
   * the API call. Starts as null (meaning "no error yet").
   */
  const [error, setError] = useState(null);

  // -------------------------------------------------------------------------
  // DATA FETCHING WITH useEffect
  // -------------------------------------------------------------------------
  /**
   * useEffect runs side effects — things that happen OUTSIDE of rendering,
   * like fetching data from a server, setting up timers, etc.
   *
   * The empty array [] at the end (called the "dependency array") means:
   * "Run this effect only ONCE, right after the component first appears on screen."
   * If we put a variable in the array like [id], it would re-run whenever 'id' changes.
   *
   * Inside this effect:
   *   1. Set loading to true (show skeletons)
   *   2. Make a GET request to "/dashboard-stats/"
   *   3. On success: save the data and stop loading
   *   4. On failure: log the error, save an error message, and stop loading
   */
  useEffect(() => {
    setIsLoading(true);
    api
      .get(`/dashboard-stats/`)
      .then((response) => {
        // response.data contains the JSON sent back by the server
        setStatsData(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching dashboard stats:", error);
        setError("Failed to load dashboard statistics.");
        setIsLoading(false);
      });
  }, []);

  // -------------------------------------------------------------------------
  // STATS CONFIGURATION ARRAY
  // -------------------------------------------------------------------------
  /**
   * This array maps each stat to a title, a numeric value from statsData,
   * and an icon component. We use this array to loop through and render
   * a <StatCard> for each item, which keeps the JSX clean and DRY
   * (Don't Repeat Yourself).
   */
  const stats = [
    {
      title: "Total Subscription",
      value: statsData.total_subscriptions,
      icon: CardIcon,
    },
    { title: "Total Services", value: statsData.total_services, icon: Layers },
    { title: "Total Packages", value: statsData.total_packages, icon: Box },
    { title: "Total Members", value: statsData.total_members, icon: UsersIcon },
  ];

  // -------------------------------------------------------------------------
  // JSX RETURN — What the user sees on screen
  // -------------------------------------------------------------------------
  return (
    // Main container: p-4 = padding, max-w-7xl = max width, mx-auto = horizontally centered
    // bg-slate-50 = very light gray background, min-h-screen = at least full screen height
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-screen bg-slate-50">
      {/* KPI STAT CARDS */}

      {/* ---------- ERROR BANNER ---------- */}
      {/* This is "conditional rendering" using the && operator:
          If 'error' has a truthy value (i.e., it's not null), show the red error box.
          If 'error' is null, React skips this entire block. */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* ---------- STAT CARDS GRID ---------- */}
      {/* grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 = responsive grid:
            - On small screens: 1 card per row
            - On medium screens (sm): 2 cards per row
            - On large screens (lg): 4 cards per row
          gap-4 = space between grid items, mb-6 = margin bottom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        {/* This is a TERNARY OPERATOR: condition ? valueIfTrue : valueIfFalse
            If isLoading is true → show skeleton placeholders (gray pulsing boxes)
            If isLoading is false → show actual StatCard components with real data */}
        {isLoading
          ? // --- LOADING SKELETONS ---
            // Array.from({ length: 4 }) creates an array with 4 empty slots [undefined, undefined, undefined, undefined].
            // We .map() over it to create 4 identical skeleton cards.
            // The _ parameter means "we don't care about the value, just the index."
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                // animate-pulse makes the element fade in and out, creating a "loading" shimmer effect
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-pulse h-36 flex flex-col justify-between"
              >
                <div className="flex justify-between">
                  <div className="w-1/2">
                    {/* These gray rectangles mimic the shape of the real content */}
                    <div className="h-8 bg-slate-200 rounded mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                  </div>
                  {/* This circle mimics the icon */}
                  <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
                </div>
              </div>
            ))
          : // --- ACTUAL STAT CARDS ---
            // .map() loops through the stats array and renders a <StatCard> for each.
            // 'key' helps React efficiently update the list if items change.
            stats.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
              />
            ))}
      </div>

      {/* MAIN TWO-COLUMN GRID */}
      {/* lg:grid-cols-3 means on large screens, divide the row into 3 equal columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Members Table) */}
        {/* lg:col-span-2 means this div takes up 2 of the 3 columns on large screens */}
        <div className="lg:col-span-2">
          <MembersTable />
        </div>

        {/* Right Column (Member Login / Info Panel) */}
        {/* lg:col-span-1 means this div takes up 1 of the 3 columns */}
        <div className="lg:col-span-1">
          <MemberPanel />
        </div>
      </div>
    </div>
  );
}
