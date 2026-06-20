/**
 * ============================================================================
 * AddSubscription.jsx — Create New Subscription Page
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 *   This page provides a form for gym staff to create a new subscription.
 *   A subscription connects a MEMBER to a PACKAGE (plan). For example,
 *   assigning "John Doe" to the "3-Month Gold Plan".
 *   The form uses searchable dropdown menus for selecting members and packages.
 *
 * REACT CONCEPTS USED:
 *   - useState: to manage form field values, dropdown options, and saving state
 *   - useEffect: to fetch members and packages from the API on page load
 *   - Controlled components: form inputs whose values are driven by React state
 *   - Promise.all: to fetch multiple API endpoints at the same time (in parallel)
 *   - Spread operator (...): to copy and update objects without mutating them
 *   - Computed property names ([name]): to dynamically set object keys
 *
 * HOW IT FITS IN THE GYM CRM APP:
 *   Users navigate here by clicking "Create New Subscription" on the
 *   SubscriptionsList page. After filling the form and submitting, the
 *   user is redirected back to the subscriptions list.
 *
 * LIBRARIES USED:
 *   - react-router-dom: for navigation (useNavigate)
 *   - react-select: a powerful dropdown component with search, clear, and
 *     custom styling capabilities (much better than plain <select>)
 *   - react-hot-toast: for success/error notification popups
 *   - ../services/api: pre-configured Axios instance for API calls
 * ============================================================================
 */

// React core and hooks
import React, { useState, useEffect } from "react";

// useNavigate lets us redirect the user to another page from code.
import { useNavigate } from "react-router-dom";

// react-select is a third-party dropdown component. Unlike the browser's native
// <select>, it supports searching/filtering options, clearing selections,
// and custom styling. We import its default export as "Select".
import Select from "react-select";

// Pre-configured Axios instance with the API base URL already set.
import api from "../services/api";

// toast.success() and toast.error() show small popup notifications.
import toast from "react-hot-toast";

/**
 * AddSubscription Component
 *
 * This component renders a form for creating a new subscription.
 * It doesn't receive any props — it fetches its own data (members, packages)
 * and manages its own form state internally.
 *
 * Returns: A centered card containing the subscription creation form with
 *          searchable dropdowns for Member, Package, and Status selection.
 */
export default function AddSubscription() {
  // Get the navigate function so we can redirect after saving or canceling.
  const navigate = useNavigate();

  // --- FORM STATE ---
  // formData holds the values of all form fields as a single object.
  // This is a common pattern: instead of having separate useState for each field,
  // we group them together. When we submit the form, we send this whole object.
  //
  // Initial values:
  //   member: null    — no member selected yet
  //   plan_id: null   — no package selected yet
  //   status: "active" — default status for new subscriptions
  const [formData, setFormData] = useState({
    member: null,
    plan_id: null,
    status: "active",
  });

  // --- DROPDOWN OPTIONS ---
  // These arrays hold the options for the react-select dropdowns.
  // Each option looks like { value: 1, label: "John Doe" }.
  // react-select requires this specific { value, label } format.
  const [members, setMembers] = useState([]);
  const [packages, setPackages] = useState([]);

  // isSaving: true while the form is being submitted to prevent double-clicks.
  // When true, the submit button shows "Saving..." and is disabled.
  const [isSaving, setIsSaving] = useState(false);

  // Status Option
  // These are hardcoded options for the Status dropdown — subscriptions
  // can only be "active" or "inactive", so no need to fetch from API.
  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  /**
   * useEffect — Fetch members and packages when the component mounts.
   *
   * We need to populate the dropdown menus with real data from the backend.
   * The empty dependency array [] means this runs only ONCE on first render.
   */
  useEffect(() => {
    // We define an async function inside useEffect because useEffect's
    // callback itself cannot be async (it would return a Promise, which
    // React doesn't expect). So we define and immediately call an inner function.
    const fetchData = async () => {
      try {
        // Promise.all() runs BOTH API calls at the same time (in parallel),
        // which is faster than calling them one after another.
        // It returns an array of responses in the same order as the promises.
        //
        // Array destructuring: const [a, b] = [response1, response2]
        // This unpacks the array so membersRes = first response, packagesRes = second.
        const [membersRes, packagesRes] = await Promise.all([
          api.get(`/members/`),
          api.get(`/packages/`),
        ]);

        // Transform raw API data into the { value, label } format react-select needs.
        //
        // membersRes.data?.results — the ?. is "optional chaining":
        //   If membersRes.data is null/undefined, it safely returns undefined
        //   instead of throwing an error. It's like saying:
        //   "If data exists AND has a results property, use it."
        //
        // || membersRes.data || [] — fallback chain:
        //   Try .results first, then the raw data, then an empty array.
        //
        // .map() transforms each member object into a dropdown option:
        //   { value: m.id, label: "John Doe" }
        //   The label tries m.name first, then m.email, then a fallback.
        setMembers(
          (membersRes.data?.results || membersRes.data || []).map((m) => ({
            value: m.id,
            label: m.name || m.email || `Member #${m.id}`,
          })),
        );

        // Same transformation for packages.
        setPackages(
          (packagesRes.data?.results || packagesRes.data || []).map((p) => ({
            value: p.id,
            label: p.name || `Package #${p.id}`,
          })),
        );
      } catch (error) {
        console.error("Error fetching dependencies:", error);
      }
    };

    // Call the async function we just defined.
    fetchData();
  }, []);

  /**
   * handleSubmit — Called when the form is submitted.
   *
   * Step by step:
   * 1. Prevent the default browser form submission (which would reload the page)
   * 2. Validate that both member and package are selected
   * 3. Send a POST request to create the subscription
   * 4. On success: show a toast and redirect to the subscriptions list
   * 5. On failure: show an error toast
   * 6. "finally" block: reset isSaving regardless of success or failure
   *
   * @param {Event} e - The form submit event
   */
  const handleSubmit = async (e) => {
    // e.preventDefault() stops the browser's default behavior of reloading
    // the page when a form is submitted. In React, we handle forms ourselves.
    e.preventDefault();

    // Validation: make sure required fields are filled.
    // The ! operator means "not" — so !formData.member means "member is empty/null".
    if (!formData.member || !formData.plan_id) {
      toast.error("Please select a Member and a Package.");
      return; // Stop here, don't submit the form
    }

    // Show "Saving..." on the button and disable it to prevent double-clicks.
    setIsSaving(true);
    try {
      // Send an HTTP POST request with the form data as the request body.
      // The backend will create a new subscription record.
      await api.post(`/subscriptions/`, formData);
      toast.success("Subscription created successfully!");

      // Redirect the user back to the subscriptions list page.
      navigate("/subscriptions");
    } catch (error) {
      toast.error("Failed to create subscription.");
      console.error(error);

      // If the server sent back detailed error info, log it too.
      // error.response exists when the server responded with an error status code.
      if (error.response) {
        console.error(error.response.data);
      }
    } finally {
      // "finally" runs whether the try succeeded OR the catch ran.
      // Always re-enable the button so the user can try again if it failed.
      setIsSaving(false);
    }
  };

  /**
   * handleSelectChange — Called when any react-select dropdown value changes.
   *
   * This is a reusable handler that works for all three dropdowns (member,
   * package, status) by using the "name" parameter to know WHICH field to update.
   *
   * @param {string} name - The field name in formData (e.g., "member", "plan_id")
   * @param {Object|null} selectedOption - The selected option { value, label } or null if cleared
   */
  const handleSelectChange = (name, selectedOption) => {
    // setFormData receives a function (called a "functional update") because
    // we need the previous state to build the new state.
    //
    // ...prev — the spread operator copies ALL existing properties from prev.
    //   Think of it like photocopying a form, then writing over one field.
    //
    // [name]: value — this is a "computed property name". The square brackets
    //   mean "use the VALUE of the 'name' variable as the property key."
    //   So if name = "member", this becomes { member: selectedOption.value }
    //
    // selectedOption ? selectedOption.value : null — ternary operator:
    //   If the user selected something, use its value. If they cleared it, use null.
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : null,
    }));
  };

  /**
   * customStyles — Custom styling for react-select dropdowns.
   *
   * react-select uses a "styles" prop where you provide functions that receive
   * the default styles (base) and the component state, and return modified styles.
   * This lets us match the dropdowns to our Tailwind-based design.
   *
   * Colors used:
   *   #f1f5f9 = slate-100 (light gray background)
   *   #3b82f6 = blue-500 (focused border color)
   *   #cbd5e1 = slate-300 (default border color)
   *   #94a3b8 = slate-400 (hover border color)
   */
  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#f1f5f9",
      borderColor: state.isFocused ? "#3b82f6" : "#cbd5e1",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      borderRadius: "0.375rem",
      minHeight: "42px",
      "&:hover": {
        borderColor: "#94a3b8",
      },
    }),
  };

  // --- JSX RETURN ---
  return (
    // Outer container with responsive padding and max-width for readability
    // max-w-4xl = narrower than the list page since forms don't need as much width
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full">

      {/* White card container for the form */}
      <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6 md:p-8">

        {/* Page title with a bottom border separator */}
        <h2 className="text-[#1e293b] text-xl font-semibold mb-6 pb-4 border-b border-slate-100">
          Create New Subscription
        </h2>

        {/* The <form> element wraps all inputs. onSubmit fires when the user
            clicks the submit button or presses Enter.
            space-y-6 adds vertical spacing between child elements. */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ---- ROW 1: Member + Package dropdowns side by side ---- */}
          {/* grid grid-cols-1 md:grid-cols-2 = 1 column on mobile, 2 on medium+ screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Member Dropdown */}
            <div>
              <label className="block text-sm text-slate-600 mb-1 font-medium">
                Member
              </label>
              {/* react-select's <Select> component:
                  - options: the array of { value, label } items to show in the dropdown
                  - value: the currently selected option (found by matching formData.member)
                  - onChange: fires when the user picks an option
                  - isClearable: shows an "x" to clear the selection
                  - isSearchable: lets the user type to filter options */}
              <Select
                options={members}
                value={members.find((o) => o.value === formData.member) || null}
                onChange={(option) => handleSelectChange("member", option)}
                styles={customStyles}
                placeholder="Search Member..."
                isClearable
                isSearchable
              />
            </div>

            {/* Package Dropdown */}
            <div>
              <label className="block text-sm text-slate-600 mb-1 font-medium">
                Package
              </label>
              <Select
                options={packages}
                value={
                  packages.find((o) => o.value === formData.plan_id) || null
                }
                onChange={(option) => handleSelectChange("plan_id", option)}
                styles={customStyles}
                placeholder="Select Package..."
                isClearable
                isSearchable
              />
            </div>
          </div>

          {/* ---- ROW 2: Status + Start Date ---- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Status Dropdown */}
            <div>
              <label className="block text-sm text-slate-600 mb-1 font-medium">
                Status
              </label>
              {/* isSearchable={false} because there are only 2 options,
                  no need for search functionality */}
              <Select
                options={statusOptions}
                value={
                  statusOptions.find((o) => o.value === formData.status) || null
                }
                onChange={(option) => handleSelectChange("status", option)}
                styles={customStyles}
                isSearchable={false}
              />
            </div>

            {/* Start Date — disabled/read-only field.
                The server auto-calculates the start date as "today",
                so the user can't change it. */}
            <div>
              <label className="block text-sm text-slate-600 mb-1 font-medium">
                Start Date
              </label>
              <input
                type="text"
                disabled
                value="Today (Auto-calculated)"
                className="w-full bg-slate-100 border border-slate-200 rounded-md py-2.5 px-3 text-sm text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* ---- FORM FOOTER: Cancel and Submit buttons ---- */}
          {/* pt-6 border-t = adds a top border with padding above, creating a divider */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-8">

            {/* Cancel button — type="button" is important!
                Without it, clicking Cancel would submit the form (default type is "submit").
                onClick navigates back to the subscriptions list without saving. */}
            <button
              type="button"
              onClick={() => navigate("/subscriptions")}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-6 rounded-lg text-sm transition-colors shadow-sm"
            >
              Cancel
            </button>

            {/* Submit button — type="submit" triggers the form's onSubmit handler.
                disabled={isSaving} prevents clicking while a save is in progress.
                disabled:opacity-70 makes the button look faded when disabled. */}
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-8 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
            >
              {/* Ternary: show "Saving..." while submitting, otherwise "Create Subscription" */}
              {isSaving ? "Saving..." : "Create Subscription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
