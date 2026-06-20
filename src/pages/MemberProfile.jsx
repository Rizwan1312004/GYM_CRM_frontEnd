/**
 * ============================================================================
 * MemberProfile.jsx — The Edit/View Member Profile Page
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 *   This page lets gym administrators view and edit an existing member's
 *   profile. It loads the member's current data from the backend (using the
 *   member's ID from the URL), populates a form with that data, and lets the
 *   admin update any fields. It also features a drag-and-drop avatar uploader.
 *
 *   This is similar to AddMember.jsx, but with key differences:
 *     - It FETCHES existing data on load (using useEffect + API GET)
 *     - It uses PATCH (partial update) instead of POST (create new)
 *     - It has a drag-and-drop area for changing the profile photo
 *     - It shows the existing ID proof image with an option to replace it
 *
 * REACT CONCEPTS USED:
 *   - useState: manages form data, loading states, and saving states
 *   - useEffect: fetches member data when the page loads
 *   - useCallback: memoizes the file drop handler (performance optimization)
 *   - useParams: extracts the member ID from the URL (e.g., /members/5)
 *   - Controlled components: every input's value is tied to React state
 *   - Conditional rendering: showing different UI based on loading/data state
 *   - instanceof: checking if a value is a File object vs. a URL string
 *
 * HOW IT FITS INTO THE APP:
 *   This page is rendered at "/members/:id" (where :id is a dynamic parameter).
 *   Users navigate here from the MembersTable by clicking on a member's name
 *   or an edit button. After updating, the user is redirected to "/members".
 *
 * LIBRARIES USED:
 *   - React (useState, useEffect, useCallback): Core hooks for state and effects
 *   - react-router-dom (useParams, useNavigate): URL params and navigation
 *   - react-select (Select): Fancy dropdown components
 *   - react-dropzone (useDropzone): Drag-and-drop file upload functionality
 *   - api (custom Axios): HTTP requests to the backend
 *   - react-hot-toast (toast): Popup notification messages
 * ============================================================================
 */

// --- React and Hook Imports ---
// useState: store and update values that affect what's displayed
// useEffect: run code when the component loads or when dependencies change
// useCallback: memorize a function so it's not recreated on every render
//   (a performance optimization, especially useful when passed as a prop)
import React, { useState, useEffect, useCallback } from "react";

// --- React Router Imports ---
// useParams: extracts URL parameters (e.g., the 'id' from /members/:id)
// useNavigate: programmatic navigation (redirect the user to another page)
import { useParams, useNavigate } from "react-router-dom";

// --- React Select Import ---
// A feature-rich dropdown component. See AddMember.jsx for more details.
import Select from "react-select";

// --- API Service Import ---
// Pre-configured Axios instance for making HTTP requests to our backend.
import api from "../services/api";

// --- Toast Notification Import ---
// Shows small popup messages for success/error feedback.
import toast from "react-hot-toast";

// --- React Dropzone Import ---
// useDropzone provides drag-and-drop file upload functionality.
// It gives us props to spread onto a container div, making it a "drop zone"
// where users can drag files from their computer.
import { useDropzone } from "react-dropzone";

/**
 * MemberProfile Component
 *
 * Displays and edits an existing member's profile. No props needed — it gets
 * the member ID from the URL using useParams.
 *
 * Returns: A form card with all member fields pre-populated from the backend,
 *          plus a drag-and-drop avatar uploader and ID proof section.
 */
export default function MemberProfile() {
  // -------------------------------------------------------------------------
  // URL PARAMETERS AND NAVIGATION
  // -------------------------------------------------------------------------

  /**
   * useParams extracts dynamic segments from the URL.
   * If the route is defined as "/members/:id" and the URL is "/members/42",
   * then { id } will be "42".
   *
   * We use destructuring: const { id } = useParams();
   * This is the same as: const id = useParams().id;
   */
  const { id } = useParams();

  /**
   * useNavigate returns a function for programmatic navigation.
   * Example: navigate("/members") redirects to the members list.
   */
  const navigate = useNavigate();

  // -------------------------------------------------------------------------
  // FORM STATE
  // -------------------------------------------------------------------------
  /**
   * formData: Holds all the member's profile fields. Initially populated
   * with placeholder values, then overwritten with real data from the API.
   *
   * Note: avatar and idProof can be:
   *   - null: no image set yet
   *   - string: a URL to the existing image on the server
   *   - File object: a new file the user just selected/dropped
   */
  const [formData, setFormData] = useState({
    name: "Admin",
    email: "admin@admin.com",
    admissionNo: "",
    status: "Active",
    contactNumber: "",
    address: "",
    city: "",
    state: "",
    bloodGroup: null,
    gender: null,
    subscribeNewsletter: false,
    dateOfBirth: "",
    avatar: null,
    idProof: null,
  });

  /**
   * isLoading: True while we're fetching the member's data from the server.
   * When true, we show a "Loading member data..." message instead of the form.
   */
  const [isLoading, setIsLoading] = useState(false);

  /**
   * isSaving: True while the form is being submitted to the server.
   * Used to disable the submit button and show "Submitting..." text.
   */
  const [isSaving, setIsSaving] = useState(false);

  // -------------------------------------------------------------------------
  // DRAG-AND-DROP AVATAR UPLOAD
  // -------------------------------------------------------------------------
  /**
   * onDrop — Called when the user drops a file onto the avatar drop zone.
   *
   * useCallback wraps this function to "memoize" it — React will reuse the
   * same function reference across re-renders instead of creating a new one
   * each time. This is a performance optimization, especially important here
   * because useDropzone takes this as a dependency.
   *
   * The empty [] dependency array means: "create this function once and never
   * recreate it" (because it doesn't depend on any changing values).
   *
   * acceptedFiles?.length > 0 uses optional chaining (?.) — if acceptedFiles
   * is null or undefined, it won't crash. It just returns undefined instead
   * of throwing an error.
   */
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      // Take the first file from the dropped files and save it as the avatar
      setFormData((prev) => ({ ...prev, avatar: acceptedFiles[0] }));
    }
  }, []);

  /**
   * useDropzone hook — Provides everything needed for drag-and-drop file upload.
   *
   * Returns an object with:
   *   - getRootProps(): Props to spread onto the container div (makes it a drop zone)
   *   - getInputProps(): Props to spread onto a hidden <input type="file">
   *   - isDragActive: Boolean that's true when the user is hovering a file over the zone
   *
   * Configuration:
   *   - onDrop: Our handler function (defined above)
   *   - accept: Only accept image files (MIME type "image/*")
   *   - multiple: false = only accept one file at a time
   */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  // -------------------------------------------------------------------------
  // DROPDOWN OPTIONS
  // -------------------------------------------------------------------------
  // These arrays define the choices available in each dropdown.
  // Same pattern as AddMember.jsx — each option has { value, label }.

  // Options for the status dropdown
  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  // Options for blood group dropdown
  const bloodGroupOptions = [
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
  ];

  // Options for gender dropdown
  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ];

  // -------------------------------------------------------------------------
  // FETCH MEMBER DATA ON PAGE LOAD
  // -------------------------------------------------------------------------
  // Simulating Fetch
  /**
   * This useEffect runs when the component mounts AND whenever 'id' changes.
   * [id] in the dependency array means "re-run this effect if 'id' changes."
   *
   * It fetches the member's existing data from the server and populates
   * the form fields. This is what makes it an "edit" form — it starts
   * pre-filled with the member's current information.
   *
   * The spread operator ({ ...prev, ...res.data }) merges the server data
   * INTO the existing formData. This means:
   *   - Fields that exist in res.data will be overwritten with server values
   *   - Fields that DON'T exist in res.data will keep their default values
   */
  useEffect(() => {
    setIsLoading(true);
    api
      .get(`/members/${id}/`)
      .then((res) => {
        // Only set data if found
        if (res.data) setFormData((prev) => ({ ...prev, ...res.data }));
      })
      .catch((err) => toast.error("Failed to fetch member details."))
      .finally(() => setIsLoading(false));
  }, [id]);

  // -------------------------------------------------------------------------
  // FORM SUBMISSION HANDLER (UPDATE / PATCH)
  // -------------------------------------------------------------------------
  /**
   * handleSubmit — Sends the updated member data to the backend.
   *
   * Key difference from AddMember: this uses api.patch() instead of api.post().
   *   - POST = create a brand new resource
   *   - PATCH = partially update an existing resource (only send changed fields)
   *   - PUT = completely replace an existing resource (send ALL fields)
   *
   * Special handling for avatar/idProof: If these fields contain a string
   * (which means they're existing URLs from the server, not new file uploads),
   * we SKIP them. The backend's ImageField would reject a URL string — it
   * expects either a File or nothing. We only send these if the user picked
   * a new file (which would be a File object, not a string).
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // --- VALIDATION ---
    // List of fields that must be filled before submitting
    const requiredFields = [
      "name",
      "email",
      "admissionNo",
      "status",
      "contactNumber",
      "address",
      "city",
      "state",
      "bloodGroup",
      "gender",
      "dateOfBirth",
    ];

    // .every() checks if ALL required fields have a non-empty value
    const isComplete = requiredFields.every((field) => {
      const val = formData[field];
      return val !== "" && val !== null && val !== undefined;
    });

    if (!isComplete) {
      toast.error("Please fill the form completely.");
      setIsSaving(false);
      return;
    }

    try {
      // --- BUILD FORMDATA FOR FILE UPLOAD ---
      const payload = new FormData();

      // Loop through all fields in formData
      for (const key in formData) {
        if (
          formData[key] !== null &&
          formData[key] !== undefined &&
          formData[key] !== ""
        ) {
          // If avatar or idProof are strings (existing URLs), it's best not to append them,
          // DRF will complain if we send a string URL to an ImageField in update.
          // Only append if it's a File object
          if (
            (key === "avatar" || key === "idProof" || key === "id_proof") &&
            typeof formData[key] === "string"
          ) {
            // 'continue' skips to the next iteration of the for loop,
            // effectively skipping this field
            continue;
          }
          payload.append(key, formData[key]);
        }
      }

      // --- SEND PATCH REQUEST ---
      // api.patch() sends only the fields we include, leaving others unchanged on the server
      await api.patch(`/members/${id}/`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Member profile updated successfully!");
      navigate("/members");
    } catch (error) {
      toast.error("Failed to update profile.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------------------------------------------------------
  // FORM RESET HANDLER
  // -------------------------------------------------------------------------
  /**
   * handleReset — Clears some (not all) form fields back to empty values.
   *
   * Note: This only resets certain fields (contact, address, city, state,
   * bloodGroup, gender, newsletter). Name, email, and other fields are kept.
   * In a production app, you'd typically re-fetch the original data from
   * the server instead of just clearing fields.
   */
  const handleReset = () => {
    // In a real app you'd revert to original server data here.
    if (window.confirm("Are you sure you want to reset the form?")) {
      setFormData((prev) => ({
        ...prev, // Keep all existing values...
        // ...but overwrite these specific fields with empty/default values:
        contactNumber: "",
        address: "",
        city: "",
        state: "",
        bloodGroup: null,
        gender: null,
        subscribeNewsletter: false,
      }));
    }
  };

  // -------------------------------------------------------------------------
  // INPUT CHANGE HANDLER
  // -------------------------------------------------------------------------
  /**
   * handleChange — Universal handler for standard HTML inputs.
   * Same pattern as AddMember.jsx — handles text, checkbox, and file inputs.
   * See AddMember.jsx for a detailed explanation of this pattern.
   */
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  // -------------------------------------------------------------------------
  // REACT-SELECT CHANGE HANDLER
  // -------------------------------------------------------------------------
  /**
   * handleSelectChange — Handles dropdown selection changes from react-select.
   * Extracts just the 'value' string from the selected option object.
   */
  const handleSelectChange = (name, selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : "",
    }));
  };

  // -------------------------------------------------------------------------
  // CUSTOM REACT-SELECT STYLES
  // -------------------------------------------------------------------------
  // Custom react-select styles matching Tailwind
  /**
   * Custom styling for react-select dropdowns to match our Tailwind theme.
   * See AddMember.jsx for a detailed explanation of this pattern.
   */
  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#f1f5f9", // slate-100
      borderColor: state.isFocused ? "#3b82f6" : "#cbd5e1",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      borderRadius: "0.375rem",
      minHeight: "42px",
      "&:hover": {
        borderColor: "#94a3b8",
      },
    }),
  };

  // -------------------------------------------------------------------------
  // LOADING STATE — Early return
  // -------------------------------------------------------------------------
  /**
   * If we're still fetching member data, show a simple loading message
   * and DON'T render the form at all. This is called an "early return" —
   * we exit the component early before reaching the main JSX.
   */
  if (isLoading) {
    return <div className="p-6 text-slate-500">Loading member data...</div>;
  }

  // -------------------------------------------------------------------------
  // JSX RETURN — The profile edit form UI
  // -------------------------------------------------------------------------
  return (
    // Outer container with responsive padding and centered max-width
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full">
      {/* White card container */}
      <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6 md:p-8">
        <h2 className="text-[#1e293b] text-xl font-semibold mb-6">
          Member Profile
        </h2>

        {/* ========== AVATAR DRAG-AND-DROP SECTION ========== */}
        {/* Change Avatar Row */}
        {/* This section shows the current avatar with a drag-and-drop overlay.
            flex-col on mobile (stacked), flex-row on sm+ (side by side).
            pb-8 border-b = bottom padding and border to separate from the form. */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 pb-8 border-b border-slate-100">
          {/* ---------- DROP ZONE CONTAINER ---------- */}
          {/* {...getRootProps()} spreads all the drag-and-drop event handlers
              onto this div. This is the "spread operator" pattern — getRootProps()
              returns an object like { onDragEnter, onDragLeave, onDrop, onClick, ... }
              and the ... spreads them all as individual props on the div. */}
          <div
            {...getRootProps()}
            // Dynamic className using template literal:
            // When isDragActive is true (user is hovering a file), show blue border
            // When false, show dashed gray border
            className={`w-32 h-32 rounded-full overflow-hidden border-2 flex shrink-0 items-center justify-center relative cursor-pointer outline-none transition-all duration-300 ${
              isDragActive
                ? "border-blue-500 bg-blue-50 scale-105 shadow-xl shadow-blue-500/20"
                : "border-dashed border-slate-300 hover:border-blue-400 bg-slate-50"
            }`}
          >
            {/* Hidden file input — getInputProps() adds type="file", onChange, etc. */}
            <input {...getInputProps()} name="avatar" />

            {/* ---------- AVATAR IMAGE ---------- */}
            {/* The src uses a chain of checks:
                1. If avatar is a File object (user just dropped/selected a new file):
                   → Create a temporary preview URL using URL.createObjectURL()
                2. If avatar is a string (existing URL from the server):
                   → Use that URL directly
                3. If avatar is null/undefined (no photo at all):
                   → The || (OR) operator falls through to a placeholder URL
                   → ui-avatars.com generates a colored avatar with the person's initials
                   → encodeURIComponent() makes the name URL-safe (spaces → %20, etc.) */}
            <img
              src={
                formData.avatar instanceof File
                  ? URL.createObjectURL(formData.avatar)
                  : formData.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`
              }
              alt={formData.name}
              className="w-full h-full object-cover"
            />

            {/* ---------- HOVER OVERLAY ---------- */}
            {/* This dark overlay appears when you hover over the avatar.
                opacity-0 = invisible by default
                hover:opacity-100 = fully visible on hover
                backdrop-blur-sm = slight blur effect on the image underneath */}
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
              <span className="text-white text-xs font-semibold tracking-wide uppercase">
                {/* Show different text based on whether user is dragging a file */}
                {isDragActive ? "Drop here!" : "Change"}
              </span>
            </div>
          </div>

          {/* Upload instructions text */}
          <div>
            <p className="text-base font-semibold text-slate-800 mb-1">
              Upload Profile Photo
            </p>
            <p className="text-sm text-slate-500 max-w-[280px]">
              Drag and drop an image here, or click to browse files. Recommended
              size: 256x256px.
            </p>
          </div>
        </div>

        {/* ========== MEMBER EDIT FORM ========== */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ---------- NAME FIELD ---------- */}
          {/* Name */}
          <div>
            <label className="block text-sm text-slate-600 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-[#f1f5f9] border border-[#cbd5e1] rounded-md py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* ---------- EMAIL & ADMISSION NO ---------- */}
          {/* Email & Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#f1f5f9] border border-[#cbd5e1] rounded-md py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Admission No
              </label>
              {/* formData.admissionNo || "" uses the OR operator to provide a
                  fallback empty string if admissionNo is null or undefined.
                  This prevents React from switching between controlled/uncontrolled
                  input modes, which would cause a console warning. */}
              <input
                type="text"
                name="admissionNo"
                value={formData.admissionNo || ""}
                onChange={handleChange}
                className="w-full bg-[#f1f5f9] border border-[#cbd5e1] rounded-md py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="ADM-001"
              />
            </div>
          </div>

          {/* ---------- STATUS DROPDOWN ---------- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Status
              </label>
              <Select
                value={statusOptions.find((o) => o.value === formData.status)}
                onChange={(option) => handleSelectChange("status", option)}
                options={statusOptions}
                styles={customStyles}
                isSearchable={false}
              />
            </div>
          </div>

          {/* ---------- CONTACT NUMBER & DATE OF BIRTH ---------- */}
          {/* Contact Number & Date of Birth Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Contact Number
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full bg-slate-100 border border-slate-300 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full bg-slate-100 border border-slate-300 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* ---------- ADDRESS ---------- */}
          {/* Address */}
          <div>
            <label className="block text-sm text-slate-600 mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full bg-slate-100 border border-slate-300 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* ---------- CITY & STATE ---------- */}
          {/* City & State Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-slate-600 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full bg-slate-100 border border-slate-300 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full bg-slate-100 border border-slate-300 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* ---------- BLOOD GROUP & GENDER DROPDOWNS ---------- */}
          {/* Blood Group & Gender Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Blood Group
              </label>
              <Select
                value={bloodGroupOptions.find(
                  (o) => o.value === formData.bloodGroup,
                )}
                onChange={(option) => handleSelectChange("bloodGroup", option)}
                options={bloodGroupOptions}
                styles={customStyles}
                placeholder="Select Blood Group"
                isClearable
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Gender
              </label>
              <Select
                value={genderOptions.find((o) => o.value === formData.gender)}
                onChange={(option) => handleSelectChange("gender", option)}
                options={genderOptions}
                styles={customStyles}
                placeholder="Select Gender"
                isClearable
              />
            </div>
          </div>

          {/* ========== ID PROOF SECTION ========== */}
          {/* ID Proof Display / Upload */}
          {/* This section handles both DISPLAYING the existing ID proof image
              and providing an UPLOAD button to replace it. */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4 mt-6">
            <h4 className="text-sm font-semibold text-slate-800 mb-3">
              ID Proof
            </h4>

            {/* --- Show existing ID proof image (if it's a URL string) --- */}
            {/* This conditional renders ONLY if:
                1. formData.idProof exists (not null/undefined), AND
                2. It's a string (a URL from the server, not a File object)
                The && operator chains both conditions together. */}
            {formData.idProof && typeof formData.idProof === "string" && (
              <div className="mb-4">
                {/* Clicking the image opens it in a new tab at full size.
                    target="_blank" = open in new tab
                    rel="noopener noreferrer" = security best practice for external links */}
                <a
                  href={formData.idProof}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={formData.idProof}
                    alt="ID Proof"
                    className="h-32 object-cover rounded shadow-sm border border-slate-200 hover:opacity-90"
                  />
                </a>
                <p className="text-xs text-slate-500 mt-2">
                  Click image to view full size
                </p>
              </div>
            )}

            {/* --- Show newly selected file name (if it's a File object) --- */}
            {/* instanceof File checks if the value is a browser File object
                (i.e., the user just selected a new file to upload).
                This lets the user know their new file has been recognized. */}
            {formData.idProof instanceof File && (
              <div className="mb-4 text-sm text-green-600 font-medium">
                Selected new ID Proof to upload: {formData.idProof.name}
              </div>
            )}

            {/* --- File upload input to replace ID proof --- */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                Update ID Proof
              </label>
              <input
                type="file"
                name="idProof"
                accept="image/*"
                onChange={handleChange}
                className="w-full text-sm text-slate-500 py-1 file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-colors"
              />
            </div>
          </div>

          {/* ========== ACTION BUTTONS ========== */}
          {/* Actions */}
          <div className="flex justify-between items-center pt-8 border-t border-slate-100 mt-8">
            {/* Left side: Cancel and Reset buttons grouped together */}
            <div className="flex gap-3">
              {/* Cancel — navigates back to members list without saving */}
              <button
                type="button"
                onClick={() => navigate("/members")}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2 px-6 rounded-full text-sm transition-colors shadow-sm"
              >
                Cancel
              </button>

              {/* Reset — clears certain form fields (see handleReset above) */}
              <button
                type="button"
                onClick={handleReset}
                className="bg-[#e91e63] hover:bg-[#d81b60] text-white font-medium py-2 px-6 rounded-full text-sm transition-colors shadow-sm"
              >
                Reset
              </button>
            </div>

            {/* Right side: Submit button */}
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium py-2 px-6 rounded-full text-sm transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {/* Ternary: show "Submitting..." while saving, "Submit" otherwise */}
              {isSaving ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
