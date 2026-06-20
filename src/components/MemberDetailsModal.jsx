/**
 * ============================================================================
 * MemberDetailsModal.jsx — Full-Screen Member Profile Modal
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 *   This file creates a pop-up modal (overlay) that shows a member's full
 *   profile details. When you click a member row in the MembersTable or
 *   click "View Profile" in MemberPanel, THIS component appears as a card
 *   floating over a dark backdrop. It displays personal info, contact details,
 *   and active subscriptions.
 *
 * REACT CONCEPTS USED:
 *   - Props: Receives member data, open/close state, and a close handler.
 *   - Early Return Pattern: If the modal isn't open or no member is provided,
 *     the component returns null (renders nothing). This is a clean way to
 *     conditionally show/hide a component.
 *   - Event Propagation: Uses e.stopPropagation() to prevent clicks inside
 *     the modal from closing it.
 *   - Conditional Rendering: Shows subscriptions if they exist, or a
 *     placeholder if they don't.
 *
 * HOW IT FITS IN THE APP:
 *   This modal is imported and used by both MembersTable and MemberPanel.
 *   Those parent components control WHEN it opens (via isOpen prop) and
 *   WHAT data it shows (via member prop). The modal itself just displays data.
 *
 * LIBRARIES USED:
 *   - lucide-react: Various icons for visual enhancement (X for close,
 *     Calendar, MapPin, Phone, Mail, etc.).
 *   - react-router-dom (useNavigate): For navigating to the member edit page.
 * ============================================================================
 */

/* Import React — required for JSX */
import React from 'react';

/*
 * Import icons from lucide-react.
 * Each icon serves a specific visual purpose in the modal:
 *   - X: Close button
 *   - Calendar: Date of birth icon
 *   - MapPin: Contact/address section header icon
 *   - Phone: Phone number icon
 *   - Mail: Email icon
 *   - Droplets: Blood group icon (looks like a blood drop)
 *   - User: Personal details section header icon, and Edit Profile button icon
 *   - Activity: Subscriptions section header icon
 *   - Clock: Subscription validity date icon
 */
import { X, Calendar, MapPin, Phone, Mail, Droplets, User, Activity, Clock } from 'lucide-react';

/*
 * useNavigate hook from React Router — lets us programmatically navigate
 * to another page (e.g., the member edit form).
 */
import { useNavigate } from 'react-router-dom';

/**
 * MemberDetailsModal — A full-featured modal for viewing member profiles.
 *
 * PROPS IT RECEIVES:
 *   - member: An object containing all the member's data (name, email,
 *     gender, subscriptions, etc.). Can be null if no member is selected.
 *   - isOpen: A boolean that controls whether the modal is visible.
 *   - onClose: A callback function to close the modal (called when the user
 *     clicks the X button, the Close button, or the backdrop).
 *
 * WHAT IT RETURNS:
 *   Either null (if the modal shouldn't be shown) or a full-screen overlay
 *   with a centered card containing member details.
 */
export default function MemberDetailsModal({ member, isOpen, onClose }) {
  /*
   * useNavigate returns a function we can call to navigate to a new page.
   * We use it for the "Edit Profile" button to go to /members/:id
   */
  const navigate = useNavigate();

  /*
   * EARLY RETURN PATTERN:
   * If the modal isn't open OR no member data is provided, return null.
   * Returning null in React means "render nothing" — the component
   * produces no DOM elements at all. This is cleaner than wrapping
   * the entire JSX in a conditional.
   *
   * The ! operator means "NOT" — !isOpen means "isOpen is false".
   * The || means "OR" — so this reads: "if NOT open OR NOT member, return nothing."
   */
  if (!isOpen || !member) return null;

  return (
    /*
     * ===== BACKDROP (full-screen overlay) =====
     * This creates the dark, semi-transparent background behind the modal.
     *
     * Tailwind classes:
     *   - fixed inset-0: Covers the entire viewport (top, right, bottom, left = 0)
     *   - z-50: High stacking order — appears above everything else
     *   - flex items-center justify-center: Centers the modal card both
     *     horizontally and vertically
     *   - p-4: Padding so the modal doesn't touch screen edges on mobile
     *   - bg-slate-900/60: Dark background at 60% opacity
     *   - backdrop-blur-sm: Slightly blurs the content behind the overlay
     */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      {/*
       * ===== MODAL CARD =====
       * The actual white card that contains the member details.
       *
       * onClick={(e) => e.stopPropagation()} is important:
       *   Without it, clicking inside the modal would bubble up to the backdrop
       *   and potentially close the modal. stopPropagation prevents the click
       *   event from reaching parent elements.
       *
       * Tailwind classes:
       *   - max-w-2xl: Maximum width of 42rem (672px) — keeps it readable
       *   - overflow-hidden: Clips any content that overflows the rounded corners
       *   - animate-in fade-in zoom-in-95: Entry animation — fades in and
       *     slightly zooms in for a polished feel
       */}
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===== HEADER — Member name, avatar, status, and close button ===== */}
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            {/*
             * Member avatar with fallback.
             * Uses the member's avatar URL, or generates one from their name
             * using the ui-avatars.com service.
             * encodeURIComponent makes the name URL-safe (handles spaces, etc.)
             */}
            <img 
              src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'User')}&background=random`} 
              alt={member.name} 
              className="w-16 h-16 rounded-full border-2 border-white shadow-sm object-cover bg-white"
            />
            <div>
              {/* Member name with status badge */}
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                {member.name}
                {/*
                 * Status badge — dynamically styled based on member status.
                 * Uses a TERNARY inside a TEMPLATE LITERAL for class names:
                 *   condition ? 'active-classes' : 'inactive-classes'
                 *
                 * Multiple checks handle different API formats:
                 *   - member.status === 'Active' (exact match)
                 *   - member.status?.toLowerCase() === 'active' (case-insensitive)
                 *   - member.is_active (boolean field)
                 */}
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  member.status === 'Active' || member.status?.toLowerCase() === 'active' || member.is_active
                    ? 'bg-[#60d62a] text-white' 
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {member.status || (member.is_active ? 'Active' : 'Inactive')}
                </span>
              </h2>

              {/* Admission number and email row */}
              <div className="flex items-center gap-2 mt-1">
                {/*
                 * Admission number badge.
                 * The || chain tries multiple possible field names:
                 *   admissionNo → admission_no → fallback to #id
                 */}
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                  ADM: {member.admissionNo || member.admission_no || `#${member.id}`}
                </span>
                {/* Email with mail icon */}
                <span className="text-xs text-slate-500 flex items-center gap-1">
                   <Mail className="w-3.5 h-3.5" />
                   {member.email}
                </span>
              </div>
            </div>
          </div>

          {/* Close button (X icon) in the top-right corner */}
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ===== CONTENT — Scrollable body area ===== */}
        {/* Content */}
        {/*
         * max-h-[70vh]: Maximum height is 70% of the viewport height.
         * overflow-y-auto: Adds a vertical scrollbar if content exceeds that height.
         * This prevents the modal from being taller than the screen.
         */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* ===== Two-Column Grid: Personal Details & Contact Info ===== */}
          {/* Main Info Grid */}
          {/*
           * grid grid-cols-1 md:grid-cols-2: Single column on mobile,
           * two columns side-by-side on medium+ screens (responsive layout).
           */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* ----- LEFT COLUMN: Personal Details ----- */}
            <div className="space-y-4">
              {/* Section header with icon */}
              <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                Personal Details
              </h3>
              {/*
               * grid grid-cols-2: Creates a label-value grid.
               * Each pair has a gray label on the left and bold value on the right.
               */}
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div className="text-slate-500">Gender</div>
                {/* The || 'N/A' pattern: show the value, or 'N/A' if it's missing */}
                <div className="font-medium text-slate-800">{member.gender || 'N/A'}</div>
                
                <div className="text-slate-500">Date of Birth</div>
                <div className="font-medium text-slate-800 flex items-center gap-1.5">
                   <Calendar className="w-3.5 h-3.5 text-slate-400" />
                   {/* Try camelCase first, then snake_case, then fallback */}
                   {member.dateOfBirth || member.date_of_birth || 'N/A'}
                </div>
                
                <div className="text-slate-500">Blood Group</div>
                <div className="font-medium text-slate-800 flex items-center gap-1.5">
                   <Droplets className="w-3.5 h-3.5 text-red-400" />
                   {member.bloodGroup || member.blood_group || 'N/A'}
                </div>
              </div>
            </div>

            {/* ----- RIGHT COLUMN: Contact Info ----- */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                Contact Info
              </h3>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div className="text-slate-500">Contact</div>
                <div className="font-medium text-slate-800 flex items-center gap-1.5">
                   <Phone className="w-3.5 h-3.5 text-slate-400" />
                   {member.contactNumber || 'N/A'}
                </div>
                
                <div className="text-slate-500">Address</div>
                <div className="font-medium text-slate-800 col-span-2 mt-1">
                   {/*
                    * CONDITIONAL RENDERING for the address:
                    *   - If member.address exists: Show address with optional city and state.
                    *     The && operator after member.city means "if city exists, append it."
                    *     Template literals with backticks create strings like ", New York".
                    *   - If no address: Show 'N/A'
                    */}
                   {member.address ? (
                     <span>
                       {member.address}
                       {/* The && pattern: "if member.city exists, add ', City'" */}
                       {member.city && `, ${member.city}`}
                       {member.state && `, ${member.state}`}
                     </span>
                   ) : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* ===== Subscriptions Section ===== */}
          {/* Subscriptions Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-500" />
              Active Subscriptions
            </h3>
            
            {/*
             * Check if subscriptions exist AND have items.
             * The && operator chain:
             *   member.subscriptions → does it exist? (not null/undefined)
             *   && member.subscriptions.length > 0 → does it have items?
             * If both are true, render the subscription cards.
             * Otherwise, render the "No active subscriptions" placeholder.
             */}
            {member.subscriptions && member.subscriptions.length > 0 ? (
              /*
               * sm:grid-cols-2: On small+ screens, show subscription cards
               * in two columns. On very small screens, one column.
               */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/*
                 * .map() iterates over subscriptions and creates a card for each.
                 * The arrow function (sub => ...) receives each subscription object.
                 */}
                {member.subscriptions.map(sub => (
                  <div key={sub.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      {/*
                       * Subscription name — tries multiple field names:
                       * package_name → name → fallback 'Package'
                       */}
                      <h4 className="font-bold text-slate-800">{sub.package_name || sub.name || 'Package'}</h4>
                      {/* Status badge */}
                      <span className={`text-white text-[10px] font-bold px-2 py-0.5 rounded-full ${sub.status === 'active' ? 'bg-[#60d62a]' : 'bg-slate-400'}`}>
                        {sub.status}
                      </span>
                    </div>

                    {/*
                     * Services list — shows what's included in the subscription.
                     * Uses complex optional chaining to safely navigate nested data:
                     *   sub.plan?.services?.length > 0 — checks plan > services > has items
                     *   sub.services?.length > 0 — alternative flat structure
                     *
                     * .map(s => s.name).join(', ') transforms the services array
                     * into a comma-separated string of names.
                     */}
                    {(sub.plan?.services?.length > 0 || sub.services?.length > 0) && (
                       <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                         Includes: {(sub.plan?.services || sub.services || []).map(s => s.name).join(', ')}
                       </p>
                    )}

                    {/* Subscription validity date */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mt-auto pt-3 border-t border-slate-200">
                      <Clock className="w-3.5 h-3.5" />
                      Valid until: {sub.valid_until || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty state when no subscriptions exist */
              <div className="text-center py-6 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                <p className="text-sm text-slate-500">No active subscriptions found.</p>
              </div>
            )}
          </div>
        </div>

        {/* ===== FOOTER — Action buttons ===== */}
        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors"
          >
            Close
          </button>

          {/*
           * Edit Profile button — always shown (true && ...).
           * The {true && (...)} pattern is a placeholder for future conditional
           * logic (e.g., only show for admin users). Currently always renders.
           *
           * navigate(`/members/${member.id}`) sends the user to the edit page.
           */}
          {true && (
            <button 
              onClick={() => navigate(`/members/${member.id}`)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
