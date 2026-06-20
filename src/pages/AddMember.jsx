/**
 * ============================================================================
 * AddMember.jsx — The "Create New Member" Form Page
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 *   This page renders a form that allows gym administrators to register a new
 *   member. The form collects personal info (name, email, contact, address,
 *   etc.), files (profile photo and ID proof), and dropdown selections
 *   (status, blood group, gender). On submission, it sends all this data to
 *   the backend API as a multipart/form-data request (because of the files).
 *
 * REACT CONCEPTS USED:
 *   - useState: manages form field values, saving status
 *   - Controlled components: every input's value is tied to state, so React
 *     "controls" what the user sees in each field
 *   - Form handling: onSubmit, onChange, preventDefault
 *   - async/await: for making asynchronous API calls
 *   - FormData API: browser's built-in way to send files via HTTP
 *
 * HOW IT FITS INTO THE APP:
 *   This is a page component rendered at "/members/add". The user navigates
 *   here from the MembersList page by clicking "Create New Member". After
 *   successful submission, the user is redirected back to "/members".
 *
 * LIBRARIES USED:
 *   - React (useState): Core library for state management
 *   - react-router-dom (useNavigate): For redirecting after form submission
 *   - react-select (Select): A fancy dropdown component with search, clear, etc.
 *   - api (custom Axios instance): For making HTTP requests to the backend
 *   - react-hot-toast (toast): For showing success/error popup notifications
 * ============================================================================
 */

// --- React and Hook Imports ---
// useState lets us store and update form field values. When any field changes,
// React re-renders the component to reflect the new value.
import React, { useState } from 'react';

// --- React Router Import ---
// useNavigate gives us a function to redirect the user to another page.
// We use it after form submission to go back to the members list.
import { useNavigate } from 'react-router-dom';

// --- React Select Import ---
// Select is a third-party dropdown component that's much fancier than the
// native <select> HTML element. It supports searching, clearing selections,
// custom styling, and more. We use it for Status, Blood Group, and Gender fields.
import Select from 'react-select';

// --- API Service Import ---
// Our pre-configured Axios instance. It knows the backend's base URL and
// includes any authentication headers automatically.
import api from '../services/api';

// --- Toast Notification Import ---
// 'toast' lets us show small popup messages (like "Success!" or "Error!")
// at the top of the screen. It's a much nicer alternative to alert().
import toast from 'react-hot-toast';

/**
 * AddMember Component
 *
 * A form page for creating new gym members. It doesn't receive any props.
 * Everything is self-contained — it manages its own form state and handles
 * submission internally.
 *
 * Returns: A styled form card with input fields, dropdowns, and file uploaders.
 */
export default function AddMember() {
  /**
   * useNavigate hook — gives us a function to programmatically change pages.
   * Example: navigate('/members') sends the user to the members list.
   */
  const navigate = useNavigate();
  
  // -------------------------------------------------------------------------
  // FORM STATE
  // -------------------------------------------------------------------------
  /**
   * formData: An object that holds ALL the form field values in one place.
   * This is a common React pattern — instead of having 13 separate useState
   * calls (one per field), we group them into one object.
   *
   * Each key corresponds to a form field:
   *   - name, email, admissionNo: text strings
   *   - status: defaults to 'Active' (new members are active by default)
   *   - contactNumber, address, city, state: text strings
   *   - bloodGroup, gender: null initially (no selection made yet)
   *   - dateOfBirth: empty string (will hold a date like "2000-01-15")
   *   - avatar: null (will hold a File object when user picks a photo)
   *   - idProof: null (will hold a File object when user picks an ID image)
   */
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    admissionNo: '',
    status: 'Active',
    contactNumber: '',
    address: '',
    city: '',
    state: '',
    bloodGroup: null,
    gender: null,
    dateOfBirth: '',
    avatar: null,
    idProof: null,
  });

  /**
   * isSaving: Tracks whether the form is currently being submitted.
   * When true, we disable the submit button and show "Submitting..." text
   * to prevent the user from clicking multiple times.
   */
  const [isSaving, setIsSaving] = useState(false);

  // -------------------------------------------------------------------------
  // DROPDOWN OPTIONS
  // -------------------------------------------------------------------------
  // react-select expects options as an array of { value, label } objects.
  // 'value' is what gets stored in state; 'label' is what the user sees.

  // Options for the status dropdown
  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' }
  ];

  // Options for the blood group dropdown
  const bloodGroupOptions = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' }
  ];

  // Options for the gender dropdown
  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
  ];

  // -------------------------------------------------------------------------
  // FORM SUBMISSION HANDLER
  // -------------------------------------------------------------------------
  /**
   * handleSubmit — Called when the user clicks the "Submit" button.
   *
   * This is an async function because it makes an API call (which takes time).
   * The 'async' keyword lets us use 'await' inside, which pauses execution
   * until the API responds.
   *
   * Step-by-step:
   *   1. Prevent the browser's default form submit (which would reload the page)
   *   2. Set isSaving to true (disables button, shows "Submitting...")
   *   3. Validate that all required fields are filled
   *   4. Create a FormData object (needed for sending files over HTTP)
   *   5. Send a POST request to the backend
   *   6. On success: show a toast and redirect to /members
   *   7. On failure: show an error toast
   *   8. Finally: set isSaving back to false (always runs, even on error)
   *
   * @param {Event} e - The form submit event
   */
  const handleSubmit = async (e) => {
    // preventDefault stops the browser from doing its default form submission,
    // which would cause a full page reload. We want React to handle it instead.
    e.preventDefault();
    setIsSaving(true);
    try {
    // --- VALIDATION ---
    // Define which fields must be filled before we can submit.
    const requiredFields = ['name', 'email', 'admissionNo', 'status', 'contactNumber', 'address', 'city', 'state', 'bloodGroup', 'gender', 'dateOfBirth', 'idProof'];

    // .every() returns true only if ALL items in the array pass the test.
    // For each field name, we look up its value in formData and check it's
    // not empty, null, or undefined.
    const isComplete = requiredFields.every(field => {
      const val = formData[field];
      return val !== '' && val !== null && val !== undefined;
    });

    // If any required field is missing, show an error and stop here.
    if (!isComplete) {
      toast.error("Please fill the form completely");
      setIsSaving(false);
      return; // Exit the function early — don't submit the form
    }  
      
      // --- BUILD FORMDATA ---
      // FormData is a browser API that lets us send both text fields AND files
      // in a single HTTP request. Regular JSON can't include files, so we use
      // FormData when the form has file upload fields (avatar, idProof).
      const payload = new FormData();

      // Loop through every key in formData and add non-empty values to payload.
      // 'for...in' iterates over object keys (like 'name', 'email', etc.)
      for (const key in formData) {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          // payload.append(key, value) adds a key-value pair to the FormData
          payload.append(key, formData[key]);
        }
      }
      
      // --- SEND TO BACKEND ---
      // api.post() sends an HTTP POST request to create a new member.
      // The 'Content-Type': 'multipart/form-data' header tells the server
      // to expect form data with files (not regular JSON).
      const response = await api.post(`/members/`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // If we get here (no error thrown), the member was created successfully!
      toast.success("Member profile created successfully!");

      // Redirect the user to the members list page
      navigate('/members');
    } catch (error) {
      // If the API call fails (network error, server error, etc.),
      // we show an error message to the user.
      toast.error("Failed to create profile.");
      console.error(error);
    } finally {
      // 'finally' ALWAYS runs, whether the try succeeded or the catch caught
      // an error. This ensures the button is re-enabled no matter what.
      setIsSaving(false);
    }
  };

  // -------------------------------------------------------------------------
  // FORM RESET HANDLER
  // -------------------------------------------------------------------------
  /**
   * handleReset — Clears all form fields back to their initial empty values.
   * Shows a confirmation dialog first so the user doesn't accidentally lose
   * their work.
   */
  const handleReset = () => {
    // window.confirm() shows a browser dialog with OK/Cancel buttons.
    // It returns true if the user clicks OK, false if they click Cancel.
    if(window.confirm('Are you sure you want to completely clear the form?')) {
        setFormData({
            name: '',
            email: '',
            admissionNo: '',
            status: 'Active',
            contactNumber: '',
            address: '',
            city: '',
            state: '',
            bloodGroup: null,
            gender: null,
            dateOfBirth: '',
            avatar: null,
            idProof: null,
        });
    }
  };

  // -------------------------------------------------------------------------
  // INPUT CHANGE HANDLER
  // -------------------------------------------------------------------------
  /**
   * handleChange — A universal handler for ALL standard HTML input fields.
   *
   * When any <input> changes (user types, checks a box, or picks a file),
   * this function is called with the event object (e).
   *
   * It uses "destructuring" to pull out useful properties from e.target:
   *   - name: which field changed (matches the 'name' attribute on the input)
   *   - value: the new text value (for text/email/tel/date inputs)
   *   - type: what kind of input it is ('text', 'checkbox', 'file', etc.)
   *   - checked: whether a checkbox is checked (true/false)
   *   - files: the selected file(s) for file inputs
   *
   * The nested ternary (condition1 ? a : condition2 ? b : c) determines
   * which value to save:
   *   - If it's a checkbox → save the checked boolean
   *   - If it's a file input → save the first file (files[0])
   *   - Otherwise → save the text value
   *
   * The spread operator (...prev) copies all existing formData fields,
   * and [name] uses the input's name attribute as the key to update.
   * This is called a "computed property name" — [name] becomes whatever
   * string is stored in the 'name' variable (e.g., "email", "city", etc.)
   */
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value 
    }));
  };

  // -------------------------------------------------------------------------
  // REACT-SELECT CHANGE HANDLER
  // -------------------------------------------------------------------------
  /**
   * handleSelectChange — Handles changes from react-select dropdown components.
   *
   * React-select doesn't use regular HTML events like <input>. Instead, it
   * passes the selected option object directly (e.g., { value: 'Male', label: 'Male' }).
   *
   * @param {string} name - The field name in formData to update
   * @param {Object|null} selectedOption - The selected option, or null if cleared
   *
   * We use the optional chaining pattern: selectedOption ? selectedOption.value : ''
   * This means: if an option was selected, save its value; if cleared, save empty string.
   */
  const handleSelectChange = (name, selectedOption) => {
    setFormData(prev => ({ ...prev, [name]: selectedOption ? selectedOption.value : '' }));
  };

  // -------------------------------------------------------------------------
  // CUSTOM STYLES FOR REACT-SELECT
  // -------------------------------------------------------------------------
  /**
   * customStyles — Overrides react-select's default styling to match our
   * Tailwind-based design (slate backgrounds, blue focus rings, etc.)
   *
   * react-select uses a "styles" prop where you provide functions that
   * receive the base styles and return modified styles. The 'state' parameter
   * tells us about the component's current state (focused, disabled, etc.)
   *
   * The spread operator (...base) keeps all default styles and only overrides
   * the specific properties we list after it.
   */
  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: '#f1f5f9',       // slate-100 background
      borderColor: state.isFocused ? '#3b82f6' : '#cbd5e1', // blue when focused, gray otherwise
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none', // blue ring on focus
      borderRadius: '0.375rem',          // rounded-md equivalent
      minHeight: '42px',
      '&:hover': {
        borderColor: '#94a3b8'           // slightly darker gray on hover
      }
    })
  };

  // -------------------------------------------------------------------------
  // JSX RETURN — The form UI
  // -------------------------------------------------------------------------
  return (
    // Outer container with responsive padding and centered max-width
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full">
      {/* White card container for the form */}
      <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6 md:p-8">
        {/* Page title — text-[#1e293b] is a custom hex color (dark slate) */}
        <h2 className="text-[#1e293b] text-xl md:text-2xl font-semibold mb-8">
          Create New Member
        </h2>

          {/* ---------- FORM ---------- */}
          {/* onSubmit={handleSubmit} — when the form is submitted, call our handler
              space-y-6 — adds vertical spacing (1.5rem) between each child element */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ---------- NAME FIELD ---------- */}
            <div>
              {/* Labels help screen readers and clicking the label focuses the input */}
              <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
              <input
                type="text"
                name="name"
                // "Controlled component" pattern: the input's displayed value comes
                // from React state, and onChange updates that state. This gives
                // React full control over the input.
                value={formData.name}
                onChange={handleChange}
                required
                // Tailwind: w-full = full width, bg-slate-100 = light gray background
                // focus:ring-1 focus:ring-blue-500 = blue ring appears when focused
                className="w-full bg-slate-100 border border-slate-300 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="John Doe"
              />
            </div>

            {/* ---------- EMAIL & ADMISSION NO (2-column row) ---------- */}
            {/* grid grid-cols-1 md:grid-cols-2 = 1 column on mobile, 2 columns on medium+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-100 border border-slate-300 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Admission No *</label>
                <input
                  type="text"
                  name="admissionNo"
                  value={formData.admissionNo}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-100 border border-slate-300 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="ADM-001"
                />
              </div>
            </div>

            {/* ---------- STATUS DROPDOWN ---------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                {/* react-select's <Select> component:
                    - value: finds the matching option object from our options array
                      using .find(). react-select needs the full {value, label} object,
                      not just the string value.
                    - onChange: passes the selected option to our handler
                    - isSearchable={false}: users can't type to search (only 2 options) */}
                <Select 
                  value={statusOptions.find(o => o.value === formData.status)}
                  onChange={(option) => handleSelectChange('status', option)}
                  options={statusOptions}
                  styles={customStyles}
                  isSearchable={false}
                />
              </div>
            </div>

            {/* ---------- CONTACT NUMBER & DATE OF BIRTH ---------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number *</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-100 border border-slate-300 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
                {/* type="date" renders a native date picker in the browser */}
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-100 border border-slate-300 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* ---------- ADDRESS (full-width) ---------- */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full bg-slate-100 border border-slate-300 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* ---------- CITY & STATE ---------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full bg-slate-100 border border-slate-300 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
                {/* isClearable allows the user to remove their selection (set back to null) */}
                <Select 
                  value={bloodGroupOptions.find(o => o.value === formData.bloodGroup)}
                  onChange={(option) => handleSelectChange('bloodGroup', option)}
                  options={bloodGroupOptions}
                  styles={customStyles}
                  placeholder="Select Blood Group"
                  isClearable
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                <Select 
                  value={genderOptions.find(o => o.value === formData.gender)}
                  onChange={(option) => handleSelectChange('gender', option)}
                  options={genderOptions}
                  styles={customStyles}
                  placeholder="Select Gender"
                  isClearable
                />
              </div>
            </div>

            {/* ---------- FILE UPLOAD FIELDS ---------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Profile Image</label>
                {/* type="file" creates a file picker. accept="image/*" restricts
                    the file browser to only show image files.
                    The file: pseudo-classes style the native "Choose File" button:
                    file:bg-blue-50 = light blue background for the button part */}
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full text-sm text-slate-500 md:col-span-1 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors bg-slate-100 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ID Proof Image *</label>
                <input
                  type="file"
                  name="idProof"
                  accept="image/*"
                  onChange={handleChange}
                  required
                  className="w-full text-sm text-slate-500 md:col-span-1 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors bg-slate-100 rounded-md"
                />
              </div>
            </div>

            {/* ---------- ACTION BUTTONS ---------- */}
            {/* pt-8 border-t = top padding and a top border to visually separate from form fields
                justify-between = push Cancel to the left and Submit to the right */}
            <div className="flex justify-between items-center pt-8 border-t border-slate-100 mt-8">
               {/* Cancel button — type="button" prevents it from submitting the form.
                   window.history.back() works like the browser's back button. */}
               <button 
                 type="button"
                 onClick={() => window.history.back()}
                 // bg-[#e91e63] is a custom pink/red hex color (Material Design pink)
                 // rounded-full = fully rounded (pill-shaped) button
                 className="bg-[#e91e63] hover:bg-[#d81b60] text-white font-medium py-2.5 px-6 rounded-full text-sm transition-colors shadow-sm"
               >
                 Cancel
               </button>
               
               {/* Submit button — type="submit" triggers the form's onSubmit handler.
                   disabled={isSaving} grays out the button while the API call is in progress.
                   The ternary operator shows "Submitting..." or "Submit" based on isSaving state. */}
               <button 
                 type="submit"
                 disabled={isSaving}
                 // disabled:opacity-70 = semi-transparent when disabled
                 // disabled:cursor-not-allowed = shows a "no" cursor icon on hover when disabled
                 className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium py-2.5 px-6 rounded-full text-sm transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
               >
                 {/* Ternary: if isSaving is true, show "Submitting...", otherwise show "Submit" */}
                 {isSaving ? "Submitting..." : "Submit"}
               </button>
            </div>
          </form>
      </div>
    </div>
  );
}
