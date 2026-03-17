import React, { useState, useEffect } from "react";
import api from '../services/api';
import toast from 'react-hot-toast';
import { format, parseISO } from "date-fns";
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
import { useAuth } from '../context/AuthContext';

export default function ActivitiesList() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "09:00",
    duration_minutes: 60,
    capacity: 20,
    trainer: ""
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [actRes, trainerRes] = await Promise.all([
        api.get(`/activities/`),
        api.get(`/trainers/`).catch(() => ({ data: [] })) // Fetch trainers, fallback if endpoint missing
      ]);
      setActivities(Array.isArray(actRes.data) ? actRes.data : actRes.data.results || []);
      
      const allTrainers = Array.isArray(trainerRes.data) ? trainerRes.data : trainerRes.data.results || [];
      setTrainers(allTrainers);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Create payload, nullify trainer if empty string
    const payload = { ...formData };
    if (payload.trainer === "") {
        payload.trainer = null;
    }

    try {
      await api.post(`/activities/`, payload);
      fetchData();
      setIsModalOpen(false);
      toast.success("Activity added successfully!");
    } catch (error) {
      console.error("Failed to create activity", error);
      toast.error("Error saving activity.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this activity?")) return;
    try {
      await api.delete(`/activities/${id}/`);
      fetchData();
      toast.success("Activity deleted successfully.");
    } catch (error) {
      console.error("Failed to delete", error);
      toast.error("Failed to delete activity.");
    }
  };

  const filteredActivities = activities.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (a.description && a.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gym Activities</h1>
          <p className="text-slate-500 mt-1">Manage classes, workouts, and group sessions</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5"/>
            <input 
              type="text" 
              placeholder="Search activities..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all"
            />
          </div>
          {user?.role === 'admin' && (
            <button 
              onClick={openAddModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm shadow-indigo-200 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-5 h-5"/> Add Activity
            </button>
          )}
        </div>
      </div>

      {/* Grid Layout */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4].map(n => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse h-64"></div>
          ))}
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <Dumbbell className="w-16 h-16 text-indigo-200 mx-auto mb-4"/>
          <h3 className="text-lg font-bold text-slate-800">No activities found</h3>
          <p className="text-slate-500 mt-1">Get started by creating a new workout or class.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredActivities.map(activity => (
             <div key={activity.id} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-indigo-200 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 flex flex-col">
               {/* Card Header image pattern */}
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
                   <div className="flex items-center gap-3 text-slate-600">
                     <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                       <MapPin className="w-4 h-4"/>
                     </div>
                     <div className="text-sm font-medium">
                       {format(parseISO(activity.date), "MMM d, yyyy")}
                     </div>
                   </div>
                   
                   <div className="flex items-center gap-3 text-slate-600">
                     <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                       <Clock className="w-4 h-4"/>
                     </div>
                     <div className="text-sm font-medium">
                       {activity.time.substring(0,5)}
                     </div>
                   </div>
                   
                   <div className="flex items-center gap-3 text-slate-600">
                     <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                       <Timer className="w-4 h-4"/>
                     </div>
                     <div className="text-sm font-medium">
                       {activity.duration_minutes} mins
                     </div>
                   </div>
                   
                   {activity.description && (
                     <p className="text-sm text-slate-500 mt-4 line-clamp-2">
                       {activity.description}
                     </p>
                   )}
                 </div>
                 
                 {/* Card Footer Actions */}
                 <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                      {activity.trainer_name || 'No Trainer'}
                    </span>
                    {user?.role === 'admin' && (
                      <button 
                        onClick={() => handleDelete(activity.id)}
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

      {/* Add Activity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Dumbbell className="w-6 h-6 text-indigo-600"/> Add New Activity
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5"/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Activity Name *</label>
                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Morning Yoga, HIIT Training"
                    className="w-full border border-slate-300 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                  />
                </div>
                
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Duration (mins) *</label>
                    <input
                      required
                      type="number"
                      min="1"
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

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Trainer (Optional)</label>
                  <select
                    name="trainer"
                    value={formData.trainer}
                    onChange={handleInputChange}
                    className="w-full border border-slate-300 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm bg-white"
                  >
                    <option value="">No Trainer Assigned</option>
                    {trainers.map(t => (
                      <option key={t.id} value={t.id}>{t.name || (t.user ? t.user.first_name : `Trainer #${t.id}`)}</option>
                    ))}
                  </select>
                </div>

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

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white border border-slate-300 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 disabled:opacity-50"
                >
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
