/**
 * ============================================================================
 * SubscriptionsList.jsx — Subscriptions Overview Page
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 *   This page displays a table of all gym subscriptions. Each subscription
 *   links a member to a package (e.g., "John Doe → 3-Month Gold Plan").
 *   Staff can view the list, create new subscriptions, edit existing ones,
 *   or delete them.
 *
 * REACT CONCEPTS USED:
 *   - useState: to store the list of subscriptions, loading state, and errors
 *   - useEffect: to fetch subscription data from the API when the page loads
 *   - Conditional rendering: showing a loader, error, empty state, or table
 *   - Array .map(): to loop through subscriptions and render table rows
 *   - Array .filter(): to remove a deleted subscription from the local list
 *
 * HOW IT FITS IN THE GYM CRM APP:
 *   This is the main "Subscriptions" page in the sidebar navigation.
 *   It links to AddSubscription (create) and EditSubscription (edit).
 *   Think of it as the "inbox" for all active and past subscriptions.
 *
 * LIBRARIES USED:
 *   - react-router-dom: for navigating to other pages (add/edit)
 *   - react-hot-toast: for showing success/error popup notifications
 *   - lucide-react: for beautiful SVG icons (Edit pencil, Trash can, etc.)
 *   - ../services/api: a pre-configured Axios instance for HTTP requests
 * ============================================================================
 */

// React core and hooks — useState lets us store data, useEffect lets us
// run code when the component first appears on screen.
import React, { useState, useEffect } from "react";

// useNavigate gives us a function to programmatically change the URL/page.
// Think of it like clicking a link, but triggered from code.
import { useNavigate } from "react-router-dom";

// Our pre-configured Axios instance — it already knows the base URL of our
// backend API, so we just need to specify endpoints like "/subscriptions/".
import api from '../services/api';

// toast is a function that shows little popup notifications (like Android toasts).
// toast.success("Done!") shows a green popup; toast.error("Oops!") shows red.
import toast from 'react-hot-toast';

// Icons from the lucide-react library. Each is a React component that renders
// an SVG icon. We import only the ones we need to keep the bundle small.
// - Edit: a pencil icon for the edit button
// - Trash2: a trash can icon for the delete button
// - Plus: a "+" icon for the create button
// - CreditCard, Search, Calendar, User, Package: imported but used elsewhere
//   or kept for potential future use
import { Edit, Trash2, Plus, CreditCard, Search, Calendar, User, Package } from 'lucide-react';

/**
 * SubscriptionsList Component
 *
 * This is the main (and only) component exported from this file.
 * It doesn't receive any props — it fetches its own data from the API.
 *
 * Returns: A full page with a header + "Create" button on top, and a data
 *          table below showing all subscriptions with edit/delete actions.
 */
export default function SubscriptionsList() {
  // useNavigate() returns a function we can call to go to another route.
  // Example: navigate("/subscriptions/add") takes the user to the add page.
  const navigate = useNavigate();

  // --- STATE VARIABLES ---
  // Think of state like a whiteboard: when you erase and rewrite something,
  // React automatically re-renders (redraws) the component to show the update.

  // subscriptions: an array holding all subscription objects from the API.
  // Starts as an empty array [] because we haven't fetched data yet.
  const [subscriptions, setSubscriptions] = useState([]);

  // isLoading: a boolean flag. true = we're still fetching data from the API.
  // We start as true because we immediately begin loading on page open.
  const [isLoading, setIsLoading] = useState(true);

  // error: holds an error message string if the API call fails, or null if OK.
  const [error, setError] = useState(null);

  /**
   * useEffect — Runs code when the component mounts (first appears on screen).
   *
   * The empty array [] as the second argument means "run this only ONCE"
   * when the component first renders — not on every re-render.
   * This is the standard pattern for fetching data when a page loads.
   */
  useEffect(() => {
    // Set loading to true before starting the API call
    setIsLoading(true);

    // api.get() sends an HTTP GET request to our backend.
    // The backtick string `/subscriptions/` is a template literal — here it's
    // just a plain string, but backticks allow embedding variables with ${}.
    api.get(`/subscriptions/`)
      .then((response) => {
        // The API might return data in different formats depending on the backend:
        //   - Directly as an array: response.data = [...]
        //   - Nested in an object: response.data = { data: [...] }
        //   - Paginated: response.data = { results: [...] }
        // This line handles all three cases using a ternary operator:
        //   condition ? valueIfTrue : valueIfFalse
        // First it checks if response.data IS an array. If yes, use it directly.
        // If not, try response.data.data, then response.data.results, then [].
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.data || response.data.results || [];

        // Store the fetched subscriptions in state — this triggers a re-render.
        setSubscriptions(data);
        setIsLoading(false);
      })
      .catch((err) => {
        // If the API call fails (network error, server down, etc.), we land here.
        console.error("Error fetching subscriptions:", err);
        setError("Failed to load subscriptions list.");
        toast.error("Failed to load subscriptions list.");
        setIsLoading(false);
      });
  }, []);

  /**
   * handleDelete — Called when the user clicks the "Delete" button on a row.
   *
   * How it works step by step:
   * 1. Show a browser confirmation dialog ("Are you sure?")
   * 2. If user clicks "OK", send a DELETE request to the API
   * 3. If successful, remove that subscription from our local state
   *    (so the row disappears without needing to re-fetch everything)
   * 4. Show a success or error toast notification
   *
   * The "async" keyword means this function uses await (pause until done).
   * @param {number} id - The ID of the subscription to delete
   */
  const handleDelete = async (id) => {
    // window.confirm() shows a native browser "OK / Cancel" dialog.
    // It returns true if user clicks OK, false if Cancel.
    if (window.confirm("Are you sure you want to delete this subscription?")) {
      try {
        // Send HTTP DELETE request to remove the subscription on the server.
        // The backtick string embeds the id variable: e.g., "/subscriptions/42/"
        await api.delete(`/subscriptions/${id}/`);

        // .filter() creates a NEW array that excludes the deleted subscription.
        // It keeps every subscription whose id does NOT match the deleted one.
        // This is the React-friendly way to remove an item — never mutate state directly!
        setSubscriptions(subscriptions.filter(sub => sub.id !== id));

        toast.success("Subscription deleted successfully.");
      } catch (err) {
        console.error("Failed to delete subscription:", err);
        toast.error("Failed to delete subscription.");
      }
    }
  };

  // --- JSX RETURN ---
  // Everything below is JSX — React's syntax for writing HTML-like code in JavaScript.
  // Tailwind CSS classes are used for styling (e.g., "p-4" = padding 1rem).
  return (
    // Outer container: responsive padding (p-4 on mobile, p-6 on tablets, p-8 on desktop)
    // max-w-7xl = caps the width at ~80rem so it doesn't stretch on huge screens
    // mx-auto = centers the container horizontally
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">

      {/* ---- PAGE HEADER: Title + Create Button ---- */}
      {/* flex + justify-between puts the title on the left and button on the right */}
      {/* On small screens (sm:), items stack vertically (flex-col) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Subscriptions</h1>

        {/* {true && (...)} is a pattern that always renders the content inside.
            It's often used as a placeholder where a permission check like
            {isAdmin && (...)} might be added later. */}
        {true && (
          <button
            onClick={() => navigate("/subscriptions/add")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors shadow-sm"
          >
            {/* Plus icon next to the button text. w-5 h-5 = 20x20px, mr-2 = margin-right */}
            <Plus className="w-5 h-5 mr-2" />
            Create New Subscription
          </button>
        )}
      </div>

      {/* ---- MAIN CONTENT AREA: Table or placeholder states ---- */}
      {/* This white card holds either the loading skeleton, error, empty state, or table */}
      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">

        {/* CONDITIONAL RENDERING CHAIN — This is a common React pattern:
            isLoading ? (show skeleton)
            : error ? (show error message)
            : subscriptions.length === 0 ? (show "no data" message)
            : (show the actual table)
            Think of it like a series of if/else if/else checks. */}

        {isLoading ? (
          // ---- LOADING SKELETON ----
          // Shows 5 animated "placeholder" rows while data is loading.
          // animate-pulse makes the gray bars gently fade in and out.
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="flex items-center space-x-4 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-12"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/5"></div>
                <div className="h-4 bg-slate-200 rounded w-24"></div>
                <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                <div className="flex-1 flex justify-end gap-2">
                  <div className="h-8 bg-slate-200 rounded w-16"></div>
                  <div className="h-8 bg-slate-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // ---- ERROR STATE ----
          // If fetching failed, show the error message in a red box.
          <div className="p-6 text-center text-red-500 bg-red-50/50 m-4 rounded border border-red-100">
            {error}
          </div>
        ) : subscriptions.length === 0 ? (
          // ---- EMPTY STATE ----
          // If the API returned successfully but with no subscriptions.
          // border-dashed gives the border a dashed line style.
          <div className="p-10 flex justify-center items-center text-slate-500 bg-slate-50/50 m-4 rounded border border-slate-100 border-dashed">
            No subscriptions found.
          </div>
        ) : (
          // ---- DATA TABLE ----
          // overflow-x-auto allows horizontal scrolling on small screens
          // so the table doesn't break the layout.
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">

              {/* Table header row — uppercase, smaller text for column labels */}
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-4 font-medium">
                    Member
                  </th>
                  <th scope="col" className="px-6 py-4 font-medium">
                    Package
                  </th>
                  <th scope="col" className="px-6 py-4 font-medium">
                    Start Date
                  </th>
                  <th scope="col" className="px-6 py-4 font-medium">
                    End Date
                  </th>
                  <th scope="col" className="px-6 py-4 font-medium">
                    Status
                  </th>
                  {/* Actions column — same {true && ...} pattern as the Create button */}
                  {true && (
                    <th scope="col" className="px-6 py-4 font-medium text-right">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              {/* Table body — one row per subscription */}
              <tbody>
                {/* .map() loops over the subscriptions array.
                    For each subscription object (called "sub"), we return a <tr> row.
                    The "key" prop is required by React to efficiently track list items. */}
                {subscriptions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0"
                  >
                    {/* Subscription ID — displayed with a # prefix */}
                    <td className="px-6 py-4 font-medium text-slate-800">
                      #{sub.id}
                    </td>

                    {/* Member name — the || operator provides a fallback value.
                        If sub.member_name is null/undefined/empty, show "Unknown Member".
                        This is called the "logical OR" fallback pattern. */}
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {sub.member_name || "Unknown Member"}
                    </td>

                    {/* Package name with same fallback pattern */}
                    <td className="px-6 py-4">
                      {sub.package_name || "Unknown Package"}
                    </td>

                    {/* Start date — falls back to "N/A" if not available */}
                    <td className="px-6 py-4">
                      {sub.start_date || "N/A"}
                    </td>

                    {/* End date — tries sub.end_date first, then sub.valid_until
                        (different APIs may use different field names), then "N/A" */}
                    <td className="px-6 py-4">
                      {sub.end_date || sub.valid_until || "N/A"}
                    </td>

                    {/* Status badge — shows "Active" or "Inactive" with color coding */}
                    <td className="px-6 py-4">
                      {/* Template literal in className: the backtick string lets us
                          mix static classes with a dynamic expression ${...}.
                          The ternary checks multiple conditions using || (OR):
                          - sub.status === "Active"
                          - sub.status?.toLowerCase() === "active"
                            (the ?. is "optional chaining" — it safely handles
                            the case where sub.status is null/undefined)
                          - sub.is_active (a boolean field)
                          If ANY of those are true → green badge; otherwise → gray badge. */}
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          sub.status === "Active" ||
                          sub.status?.toLowerCase() === "active" ||
                          sub.is_active
                            ? "bg-[#60d62a] text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {/* Display the status text. If sub.status doesn't exist,
                            derive it from the is_active boolean. */}
                        {sub.status || (sub.is_active ? "Active" : "Inactive")}
                      </span>
                    </td>

                    {/* Action buttons — Edit and Delete */}
                    {true && (
                      <td className="px-6 py-4 text-right flex justify-end gap-3">
                        {/* Edit button — navigates to the edit page for this subscription.
                            The backtick URL embeds sub.id, e.g., "/subscriptions/edit/42" */}
                        <button
                          onClick={() => navigate(`/subscriptions/edit/${sub.id}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <Edit className="w-4 h-4" /> Edit
                        </button>

                        {/* Delete button — calls our handleDelete function with this sub's ID */}
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="text-red-500 hover:text-red-700 font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
