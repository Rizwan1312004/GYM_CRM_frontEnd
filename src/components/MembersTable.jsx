/**
 * ============================================================================
 * MembersTable.jsx — The Members Directory Table
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 *   This file creates the main members table — the core of the "Members" page.
 *   It fetches all gym members from the backend API, displays them in a
 *   searchable/filterable table, and lets admins edit or delete members.
 *   Clicking a row opens a modal with the member's full details.
 *
 * REACT CONCEPTS USED:
 *   - useState: Manages local state (member list, loading status, errors, etc.)
 *   - useEffect: Runs code when the component first appears (fetches data from API)
 *   - Conditional Rendering: Shows loading skeleton, error message, empty state,
 *     or the actual table depending on the current state.
 *   - Event Handling: Click handlers for rows, edit buttons, delete buttons.
 *   - Lifting State: The modal's open/close state is managed here and passed
 *     down to MemberDetailsModal as props.
 *
 * HOW IT FITS IN THE APP:
 *   This is the main component rendered on the "/members" page. It's the
 *   central hub for viewing and managing all gym members.
 *
 * LIBRARIES USED:
 *   - api (custom): An Axios instance configured to talk to the backend API.
 *   - react-hot-toast: Shows toast notifications (pop-up messages) for
 *     success/error feedback (e.g., "Member deleted successfully").
 *   - lucide-react: Icons for edit (pencil) and delete (trash) buttons.
 *   - react-router-dom (useNavigate): Programmatic navigation to other pages.
 *   - date-fns (set): Date utility library (imported but not actively used here).
 * ============================================================================
 */

/* Import React and the hooks we need */
import React, { useState, useEffect } from "react";

/*
 * Import the pre-configured API client (an Axios instance).
 * This handles things like the base URL and authentication headers,
 * so we just need to call api.get("/members/") instead of writing
 * the full URL and headers every time.
 */
import api from "../services/api";

/*
 * react-hot-toast provides beautiful toast notifications.
 * toast.success("message") shows a green success popup.
 * toast.error("message") shows a red error popup.
 */
import toast from "react-hot-toast";

/* Icons from lucide-react for the action buttons */
import { Edit, Trash2, Users } from "lucide-react";

/*
 * useNavigate is a React Router hook that lets us navigate programmatically.
 * Instead of the user clicking a link, WE can send them to a page with code.
 * Example: navigate("/members/5") sends the user to member #5's edit page.
 */
import { useNavigate } from "react-router-dom";

/* Import the modal component that shows member details when a row is clicked */
import MemberDetailsModal from "./MemberDetailsModal";

/* Imported from date-fns library (currently unused in this component) */
import { set } from "date-fns";

/**
 * MembersTable — The main members directory table component.
 *
 * PROPS IT RECEIVES:
 *   None — this component manages all its own data by fetching from the API.
 *
 * WHAT IT RETURNS:
 *   A full-featured table with:
 *   - A gender filter dropdown
 *   - Loading skeleton animation while data is being fetched
 *   - Error state if the API call fails
 *   - Empty state if no members match the filter
 *   - The actual data table with edit/delete actions
 *   - A member details modal
 */
export default function MembersTable() {
  /*
   * useNavigate returns a function we can call to send the user to a new page.
   * Think of it as a "go to this URL" command.
   */
  const navigate = useNavigate();

  /*
   * ========== STATE VARIABLES (using useState hook) ==========
   *
   * useState is React's way of creating "remembered" variables.
   * Normal variables reset every time the component re-renders,
   * but state variables PERSIST across renders.
   *
   * The pattern: const [currentValue, setterFunction] = useState(initialValue)
   *   - currentValue: The current state value (read it like a variable)
   *   - setterFunction: A function to UPDATE the value (calling it triggers re-render)
   *   - initialValue: What the value starts as
   */

  /* The list of all members fetched from the API. Starts as an empty array. */
  const [members, setMembers] = useState([]);

  /* Whether the data is currently being loaded from the API. Starts as true. */
  const [isLoading, setIsLoading] = useState(true);

  /* Holds any error message if the API call fails. Starts as null (no error). */
  const [error, setError] = useState(null);

  /* The currently selected gender filter value. "" means "All Genders" (no filter). */
  const [genderFilter, setGenderFilter] = useState("");

  /* The member object that was clicked, to be shown in the details modal. */
  const [selectedMember, setSelectedMember] = useState(null);

  /* Whether the member details modal is currently visible. */
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * handleRowClick — Called when a user clicks on a table row.
   *
   * It stores the clicked member's data in state and opens the modal.
   * This is how we "connect" the table to the modal — clicking a row
   * sets the data, and the modal reads that data from props.
   */
  const handleRowClick = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  /*
   * ========== useEffect — Fetch members when component mounts ==========
   *
   * useEffect runs "side effects" — code that does something outside
   * of just rendering UI (like fetching data from an API, setting up
   * event listeners, etc.).
   *
   * The empty array [] as the second argument means:
   *   "Run this effect ONLY ONCE, when the component first appears."
   * If we didn't pass [], it would run on EVERY re-render (bad for API calls!).
   *
   * Think of it like: "When this component is born, go fetch the member data."
   */
  useEffect(() => {
    setIsLoading(true);

    /*
     * api.get("/members/") sends a GET request to the backend.
     * .then() runs when the request SUCCEEDS.
     * .catch() runs when the request FAILS.
     *
     * This is a "Promise chain" — an alternative to async/await for handling
     * asynchronous operations (things that take time, like API calls).
     */
    api
      .get(`/members/`)
      .then((response) => {
        /*
         * Different APIs return data in different formats:
         *   - Some return an array directly: response.data = [...]
         *   - Some wrap it: response.data = { data: [...] }
         *   - Some use pagination: response.data = { results: [...] }
         *
         * This line handles all three cases using the || (OR) operator:
         *   - First, check if response.data is an array (use it as-is)
         *   - If not, try response.data.data
         *   - If not, try response.data.results
         *   - If none work, default to an empty array []
         */
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.data || response.data.results || [];
        setMembers(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching members:", err);
        setError("Failed to load members list.");
        toast.error("Failed to load members directory.");
        setIsLoading(false);
      });
  }, []);

  /**
   * handleDelete — Deletes a member after confirmation.
   *
   * This is an async function (notice the "async" keyword). Inside it,
   * we use "await" to pause execution until the API call completes.
   * The try/catch block handles success and error cases.
   *
   * Step by step:
   *   1. Show a browser confirmation dialog ("Are you sure?")
   *   2. If confirmed, send a DELETE request to the API
   *   3. If successful, remove the member from the local state
   *      (so the table updates immediately without re-fetching)
   *   4. Show a success/error toast notification
   */
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        /* Send DELETE request to the API */
        await api.delete(`/members/${id}/`);

        /*
         * Update the local members list by FILTERING OUT the deleted member.
         * .filter() creates a new array that includes only members whose
         * id does NOT match the deleted id. This avoids a full page refresh.
         */
        setMembers(members.filter((member) => member.id !== id));
        toast.success("Member successfully deleted.");
      } catch (err) {
        console.error("Failed to delete member:", err);
        toast.error("Failed to delete member.");
      }
    }
  };

  /*
   * ========== FILTERING LOGIC ==========
   *
   * This creates a filtered version of the members array based on the
   * selected gender filter.
   *
   * How it works (ternary operator):
   *   condition ? valueIfTrue : valueIfFalse
   *
   *   - If genderFilter has a value (e.g., "Male"):
   *     Filter the members array to only include members of that gender.
   *     The ?. is OPTIONAL CHAINING — it safely accesses .gender even if
   *     member is null/undefined (prevents crashes).
   *
   *   - If genderFilter is "" (empty string, which is "falsy"):
   *     Use the full members array (no filtering).
   */
  const filteredMembers = genderFilter
    ? members.filter(
        (member) => member.gender?.toLowerCase() === genderFilter.toLowerCase(),
      )
    : members;

  return (
    /* Main container card for the entire members table section */
    <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
      {/* ===== TABLE HEADER with title and gender filter ===== */}
      <div className="px-5 py-4 border-b border-slate-200 font-semibold text-slate-800 flex justify-between items-center">
        <span>Members Directory</span>
        {/*
         * Gender filter dropdown.
         * "value" is controlled by React state (genderFilter).
         * "onChange" updates the state whenever the user picks a new option.
         * This is a "controlled component" — React controls the select's value.
         */}
        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className="bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
        >
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/*
       * ===== CONDITIONAL RENDERING — Three-way branching =====
       *
       * This is a CHAINED TERNARY pattern. It works like an if/else if/else:
       *
       *   if (isLoading) → Show skeleton loading animation
       *   else if (error) → Show error message
       *   else if (filteredMembers.length === 0) → Show "no members" empty state
       *   else → Show the actual data table
       *
       * The syntax is:
       *   condition1 ? (result1) : condition2 ? (result2) : (defaultResult)
       */}
      {isLoading ? (
        /* ===== LOADING STATE — Skeleton Animation ===== */
        /*
         * While data is loading, we show "skeleton" placeholders that mimic
         * the shape of the actual data. This is a common UX pattern that
         * feels better than a spinning loader because users can see what
         * the layout will look like.
         *
         * We use .map() on a dummy array [1,2,3,4,5] to create 5 skeleton rows.
         * "animate-pulse" makes them fade in and out, simulating loading.
         */
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="flex items-center space-x-4 animate-pulse">
              {/* Skeleton avatar circle */}
              <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
              <div className="flex-1 space-y-2 py-1">
                {/* Skeleton name bar */}
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                {/* Skeleton email bar */}
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              </div>
              {/* Skeleton action buttons area */}
              <div className="h-8 bg-slate-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* ===== ERROR STATE ===== */
        /* Shows the error message in a red-tinted box */
        <div className="p-6 text-center text-red-500 bg-red-50/50 m-4 rounded border border-red-100">
          {error}
        </div>
      ) : filteredMembers.length === 0 ? (
        /* ===== EMPTY STATE — No members found ===== */
        /* Shown when the members array is empty or no members match the filter */
        <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 m-4 rounded-xl border border-slate-200 border-dashed">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            No Members Found
          </h3>
          <p className="text-sm text-slate-500 max-w-sm">
            We couldn't find any members matching your criteria. Try adjusting
            your filters.
          </p>
        </div>
      ) : (
        /* ===== DATA TABLE — The actual members table ===== */
        /* overflow-x-auto: Adds horizontal scroll on small screens if needed */
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            {/* Table header row */}
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">
                  Admission No
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  Member
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  Email
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  Gender
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  Blood Group
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  Status
                </th>
                {/*
                 * {true && (...)} is a pattern used as a placeholder for
                 * future conditional logic. Right now it ALWAYS renders
                 * (because true is always true). In the future, this could
                 * be replaced with something like {isAdmin && (...)} to
                 * only show actions for admin users.
                 */}
                {true && (
                  <th scope="col" className="px-6 py-4 font-medium text-right">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {/*
               * .map() iterates over the filteredMembers array and creates
               * one table row (<tr>) for each member. This is how React
               * renders lists — you transform an array of data into an
               * array of JSX elements.
               *
               * The "key" prop is REQUIRED when rendering lists in React.
               * It helps React efficiently update the DOM by identifying
               * which items changed, were added, or removed.
               */}
              {filteredMembers.map((member) => (
                <tr
                  key={member.id}
                  className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0 cursor-pointer"
                  onClick={() => handleRowClick(member)}
                >
                  {/* Admission Number — uses admissionNo if available, otherwise shows #id */}
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {/*
                     * The || operator here means "use the left value if it exists,
                     * otherwise fall back to the right value."
                     * Template literal `#${member.id}` creates a string like "#5".
                     */}
                    {member.admissionNo || `#${member.id}`}
                  </td>

                  {/* Member name with avatar image */}
                  <td className="px-6 py-4 flex items-center gap-3">
                    {/*
                     * The avatar image uses the member's avatar URL if available.
                     * If not, it falls back to ui-avatars.com — a free service that
                     * generates letter-based avatars from a name (e.g., "JD" for "John Doe").
                     * encodeURIComponent() makes the name URL-safe (handles spaces, special chars).
                     */}
                    <img
                      src={
                        member.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || "User")}&background=random`
                      }
                      alt={member.name}
                      className="w-8 h-8 rounded-full border border-slate-200"
                    />
                    <span className="font-medium text-slate-800">
                      {member.name}
                    </span>
                  </td>

                  {/* Email — truncated with "..." if it's too long */}
                  <td className="px-6 py-4 truncate max-w-[150px]">
                    {member.email}
                  </td>

                  {/* Gender — shows "N/A" if not provided */}
                  <td className="px-6 py-4">{member.gender || "N/A"}</td>

                  {/* Blood Group in a small red badge */}
                  <td className="px-6 py-4">
                    {/*
                     * member.blood_group || member.bloodGroup handles two possible
                     * API field naming conventions (snake_case vs camelCase).
                     */}
                    <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-semibold border border-red-100 whitespace-nowrap">
                      {member.blood_group || member.bloodGroup || "N/A"}
                    </span>
                  </td>

                  {/* Status badge — green for Active, gray for Inactive */}
                  <td className="px-6 py-4">
                    {/*
                     * This determines the badge color using a complex ternary:
                     *   - Checks multiple ways a member might be "active"
                     *     (different API response formats)
                     *   - If active: Green background (bg-[#60d62a])
                     *   - If not: Gray background (bg-slate-200)
                     *
                     * The ?. is OPTIONAL CHAINING — safely calls .toLowerCase()
                     * even if member.status is null/undefined.
                     */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        member.status === "Active" ||
                        member.status?.toLowerCase() === "active" ||
                        member.is_active
                          ? "bg-[#60d62a] text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {member.status ||
                        (member.is_active ? "Active" : "Inactive")}
                    </span>
                  </td>

                  {/* Action buttons — Edit and Delete */}
                  {true && (
                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                      {/*
                       * EDIT button — navigates to the member's edit page.
                       *
                       * e.stopPropagation() is CRITICAL here! Without it,
                       * clicking the Edit button would ALSO trigger the row's
                       * onClick (opening the modal). stopPropagation stops
                       * the click event from "bubbling up" to the parent <tr>.
                       */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/members/${member.id}`);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 transition-colors"
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </button>

                      {/* DELETE button — deletes the member after confirmation */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(member.id);
                        }}
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

      {/*
       * ===== MEMBER DETAILS MODAL =====
       * This modal is always in the DOM but only becomes visible when
       * isModalOpen is true. We pass the selected member data and
       * a close handler as props.
       *
       * The arrow function () => setIsModalOpen(false) is an inline function
       * that sets the modal state to closed. This pattern avoids creating
       * a separate named function for simple state changes.
       */}
      <MemberDetailsModal
        member={selectedMember}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
