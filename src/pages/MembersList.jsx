/**
 * ============================================================================
 * MembersList.jsx — The Members List Page of the GYM CRM Application
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 *   This page displays a list of all gym members in a table format. It also
 *   provides a "Create New Member" button that navigates the user to the
 *   AddMember page. Think of it as the "phone book" of the gym — it shows
 *   everyone who's registered.
 *
 * REACT CONCEPTS USED:
 *   - useNavigate (from React Router): programmatic navigation between pages
 *   - Component composition: reuses the <MembersTable> component
 *   - Conditional rendering with {true && ...} (always-visible pattern)
 *
 * HOW IT FITS INTO THE APP:
 *   This is a page-level component rendered by React Router when the user
 *   navigates to "/members". It wraps the reusable MembersTable component
 *   and adds a page header with a create button.
 *
 * LIBRARIES USED:
 *   - React: Core library for building the UI
 *   - react-router-dom (useNavigate): For navigating to other pages without
 *     a full page reload (SPA navigation)
 *   - lucide-react (Plus icon): A small "+" icon for the create button
 *   - MembersTable: A custom reusable component that handles fetching and
 *     displaying the list of members
 * ============================================================================
 */

// --- React Import ---
// We import React itself. Even though modern React (17+) doesn't strictly
// require this import for JSX, many projects still include it for clarity.
import React from 'react';

// --- React Router Import ---
// useNavigate is a React Router hook that gives us a function to
// programmatically navigate to different routes/pages. It's like saying
// "go to this URL" in code, instead of the user clicking a link.
import { useNavigate } from 'react-router-dom';

// --- Custom Component Import ---
// MembersTable is a reusable component that handles its own data fetching
// and displays gym members in a table. By importing it here, we can
// simply drop <MembersTable /> into our JSX and it works on its own.
import MembersTable from '../components/MembersTable';

// --- Icon Import ---
// Plus is a "+" icon from lucide-react. We use it inside the create button
// to give users a visual hint that clicking it will add something new.
import { Plus } from 'lucide-react';

/**
 * MembersList Component
 *
 * This is a simple page component that doesn't receive any props.
 * It renders:
 *   1. A header row with the title "Members" and a "Create New Member" button
 *   2. The MembersTable component below it
 *
 * This component is intentionally simple because most of the heavy lifting
 * (fetching data, pagination, search, etc.) is handled by MembersTable.
 */
export default function MembersList() {
  /**
   * useNavigate returns a function (commonly called 'navigate') that lets
   * us redirect the user to a different page. For example:
   *   navigate('/members/add') takes the user to the Add Member form.
   *
   * This is different from a regular <a href="..."> link because it doesn't
   * reload the whole page — it just swaps the content (SPA behavior).
   */
  const navigate = useNavigate();

  return (
    // Main container with responsive padding:
    // p-4 on mobile, p-6 on medium screens (md:), p-8 on large screens (lg:)
    // max-w-7xl limits the width so content doesn't stretch too wide on huge monitors
    // mx-auto centers the container horizontally
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* ---------- PAGE HEADER ---------- */}
      {/* flex = flexbox layout, justify-between = push items to opposite ends,
          items-center = vertically center items.
          On small screens (default), items stack vertically (flex-col).
          On medium+ screens (sm:flex-row), items sit side by side. */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        {/* Page title */}
        <h1 className="text-2xl font-bold text-slate-800">Members</h1>

        {/* ---------- CREATE BUTTON ---------- */}
        {/* {true && (...)} is a pattern where the button is ALWAYS shown.
            This is likely a placeholder for a future permission check, like:
            {userHasPermission && (...)} — which would only show the button
            if the logged-in user has admin/create privileges.
            For now, 'true' means "always render this button." */}
        {true && (
          <button
            // onClick: When the button is clicked, navigate to '/members/add'
            // The arrow function () => navigate('/members/add') is needed because
            // we want to CALL navigate only when clicked, not immediately.
            onClick={() => navigate('/members/add')}
            // Tailwind classes breakdown:
            // bg-blue-600 = blue background, hover:bg-blue-700 = darker on hover
            // rounded-lg = slightly rounded corners
            // flex items-center = icon and text sit side by side, vertically centered
            // transition-colors = smooth color change animation on hover
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors shadow-sm"
          >
            {/* Plus icon — w-5 h-5 makes it 20x20 pixels, mr-2 adds right margin */}
            <Plus className="w-5 h-5 mr-2" />
            Create New Member
          </button>
        )}
      </div>

      {/* ---------- MEMBERS TABLE ---------- */}
      {/* This is "component composition" — we simply render the MembersTable
          component here and it handles everything internally (fetching data,
          rendering rows, pagination, search, etc.). This keeps our page
          component clean and focused on layout. */}
      <MembersTable />
    </div>
  );
}
