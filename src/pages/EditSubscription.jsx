/**
 * ============================================================================
 * EditSubscription.jsx — Edit an Existing Subscription Page
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 *   This page lets gym staff EDIT an existing subscription. It loads the
 *   current subscription data from the server, pre-fills the form, and
 *   lets the user change the member, package, or status. When saved,
 *   it sends a PUT request to update the record on the backend.
 *
 * REACT CONCEPTS USED:
 *   - useState: to manage form values, dropdown options, and loading states
 *   - useEffect: to fetch the existing subscription + members + packages on load
 *   - useParams: to read the subscription ID from the URL (e.g., /edit/42)
 *   - Promise.all: to fetch 3 API endpoints simultaneously
 *   - Conditional rendering: showing a spinner while data loads
 *   - Controlled components: form inputs driven by React state
 *
 * HOW IT FITS IN THE GYM CRM APP:
 *   Users get here by clicking "Edit" on a subscription row in SubscriptionsList.
 *   The URL looks like /subscriptions/edit/42 where 42 is the subscription ID.
 *   After saving, the user is redirected back to the subscriptions list.
 *
 * KEY DIFFERENCE FROM AddSubscription.jsx:
 *   - Uses useParams() to get the ID from the URL
 *   - Fetches the EXISTING subscription data and pre-fills the form
 *   - Uses api.put() instead of api.post() to UPDATE rather than CREATE
 *   - Has an extra loading state (isLoading) for the initial data fetch
 *
 * LIBRARIES USED:
 *   - react-router-dom: useNavigate (navigation) + useParams (URL params)
 *   - react-select: searchable dropdown components
 *   - react-hot-toast: popup notifications
 *   - ../services/api: pre-configured Axios HTTP client
 * ============================================================================
 */

// React core and hooks
import React, { useState, useEffect } from "react";

// useNavigate: for programmatic page navigation
// useParams: for extracting URL parameters (like the subscription ID)
//   Example URL: /subscriptions/edit/42 → useParams() returns { id: "42" }
import { useNavigate, useParams } from "react-router-dom";

// react-select — a feature-rich dropdown with search, clear, and custom styling.
import Select from "react-select";

// Pre-configured Axios instance for API calls.
import api from "../services/api";

// Toast notifications — little popup messages for user feedback.
import toast from "react-hot-toast";

/**
 * EditSubscription Component
 *
 * This component renders a pre-filled form for editing an existing subscription.
 * It reads the subscription ID from the URL, fetches the current data,
 * and lets the user modify and save it.
 *
 * Props: none (reads ID from URL via useParams)
 * Returns: A loading spinner while fetching, then a form card with
 *          Member, Package, and Status dropdowns.
 */
export default function EditSubscription() {
  // useParams() reads dynamic segments from the URL.
  // If the route is defined as "/subscriptions/edit/:id" and the URL is
  // "/subscriptions/edit/42", then { id } will be "42".
  // We use destructuring: const { id } = useParams() extracts just the "id" property.
  const { id } = useParams();

  // Navigation function for redirecting after save or cancel.
  const navigate = useNavigate();

  // --- FORM STATE ---
  // Same structure as AddSubscription, but the values will be filled from the
  // existing subscription data fetched from the API.
  const [formData, setFormData] = useState({
    member: null,
    plan_id: null,
    status: "active",
  });

  // --- DROPDOWN OPTIONS ---
  // Arrays of { value, label } objects for the react-select dropdowns.
  const [members, setMembers] = useState([]);
  const [packages, setPackages] = useState([]);

  // isSaving: true while the update request is in progress.
  const [isSaving, setIsSaving] = useState(false);

  // isLoading: true while we're fetching the existing subscription + dropdown data.
  // Unlike AddSubscription, we need to load the CURRENT subscription values too,
  // so we show a spinner until everything is ready.
  const [isLoading, setIsLoading] = useState(true);

  // Status Option
  // Hardcoded dropdown options — subscriptions are either active or inactive.
  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  /**
   * useEffect — Fetches all required data when the component mounts.
   *
   * Unlike AddSubscription which only fetches members + packages,
   * this also fetches the SPECIFIC subscription (by ID) so we can
   * pre-fill the form with its current values.
   *
   * The dependency array [id] means this re-runs if the ID in the URL changes
   * (unlikely in practice, but good practice to include).
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Promise.all fires 3 API calls simultaneously:
        // 1. Get all members (for the member dropdown)
        // 2. Get all packages (for the package dropdown)
        // 3. Get THIS specific subscription's current data (to pre-fill the form)
        //
        // Array destructuring unpacks the 3 responses into named variables.
        const [membersRes, packagesRes, subRes] = await Promise.all([
          api.get(`/members/`),
          api.get(`/packages/`),
          api.get(`/subscriptions/${id}/`),
        ]);

        // Transform members into react-select format { value, label }
        // The ?. (optional chaining) safely handles cases where .results
        // might not exist on the response data.
        setMembers(
          (membersRes.data?.results || membersRes.data || []).map((m) => ({
            value: m.id,
            label: m.name || m.email || `Member #${m.id}`,
          })),
        );

        // Transform packages into react-select format
        setPackages(
          (packagesRes.data?.results || packagesRes.data || []).map((p) => ({
            value: p.id,
            label: p.name || `Package #${p.id}`,
          })),
        );

        // Pre-fill the form with the existing subscription's data.
        // subRes.data contains the current subscription object from the server.
        const subData = subRes.data;
        setFormData({
          member: subData.member,
          // The plan might come as a nested object { id: 1, name: "Gold" }
          // or as a direct ID. We handle both cases with a ternary.
          plan_id: subData.plan ? subData.plan.id : null,
          status: subData.status,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        // Whether the fetch succeeded or failed, stop showing the loading spinner.
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  /**
   * handleSubmit — Called when the form is submitted to update the subscription.
   *
   * Very similar to AddSubscription's handleSubmit, but uses api.put() instead
   * of api.post(). PUT means "replace the entire resource with this new data".
   *
   * @param {Event} e - The form submit event
   */
  const handleSubmit = async (e) => {
    // Prevent default browser form submission (page reload)
    e.preventDefault();

    // Validate required fields
    if (!formData.member || !formData.plan_id) {
      toast.error("Please select a Member and a Package.");
      return;
    }

    setIsSaving(true);
    try {
      // HTTP PUT request — updates the subscription with the given ID.
      // PUT replaces the full resource; PATCH would update only specific fields.
      await api.put(`/subscriptions/${id}/`, formData);
      toast.success("Subscription updated successfully!");
      navigate("/subscriptions");
    } catch (error) {
      toast.error("Failed to update subscription.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * handleSelectChange — Reusable handler for all react-select dropdowns.
   *
   * Same pattern as in AddSubscription:
   * Uses the spread operator (...prev) to copy existing form data,
   * then uses a computed property name [name] to update just one field.
   *
   * @param {string} name - The form field to update (e.g., "member")
   * @param {Object|null} selectedOption - The selected { value, label } or null
   */
  const handleSelectChange = (name, selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : null,
    }));
  };

  // Custom react-select styles matching Tailwind
  // These override react-select's default appearance to match our app's design.
  // The "control" key styles the main input/button area of the dropdown.
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

  // --- EARLY RETURN: LOADING STATE ---
  // If we're still fetching data, show a spinning loader instead of the form.
  // This is an "early return" pattern — the function exits here and never
  // reaches the main JSX below. Once isLoading becomes false, this is skipped.
  if (isLoading) {
    return (
      <div className="p-10 flex justify-center items-center h-[50vh]">
        {/* A CSS-only spinner: a circle with only one border side colored,
            rotated continuously by the animate-spin Tailwind class */}
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // --- MAIN JSX RETURN (only reached when isLoading is false) ---
  return (
    // Outer container — same responsive padding + max-width as AddSubscription
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full">

      {/* White card for the form */}
      <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6 md:p-8">

        {/* Title showing "Edit Subscription" with the ID number.
            The {" "} is a JSX way to add a space between elements. */}
        <h2 className="text-[#1e293b] text-xl font-semibold mb-6 pb-4 border-b border-slate-100 flex items-center gap-3">
          Edit Subscription{" "}
          {/* Small, muted text showing the subscription ID for reference */}
          <span className="text-slate-400 text-sm font-normal">#{id}</span>
        </h2>

        {/* Form — same structure as AddSubscription but pre-filled with existing data */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ---- ROW 1: Member + Package dropdowns ---- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Member Dropdown — pre-filled with the subscription's current member */}
            <div>
              <label className="block text-sm text-slate-600 mb-1 font-medium">
                Member
              </label>
              {/* The "value" prop uses .find() to locate the matching option
                  from the members array. This is what "pre-fills" the dropdown. */}
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

            {/* Package Dropdown — pre-filled with the subscription's current package */}
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

          {/* ---- ROW 2: Status dropdown only (no start date on edit) ---- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-slate-600 mb-1 font-medium">
                Status
              </label>
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
          </div>

          {/* ---- FORM FOOTER: Cancel and Update buttons ---- */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-8">

            {/* Cancel button — type="button" prevents form submission */}
            <button
              type="button"
              onClick={() => navigate("/subscriptions")}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-6 rounded-lg text-sm transition-colors shadow-sm"
            >
              Cancel
            </button>

            {/* Update button — note the text says "Update" instead of "Create" */}
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-8 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
            >
              {isSaving ? "Saving..." : "Update Subscription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
