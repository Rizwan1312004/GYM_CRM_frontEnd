import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Layers, X, Dumbbell } from "lucide-react";
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function ServicesList() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState(null); // null for create, object for edit
  const [serviceName, setServiceName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchServices = () => {
    setIsLoading(true);
    api.get(`/services/`)
      .then((response) => {
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

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await api.delete(`/services/${id}/`);
        setServices(services.filter((s) => s.id !== id));
        toast.success("Service deleted successfully.");
      } catch (err) {
        console.error("Failed to delete service:", err);
        toast.error("Failed to delete service.");
      }
    }
  };

  const openModal = (service = null) => {
    setCurrentService(service);
    setServiceName(service ? service.name : "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentService(null);
    setServiceName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serviceName.trim()) return;

    setIsSubmitting(true);
    try {
      if (currentService) {
        // Edit existing
        await api.put(`/services/${currentService.id}/`, {
          name: serviceName,
        });
        toast.success("Service updated successfully!");
      } else {
        // Create new
        await api.post(`/services/`, {
          name: serviceName,
        });
        toast.success("Service created successfully!");
      }
      fetchServices(); // Refresh list
      closeModal();
    } catch (err) {
      console.error("Error saving service:", err);
      toast.error("Failed to save service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gym Services</h1>
          <p className="text-slate-500 mt-1">Manage the amenities and services offered</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
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
          {user?.role === 'admin' && (
            <button
              onClick={() => openModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm shadow-indigo-200 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" /> New Service
            </button>
          )}
        </div>
      </div>

      {/* Grid Layout */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(n => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse h-40"></div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl shadow-sm text-center">
          {error}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <Layers className="w-16 h-16 text-indigo-200 mx-auto mb-4"/>
          <h3 className="text-lg font-bold text-slate-800">No services found</h3>
          <p className="text-slate-500 mt-1">Get started by creating a new gym service.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredServices.map(service => (
            <div key={service.id} className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute -top-6 -right-6 text-slate-50 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none transform group-hover:scale-110 duration-500">
                <Dumbbell className="w-32 h-32"/>
              </div>
              
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300">
                <Layers className="w-8 h-8"/>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2 relative z-10">{service.name}</h3>
              <p className="text-xs font-semibold text-slate-400 mb-6 uppercase tracking-wider relative z-10">Service ID: #{service.id}</p>
              
              <div className="flex gap-2 w-full mt-auto relative z-10">
                {user?.role === 'admin' && (
                  <>
                    <button
                      onClick={() => openModal(service)}
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

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
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
                  autoFocus
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
