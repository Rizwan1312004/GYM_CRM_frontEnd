/**
 * -----------------------------------------------------------------------------
 * FILE: src/pages/ServicesList.jsx
 * 
 * WHAT THIS FILE DOES:
 * This page displays a grid of all the "Services" the gym offers (e.g., Yoga, Steam Bath).
 * It allows the user to perform CRUD operations:
 * - Create: Add a new service via a modal
 * - Read: View all services and search through them
 * - Update: Edit an existing service's name
 * - Delete: Remove a service
 * 
 * KEY REACT CONCEPTS USED:
 * - Reusing a single Modal for both Create and Edit operations by checking `currentService`.
 * - Basic array filtering for the search functionality.
 * - Error state handling to display messages if the API fails.
 * -----------------------------------------------------------------------------
 */

import React, { useState, useEffect } from "react";

// Icons for the UI
import { Plus, Edit, Trash2, Search, Layers, X, Dumbbell } from "lucide-react";

// Our configured Axios instance for API calls
import api from '../services/api';

// Toast notifications for success/error popups
import toast from 'react-hot-toast';

/**
 * COMPONENT: ServicesList
 */
export default function ServicesList() {
  // --- STATE VARIABLES ---
  
  // Stores the list of services from the API
  const [services, setServices] = useState([]);
  
  // True while we are waiting for the API to respond
  const [isLoading, setIsLoading] = useState(true);
  
  // Stores an error message if the initial fetch fails
  const [error, setError] = useState(null);
  
  // Stores the text typed into the search bar
  const [searchQuery, setSearchQuery] = useState("");

  // --- MODAL STATE ---
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // `currentService` acts as a flag:
  // - If it is `null`, the modal is in "Create New" mode.
  // - If it holds a service object, the modal is in "Edit Existing" mode.
  const [currentService, setCurrentService] = useState(null);
  
  // The name being typed into the modal's input field
  const [serviceName, setServiceName] = useState("");
  
  // True while we are waiting for the Save/Create API request to finish
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * FUNCTION: fetchServices
   * Gets the list of services from the backend API.
   */
  const fetchServices = () => {
    setIsLoading(true);
    api.get(`/services/`)
      .then((response) => {
        // Handle different API response structures (sometimes it's directly an array, 
        // sometimes it's wrapped in an object under 'data' or 'results')
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.data || response.data.results || [];
        
        setServices(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching services:", err);
        setError("Failed to load services list.");
        toast.error("Failed to load services list.");
        setIsLoading(false);
      });
  };

  /**
   * HOOK: useEffect
   * Runs exactly once when the page first loads to fetch the data.
   */
  useEffect(() => {
    fetchServices();
  }, []);

  /**
   * HANDLER: handleDelete
   * Deletes a service. It uses `window.confirm` for a simple browser popup alert
   * to ensure the user didn't click by accident.
   */
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await api.delete(`/services/${id}/`);
        
        // Optimistic UI update: Remove the item from the state immediately without waiting for a re-fetch
        setServices(services.filter((s) => s.id !== id));
        
        toast.success("Service deleted successfully.");
      } catch (err) {
        console.error("Failed to delete service:", err);
        toast.error("Failed to delete service.");
      }
    }
  };

  /**
   * HANDLER: openModal
   * Opens the popup. Can be used for both creating and editing.
   * 
   * @param {Object|null} service - If provided, we are editing this service. If null, we are creating.
   */
  const openModal = (service = null) => {
    setCurrentService(service);
    
    // If we're editing, pre-fill the input with the existing name. Otherwise, clear it.
    setServiceName(service ? service.name : "");
    setIsModalOpen(true);
  };

  /**
   * HANDLER: closeModal
   * Closes the popup and resets the modal state.
   */
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentService(null);
    setServiceName("");
  };

  /**
   * HANDLER: handleSubmit
   * Handles saving the form. It checks `currentService` to decide whether
   * it should send a POST request (create) or a PUT request (update).
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // `.trim()` removes whitespace. Don't submit if it's empty.
    if (!serviceName.trim()) return;

    setIsSubmitting(true);
    try {
      if (currentService) {
        // EDIT EXISTING: Use PUT to update the specific ID
        await api.put(`/services/${currentService.id}/`, {
          name: serviceName,
        });
        toast.success("Service updated successfully!");
      } else {
        // CREATE NEW: Use POST to add a new record
        await api.post(`/services/`, {
          name: serviceName,
        });
        toast.success("Service created successfully!");
      }
      
      // Refresh the list to get the latest data from the server
      fetchServices();
      closeModal();
    } catch (err) {
      console.error("Error saving service:", err);
      toast.error("Failed to save service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter the services array based on what the user typed in the search box
  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-screen bg-slate-50">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gym Services</h1>
          <p className="text-slate-500 mt-1">Manage the amenities and services offered</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          {/* Search Input */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5"/>
            <input 
              type="text" 
              placeholder="Search services..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all"
            />
          </div>
          
          {/* New Service Button -> Calls openModal() with no arguments (which means create mode) */}
          {true && (
            <button
              onClick={() => openModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm shadow-indigo-200 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" /> New Service
            </button>
          )}
        </div>
      </div>

      {/* --- CONTENT AREA (Grid Layout) --- */}
      
      {isLoading ? (
        // SHOW LOADING SKELETONS
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(n => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse h-40"></div>
          ))}
        </div>
      ) : error ? (
        // SHOW ERROR MESSAGE
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl shadow-sm text-center">
          {error}
        </div>
      ) : filteredServices.length === 0 ? (
        // SHOW EMPTY STATE
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <Layers className="w-16 h-16 text-indigo-200 mx-auto mb-4"/>
          <h3 className="text-lg font-bold text-slate-800">No services found</h3>
          <p className="text-slate-500 mt-1">Get started by creating a new gym service.</p>
        </div>
      ) : (
        // SHOW ACTUAL DATA
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredServices.map(service => (
            // A Card for a single service
            <div key={service.id} className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden">
              
              {/* Decorative background icon */}
              <div className="absolute -top-6 -right-6 text-slate-50 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none transform group-hover:scale-110 duration-500">
                <Dumbbell className="w-32 h-32"/>
              </div>
              
              {/* Primary Icon */}
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300">
                <Layers className="w-8 h-8"/>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2 relative z-10">{service.name}</h3>
              <p className="text-xs font-semibold text-slate-400 mb-6 uppercase tracking-wider relative z-10">Service ID: #{service.id}</p>
              
              {/* Action Buttons (Edit / Delete) */}
              <div className="flex gap-2 w-full mt-auto relative z-10">
                {true && (
                  <>
                    <button
                      onClick={() => openModal(service)} // Passes the service object, putting modal in Edit Mode
                      className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 rounded-xl font-medium transition-colors"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="w-10 flex flex-shrink-0 items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 py-2 rounded-xl font-medium transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- CREATE / EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            
            {/* Header changes title based on create vs edit mode */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-6 h-6 text-indigo-600"/> 
                {currentService ? "Edit Service" : "New Service"}
              </h3>
              <button 
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-8">
                <label htmlFor="serviceName" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Service Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="serviceName"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                  placeholder="e.g. Yoga, Steam Bath"
                  required
                  autoFocus // Automatically puts the cursor in this box when modal opens
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-white border border-slate-300 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !serviceName.trim()}
                  className="flex-1 bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 disabled:opacity-50 flex items-center justify-center"
                >
                  {/* Button text changes based on state */}
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    currentService ? "Save" : "Create"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
