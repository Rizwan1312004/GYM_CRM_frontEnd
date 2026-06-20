/**
 * ============================================================================
 * MemberPanel.jsx — Member Search & Information Panel (Attendance Page)
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 *   This component provides a search-based member lookup panel, typically
 *   used on the Attendance page. An admin can search for a member by name,
 *   view their profile info, subscriptions, and branches, and open a full
 *   profile modal. Think of it as a "look up a member" widget.
 *
 * REACT CONCEPTS USED:
 *   - useState: Manages search query, search results, loading, and modal state.
 *   - Async/Await: The search handler is an async function that waits for
 *     the API response before continuing.
 *   - Controlled Components: The search input's value is controlled by React state.
 *   - Conditional Rendering: Shows different content based on whether a member
 *     is selected, the search is in progress, etc.
 *   - Optional Chaining (?.): Safely accesses nested properties that might
 *     not exist without crashing the app.
 *
 * HOW IT FITS IN THE APP:
 *   This panel is used on the Attendance page. The workflow is:
 *   1. Admin types a member's name in the search box
 *   2. The component searches the API
 *   3. If found, the member's info appears in the panel below
 *   4. Admin can view the full profile or log attendance
 *
 * LIBRARIES USED:
 *   - api (custom Axios instance): For making HTTP requests to the backend.
 *   - react-hot-toast: For showing success/error popup notifications.
 *   - lucide-react: Icons (X for clear/close, Clock for dates, ChevronDown unused).
 *   - MemberDetailsModal: A child component that shows the full member profile.
 * ============================================================================
 */

/* Import React and the useState hook for managing component state */
import React, { useState } from "react";

/* Import icons: X (close/clear), Clock (time), ChevronDown (dropdown arrow) */
import { X, Clock, ChevronDown } from "lucide-react";

/* Import the pre-configured API client for backend communication */
import api from "../services/api";

/* Import toast for showing popup notifications */
import toast from "react-hot-toast";

/* Import the modal component for viewing full member details */
import MemberDetailsModal from "./MemberDetailsModal";

/**
 * MemberPanel — A search-and-display panel for finding gym members.
 *
 * PROPS IT RECEIVES:
 *   None — this component manages its own state internally.
 *
 * WHAT IT RETURNS:
 *   Two card sections:
 *   1. A "Member Login" card with a search input
 *   2. A "Member Information" card that shows the found member's details
 *      or a "No member selected" placeholder
 */
function MemberPanel() {
  /*
   * ========== STATE VARIABLES ==========
   * Think of state like a whiteboard for this component.
   * Each piece of state remembers something important.
   */

  /* What the user has typed into the search box */
  const [searchQuery, setSearchQuery] = useState("");

  /* The member object returned from the API search (null if no search done yet) */
  const [selectedMember, setSelectedMember] = useState(null);

  /* Whether a search is currently in progress (shows loading skeleton) */
  const [isSearching, setIsSearching] = useState(false);

  /* Whether the full member details modal is open */
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * handleSearch — Searches for a member by name when the form is submitted.
   *
   * This is an ASYNC function — it uses "await" to pause and wait for the
   * API response before continuing. The "e.preventDefault()" stops the form
   * from doing a traditional page reload (which is the default HTML behavior).
   *
   * Step by step:
   *   1. Prevent default form submission (no page reload)
   *   2. Ignore empty searches (trim removes whitespace)
   *   3. Set loading state to true (shows skeleton)
   *   4. Send GET request to API with search query
   *   5. Handle the response format (array vs. paginated)
   *   6. If members found, select the first one
   *   7. If not found, clear selection and show error toast
   *   8. In the "finally" block, always stop the loading indicator
   *      (finally runs whether the request succeeded OR failed)
   */
  // Simulated search function
  const handleSearch = async (e) => {
    e.preventDefault();
    /* .trim() removes whitespace from both ends of the string.
     * If the trimmed query is empty, we stop early (return exits the function). */
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      /* Send a GET request with the search query as a URL parameter */
      const res = await api.get(`/members/?search=${searchQuery}`);

      /*
       * Handle different API response formats:
       * - Some APIs return an array directly: res.data = [...]
       * - Some use pagination: res.data = { results: [...] }
       * Array.isArray() checks if something is an array.
       */
      const members = Array.isArray(res.data)
        ? res.data
        : res.data.results || [];

      if (members.length > 0) {
        /* If we found members, select the first match */
        setSelectedMember(members[0]);
      } else {
        /* No matches — clear the selected member and notify the user */
        setSelectedMember(null);
        toast.error(`Member "${searchQuery}" not found.`);
      }
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("An error occurred during search.");
    } finally {
      /*
       * "finally" always runs, whether the try succeeded or the catch caught
       * an error. This ensures we always stop the loading state.
       */
      setIsSearching(false);
    }
  };

  /**
   * handleClear — Resets the search state back to its initial values.
   * Called when the user clicks the X button in the search input.
   */
  const handleClear = () => {
    setSearchQuery("");
    setSelectedMember(null);
  };

  return (
    /* space-y-6: Adds vertical spacing (1.5rem) between the two cards */
    <div className="space-y-6">
      {/* ===== CARD 1: Member Search Box ===== */}
      {/* Member Search Box */}
      <div className="bg-white rounded-md shadow-sm border border-slate-200">
        {/* Card header with title */}
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-[15px]">
            Member Login
          </h3>
        </div>
        <div className="p-4">
          {/* Helper text */}
          <p className="text-sm text-slate-500 mb-3">
            Please search for a member to get started.
          </p>

          {/*
           * The search form. onSubmit={handleSearch} means pressing Enter
           * or clicking a submit button will call our search function.
           * "relative" positioning is needed for the X clear button to be
           * positioned absolutely inside the input.
           */}
          <form onSubmit={handleSearch} className="relative">
            {/*
             * This is a CONTROLLED INPUT — its value comes from React state
             * (searchQuery), not from the DOM. Every keystroke updates the state
             * via onChange, and the state flows back into the input's value.
             * This gives React full control over the input's content.
             */}
            <input
              type="text"
              placeholder="Search member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-slate-200 rounded p-2 pl-3 pr-8 text-sm focus:outline-none focus:border-blue-500 text-slate-700"
            />

            {/*
             * Conditional clear button — only visible when there's text.
             * The && operator: "If searchQuery is truthy (non-empty), render this."
             * type="button" prevents this from submitting the form.
             */}
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            )}
          </form>

          {/*
           * Loading skeleton — shown while the API search is in progress.
           * animate-pulse creates a pulsing fade effect to indicate loading.
           * These gray shapes mimic the layout of the actual member data.
           */}
          {isSearching && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3 animate-pulse">
                {/* Skeleton circle for avatar */}
                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  {/* Skeleton bars for name and email */}
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                </div>
              </div>
              <div className="h-16 bg-slate-200 rounded-md animate-pulse"></div>
              <div className="h-16 bg-slate-200 rounded-md animate-pulse"></div>
            </div>
          )}
        </div>
      </div>

      {/* ===== CARD 2: Member Information Panel ===== */}
      {/* Member Details Panel */}
      <div className="bg-white rounded-md shadow-sm border border-slate-200">
        {/* Card header */}
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-[15px]">
            Member Information
          </h3>
        </div>

        {/*
         * CONDITIONAL RENDERING: Shows member details if a member is selected,
         * otherwise shows a "No member selected" placeholder.
         *
         * selectedMember ? (show details) : (show placeholder)
         */}
        {selectedMember ? (
          <div className="p-5">
            {/* Member Profile Header */}
            {/* Shows avatar, name, status badge, and email */}
            <div className="flex items-center gap-3 mb-6">
              {/*
               * Avatar image with fallback to ui-avatars.com service.
               * The + operator concatenates strings (alternative to template literals).
               */}
              <img
                src={
                  selectedMember.avatar ||
                  "https://ui-avatars.com/api/?name=" +
                    encodeURIComponent(selectedMember.name)
                }
                alt={selectedMember.name}
                className="w-12 h-12 rounded-full border border-slate-200"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-800 text-[15px]">
                    {selectedMember.name}
                  </h4>
                  {/* Status badge — green for active, gray for inactive */}
                  <span
                    className={`text-white text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedMember.status === "active" ? "bg-[#60d62a]" : "bg-slate-400"}`}
                  >
                    {selectedMember.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedMember.email}
                </p>
              </div>
            </div>

            {/* ===== Subscriptions Section ===== */}
            {/* Subscriptions */}
            <h4 className="font-semibold text-slate-800 text-sm mb-3">
              Member Subscriptions
            </h4>
            {/*
             * OPTIONAL CHAINING with CONDITIONAL RENDERING:
             *
             * selectedMember.subscriptions?.length > 0
             *
             * The ?. (optional chain) safely checks:
             *   1. Does selectedMember.subscriptions exist? (not null/undefined)
             *   2. If yes, is its .length > 0?
             * If subscriptions is null/undefined, the whole expression returns
             * undefined (which is falsy), skipping the map and showing the fallback.
             */}
            {selectedMember.subscriptions?.length > 0 ? (
              selectedMember.subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="border border-slate-100 rounded-lg p-4 mb-6 shadow-sm bg-slate-50/30"
                >
                  {/* Subscription name */}
                  <h5 className="font-bold text-slate-800 text-[15px] mb-1">
                    {sub.name}
                  </h5>
                  {/* Subscription status badge */}
                  <span
                    className={`text-white text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-3 ${sub.status === "active" ? "bg-[#60d62a]" : "bg-slate-400"}`}
                  >
                    {sub.status}
                  </span>

                  {/*
                   * List of services included in the subscription plan.
                   * The ?. chain navigates: sub → plan → services → length
                   * If any part is missing, the whole expression is undefined.
                   */}
                  {sub.plan?.services?.length > 0 && (
                    <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1 mb-4">
                      {sub.plan.services.map((service, idx) => (
                        <li key={idx}>{service.name}</li>
                      ))}
                    </ul>
                  )}

                  {/* Validity date with clock icon */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <Clock size={14} />
                    Valid Until: {sub.valid_until}
                  </div>
                </div>
              ))
            ) : (
              /* Fallback when no subscriptions exist */
              <p className="text-sm text-slate-500 mb-6 italic">
                No active subscriptions.
              </p>
            )}

            {/* ===== Branches Section ===== */}
            {/* Branches */}
            <h4 className="font-semibold text-slate-800 text-sm mb-3">
              Member Branches
            </h4>
            {selectedMember.branches?.length > 0 ? (
              <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1 mb-8">
                {selectedMember.branches.map((branch, idx) => (
                  <li key={idx}>{branch.name}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 mb-8 italic">
                No branches assigned.
              </p>
            )}

            {/* ===== Action Buttons ===== */}
            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/*
               * "View Profile" button — opens the full member details modal.
               * rounded-full: Makes the button fully rounded (pill shape).
               */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#111827] hover:bg-slate-800 text-white text-xs font-medium py-2 px-4 rounded-full transition-colors"
              >
                View Profile
              </button>
            </div>
          </div>
        ) : (
          /* ===== EMPTY STATE — No member selected ===== */
          /* Shown before any search is performed */
          <div className="p-10 flex flex-col items-center justify-center text-center h-48">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
              <X className="text-slate-300" size={24} />
            </div>
            <p className="text-slate-500 text-sm font-medium">
              No member selected
            </p>
            <p className="text-slate-400 text-xs mt-1 max-w-[200px]">
              Use the search bar above to find and view a member's details.
            </p>
          </div>
        )}
      </div>

      {/*
       * ===== MEMBER DETAILS MODAL =====
       * This modal component sits here in the DOM but is only visible when
       * isModalOpen is true. The onClose handler resets the modal state.
       */}
      <MemberDetailsModal
        member={selectedMember}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

/* Export the MemberPanel for use in other pages (e.g., Attendance page) */
export default MemberPanel;
