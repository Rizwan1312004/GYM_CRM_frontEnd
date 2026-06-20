/**
 * -----------------------------------------------------------------------------
 * FILE: src/pages/ActivitiesList.jsx
 * 
 * WHAT THIS FILE DOES:
 * This page displays all the gym activities (like Yoga classes, HIIT sessions, etc.).
 * It lets the user view existing activities, search through them, add new ones,
 * and delete them. It uses a clean, modern card-based layout to show the details.
 * 
 * KEY REACT CONCEPTS USED:
 * - useState: To keep track of the activities list, search text, and form inputs.
 * - useEffect: To automatically fetch the activities from the backend when the page loads.
 * - .map(): To loop over the list of activities and display a "Card" for each one.
 * - conditional rendering: To show a loading screen, an empty state, or the actual data.
 * -----------------------------------------------------------------------------
 */

// Import React and the hooks we need (useState for data, useEffect for side effects)
import React, { useState, useEffect } from "react";

// Import our pre-configured Axios API instance to talk to the backend
import api from '../services/api';

// Import the toast notification system for showing success/error messages
import toast from 'react-hot-toast';

// Import date utility functions to help us format and parse dates correctly
import { format, parseISO } from "date-fns";

// Import SVG icons from the lucide-react library
import {
  Plus, 
  MapPin, 
  Clock,
  Users, 
  X,
  Search,
  Dumbbell,
  Timer
} from "lucide-react";

/**
 * COMPONENT: ActivitiesList
 * This is the main component exported from this file. It manages the whole page.
 */
export default function ActivitiesList() {
  // --- STATE VARIABLES ---
  
  // `activities` holds the list of all activities fetched from the server. Starts empty [].
  const [activities, setActivities] = useState([]);
  
  // `trainers` holds the list of available trainers to assign to an activity.
  const [trainers, setTrainers] = useState([]);
  
  // `isLoading` keeps track of whether we are currently fetching data from the server.
  const [isLoading, setIsLoading] = useState(true);
  
  // `searchQuery` stores what the user types into the search bar.
  const [searchQuery, setSearchQuery] = useState("");
  
  // --- MODAL & FORM STATE ---
  
  // `isModalOpen` controls whether the "Add Activity" popup is visible or hidden.
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // `isSubmitting` prevents the user from clicking the save button multiple times.
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // `formData` holds all the current values typed into the "Add Activity" form.
  // We initialize it with default values (like today's date and a default time).
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"), // e.g., "2023-10-25"
    time: "09:00",
    duration_minutes: 60,
    capacity: 20,
    trainer: ""
  });

  /**
   * FUNCTION: fetchData
   * This async function talks to the backend to get the activities and trainers.
   * We use `Promise.all` to run both API requests at the same time for speed.
   */
  const fetchData = async () => {
    setIsLoading(true); // Turn on the loading spinner
    try {
      // Fetch both activities and trainers simultaneously
      const [actRes, trainerRes] = await Promise.all([
        api.get(`/activities/`),
        api.get(`/trainers/`).catch(() => ({ data: [] })) // Fetch trainers, fallback if endpoint missing
      ]);
      
      // Store the activities in our state. We check if the response has a nested 'results' array.
      setActivities(Array.isArray(actRes.data) ? actRes.data : actRes.data.results || []);
      
      // Store the trainers in our state.
      const allTrainers = Array.isArray(trainerRes.data) ? trainerRes.data : trainerRes.data.results || [];
      setTrainers(allTrainers);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      // Whether it succeeded or failed, turn off the loading spinner
      setIsLoading(false);
    }
  };

  /**
   * HOOK: useEffect
   * By passing an empty array [] as the second argument, we tell React to run 
   * this `fetchData` function exactly ONCE when the component first appears on screen.
   */
  useEffect(() => {
    fetchData();
  }, []);

  /**
   * HANDLER: handleInputChange
   * This is called every time a user types into an input field in the modal form.
   * It updates ONLY the specific field being changed, leaving the rest of `formData` alone.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // We use the spread operator (...) to keep the previous data, and override the changed field
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * HANDLER: openAddModal
   * Resets the form back to its default, clean state, then opens the modal.
   */
  const openAddModal = () => {
    setFormData({
      name: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "09:00",
      duration_minutes: 60,
      capacity: 20,
      trainer: ""
    });
    setIsModalOpen(true);
  };

  /**
   * HANDLER: handleSubmit
   * Called when the user clicks the "Create Activity" submit button in the modal.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the browser from reloading the page
    setIsSubmitting(true);
    
    // Create payload, nullify trainer if empty string (API might reject empty strings for IDs)
    const payload = { ...formData };
    if (payload.trainer === "") {
        payload.trainer = null;
    }

    try {
      // Send the POST request to the backend with our payload
      await api.post(`/activities/`, payload);
      
      // If successful, fetch the updated list of activities
      fetchData();
      
      // Close the popup
      setIsModalOpen(false);
      
      // Show a success message
      toast.success("Activity added successfully!");
    } catch (error) {
      console.error("Failed to create activity", error);
      toast.error("Error saving activity.");
    } finally {
      setIsSubmitting(false); // Re-enable the submit button
    }
  };

  /**
   * HANDLER: handleDelete
   * Called when the user clicks the "X" button on a specific activity card.
   */
  const handleDelete = async (id) => {
    // First, ask the user to confirm they really want to delete
    if(!window.confirm("Are you sure you want to delete this activity?")) return;
    try {
      // Send the DELETE request to the backend
      await api.delete(`/activities/${id}/`);
      
      // Refresh the list to remove the deleted item
      fetchData();
      toast.success("Activity deleted successfully.");
    } catch (error) {
      console.error("Failed to delete", error);
      toast.error("Failed to delete activity.");
    }
  };

  // --- FILTERING LOGIC ---
  // Before rendering, we filter the activities based on what the user typed in the search box.
  // We check if the search string is inside the activity name or description (case-insensitive).
  const filteredActivities = activities.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (a.description && a.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    // The main container for the page. Uses Tailwind classes for padding, max width, and background.
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-screen bg-slate-50">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gym Activities</h1>
          <p className="text-slate-500 mt-1">Manage classes, workouts, and group sessions</p>
        </div>
        
        {/* Search bar and Add button container */}
        <div className="flex w-full md:w-auto gap-3">
          {/* Search Input Container */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5"/>
            <input 
              type="text" 
              placeholder="Search activities..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} // Updates search state on every keystroke
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all"
            />
          </div>
          
          {/* Add Activity Button */}
          {/* The `{true && (...)}` block is a pattern sometimes used to hide/show buttons based on permissions. Here it's always true. */}
          {true && (
            <button 
              onClick={openAddModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm shadow-indigo-200 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-5 h-5"/> Add Activity
            </button>
          )}
        </div>
      </div>

      {/* --- GRID LAYOUT --- */}
      {/* We use a ternary operator (condition ? trueResult : falseResult) to decide what to show */}
      {isLoading ? (
        // SHOW LOADING SKELETONS: If data is still loading, show animated grey boxes
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4].map(n => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse h-64"></div>
          ))}
        </div>
      ) : filteredActivities.length === 0 ? (
        // SHOW EMPTY STATE: If done loading but no activities match the search (or exist at all)
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <Dumbbell className="w-16 h-16 text-indigo-200 mx-auto mb-4"/>
          <h3 className="text-lg font-bold text-slate-800">No activities found</h3>
          <p className="text-slate-500 mt-1">Get started by creating a new workout or class.</p>
        </div>
      ) : (
        // SHOW ACTUAL ACTIVITIES: Loop through filtered list and render a card for each
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* .map() creates a new array of JSX elements. `key` helps React update efficiently. */}
          {filteredActivities.map(activity => (
             <div key={activity.id} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-indigo-200 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 flex flex-col">
               
               {/* Card Header image pattern */}
               {/* Uses a CSS gradient background for a modern look */}
               <div className="h-24 bg-gradient-to-br from-indigo-500 to-purple-600 p-5 relative overflow-hidden">
                 <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
                   <Dumbbell className="w-32 h-32"/>
                 </div>
                 <h3 className="text-xl font-bold text-white relative z-10 truncate">{activity.name}</h3>
                 <span className="inline-flex items-center gap-1 text-indigo-100 text-sm mt-1 relative z-10">
                   <Users className="w-4 h-4"/> Capacity: {activity.capacity}
                 </span>
               </div>
               
               {/* Card Body */}
               <div className="p-5 flex-1 flex flex-col bg-white">
                 <div className="space-y-3 mb-6 flex-1">
                   {/* Date Display */}
                   <div className="flex items-center gap-3 text-slate-600">
                     <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                       <MapPin className="w-4 h-4"/>
                     </div>
                     <div className="text-sm font-medium">
                       {/* Format the date nicely using date-fns */}
                       {format(parseISO(activity.date), "MMM d, yyyy")}
                     </div>
                   </div>
                   
                   {/* Time Display */}
                   <div className="flex items-center gap-3 text-slate-600">
                     <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                       <Clock className="w-4 h-4"/>
                     </div>
                     <div className="text-sm font-medium">
                       {/* We substring(0,5) to convert '09:00:00' to '09:00' */}
                       {activity.time.substring(0,5)}
                     </div>
                   </div>
                   
                   {/* Duration Display */}
                   <div className="flex items-center gap-3 text-slate-600">
                     <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                       <Timer className="w-4 h-4"/>
                     </div>
                     <div className="text-sm font-medium">
                       {activity.duration_minutes} mins
                     </div>
                   </div>
                   
                   {/* Optional Description */}
                   {/* Only renders this <p> if activity.description exists */}
                   {activity.description && (
                     <p className="text-sm text-slate-500 mt-4 line-clamp-2">
                       {activity.description}
                     </p>
                   )}
                 </div>
                 
                 {/* Card Footer Actions */}
                 <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                      {/* Short-circuit evaluation: Use trainer_name if it exists, otherwise use 'No Trainer' */}
                      {activity.trainer_name || 'No Trainer'}
                    </span>
                    
                    {/* Delete Button */}
                    {true && (
                      <button 
                        onClick={() => handleDelete(activity.id)} // Wraps in arrow function so it doesn't run immediately!
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Delete Activity"
                      >
                        <X className="w-5 h-5"/>
                      </button>
                    )}
                 </div>
               </div>
             </div>
          ))}
        </div>
      )}

      {/* --- ADD ACTIVITY MODAL --- */}
      {/* This whole block only renders if `isModalOpen` state is true */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Dumbbell className="w-6 h-6 text-indigo-600"/> Add New Activity
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} // Closes the modal by updating state
                className="p-2 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5"/>
              </button>
            </div>

            {/* Modal Form */}
            {/* `onSubmit={handleSubmit}` tells the form to run our function when Enter is pressed or submit button clicked */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                
                {/* Activity Name Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Activity Name *</label>
                  <input
                    required // Browser validation: user cannot submit without filling this
                    name="name" // `name` must exactly match the key in our `formData` state object
                    value={formData.name} // Controlled component: value comes directly from state
                    onChange={handleInputChange} // This handles the user typing
                    placeholder="e.g. Morning Yoga, HIIT Training"
                    className="w-full border border-slate-300 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                  />
                </div>
                
                {/* Date & Time Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date *</label>
                    <input
                      required
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full border border-slate-300 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Time *</label>
                    <input
                      required
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className="w-full border border-slate-300 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Duration & Capacity Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Duration (mins) *</label>
                    <input
                      required
                      type="number"
                      min="1" // Prevent negative durations
                      name="duration_minutes"
                      value={formData.duration_minutes}
                      onChange={handleInputChange}
                      className="w-full border border-slate-300 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Capacity *</label>
                    <input
                      required
                      type="number"
                      min="1"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      className="w-full border border-slate-300 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Trainer Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Trainer (Optional)</label>
                  <select
                    name="trainer"
                    value={formData.trainer}
                    onChange={handleInputChange}
                    className="w-full border border-slate-300 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm bg-white"
                  >
                    <option value="">No Trainer Assigned</option>
                    {/* Generate the dropdown options dynamically from the trainers state */}
                    {trainers.map(t => (
                      <option key={t.id} value={t.id}>{t.name || (t.user ? t.user.first_name : `Trainer #${t.id}`)}</option>
                    ))}
                  </select>
                </div>

                {/* Description Textarea */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Short description of the activity..."
                    className="w-full border border-slate-300 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="mt-8 flex gap-3">
                <button
                  type="button" // Important! "button" prevents it from accidentally submitting the form
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white border border-slate-300 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit" // Submits the form
                  disabled={isSubmitting} // Grays out and un-clickable if we are currently saving
                  className="flex-1 bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 disabled:opacity-50"
                >
                  {/* Provide visual feedback while saving */}
                  {isSubmitting ? "Saving..." : "Create Activity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
