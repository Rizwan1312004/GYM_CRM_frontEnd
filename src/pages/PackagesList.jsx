import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Search, Box, CheckCircle } from "lucide-react";
import { useAuth } from '../context/AuthContext';

export default function PackagesList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsLoading(true);
    api.get(`/packages/`)
      .then((response) => {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.data || response.data.results || [];
        setPackages(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching packages:", err);
        setError("Failed to load packages list.");
        toast.error("Failed to load packages list.");
        setIsLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      try {
        await api.delete(`/packages/${id}/`);
        setPackages(packages.filter(pkg => pkg.id !== id));
        toast.success("Package deleted successfully.");
      } catch (err) {
        console.error("Failed to delete package:", err);
        toast.error("Failed to delete package.");
      }
    }
  };

  const filteredPackages = packages.filter(pkg => 
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Membership Packages</h1>
          <p className="text-slate-500 mt-1">Manage pricing plans and subscription tiers.</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5"/>
            <input 
              type="text" 
              placeholder="Search packages..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all"
            />
          </div>
          {user?.role === 'admin' && (
            <button 
              onClick={() => navigate("/packages/add")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm shadow-indigo-200 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-5 h-5"/> New Package
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4].map(n => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse h-64 flex flex-col">
              <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-slate-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-3 mb-6 flex-1">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                <div className="h-4 bg-slate-200 rounded w-4/5"></div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-auto">
                <div className="h-10 bg-slate-200 rounded-xl"></div>
                <div className="h-10 bg-slate-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl shadow-sm text-center">
          {error}
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <Box className="w-16 h-16 text-indigo-200 mx-auto mb-4"/>
          <h3 className="text-lg font-bold text-slate-800">No packages found</h3>
          <p className="text-slate-500 mt-1">Get started by creating a new membership package.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPackages.map(pkg => {
             const isActive = pkg.status === "Active" || pkg.status?.toLowerCase() === "active" || pkg.is_active;

             return (
               <div key={pkg.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 relative">
                 
                 {/* Decorative Header Banner */}
                 <div className="h-4 w-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>

                 <div className="p-6 flex-1 flex flex-col">
                   <div className="flex justify-between items-start mb-4">
                     <h3 className="text-xl font-bold text-slate-900 tracking-tight">{pkg.name}</h3>
                     <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {isActive ? "Active" : "Inactive"}
                     </span>
                   </div>

                   <div className="mb-6">
                     <div className="flex items-baseline gap-1 text-slate-900">
                       <span className="text-3xl font-extrabold">₹{pkg.amount}</span>
                       <span className="text-slate-500 font-medium capitalize">/ {pkg.billingCycle || pkg.billing_cycle || "month"}</span>
                     </div>
                   </div>

                   <ul className="space-y-3 mb-6 flex-1 text-sm text-slate-600">
                     <li className="flex gap-2 items-start">
                       <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0"/>
                       <span>Basic gym access included</span>
                     </li>
                     <li className="flex gap-2 items-start opacity-70">
                       <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0"/>
                       <span>ID: #{pkg.id}</span>
                     </li>
                     {/* Placeholder for features if backend ever adds them:
                       pkg.features?.map((feat, i) => (
                         <li key={i} className="flex gap-2 items-start">
                           <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0"/>
                           <span>{feat}</span>
                         </li>
                       ))
                     */}
                     </ul>

                   {user?.role === 'admin' && (
                     <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 mt-auto">
                       <button
                          onClick={() => navigate(`/packages/edit/${pkg.id}`)}
                          className="flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2.5 rounded-xl font-medium transition-colors"
                        >
                          <Edit className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.id)}
                          className="flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 py-2.5 rounded-xl font-medium transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                     </div>
                   )}
                 </div>
               </div>
             )
          })}
        </div>
      )}
    </div>
  );
}
