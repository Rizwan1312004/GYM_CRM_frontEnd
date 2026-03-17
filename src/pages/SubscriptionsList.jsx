import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from "lucide-react";
import { useAuth } from '../context/AuthContext';

export default function SubscriptionsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    api.get(`/subscriptions/`)
      .then((response) => {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.data || response.data.results || [];
        setSubscriptions(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching subscriptions:", err);
        setError("Failed to load subscriptions list.");
        toast.error("Failed to load subscriptions list.");
        setIsLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this subscription?")) {
      try {
        await api.delete(`/subscriptions/${id}/`);
        setSubscriptions(subscriptions.filter(sub => sub.id !== id));
        toast.success("Subscription deleted successfully.");
      } catch (err) {
        console.error("Failed to delete subscription:", err);
        toast.error("Failed to delete subscription.");
      }
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Subscriptions</h1>
        {user?.role === 'admin' && (
          <button
            onClick={() => navigate("/subscriptions/add")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Subscription
          </button>
        )}
      </div>

      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="flex items-center space-x-4 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-12"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/5"></div>
                <div className="h-4 bg-slate-200 rounded w-24"></div>
                <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                <div className="flex-1 flex justify-end gap-2">
                  <div className="h-8 bg-slate-200 rounded w-16"></div>
                  <div className="h-8 bg-slate-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500 bg-red-50/50 m-4 rounded border border-red-100">
            {error}
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="p-10 flex justify-center items-center text-slate-500 bg-slate-50/50 m-4 rounded border border-slate-100 border-dashed">
            No subscriptions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-4 font-medium">
                    Member
                  </th>
                  <th scope="col" className="px-6 py-4 font-medium">
                    Package
                  </th>
                  <th scope="col" className="px-6 py-4 font-medium">
                    Start Date
                  </th>
                  <th scope="col" className="px-6 py-4 font-medium">
                    End Date
                  </th>
                  <th scope="col" className="px-6 py-4 font-medium">
                    Status
                  </th>
                  {user?.role === 'admin' && (
                    <th scope="col" className="px-6 py-4 font-medium text-right">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0"
                  >
                    <td className="px-6 py-4 font-medium text-slate-800">
                      #{sub.id}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {sub.member_name || "Unknown Member"}
                    </td>
                    <td className="px-6 py-4">
                      {sub.package_name || "Unknown Package"}
                    </td>
                    <td className="px-6 py-4">
                      {sub.start_date || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {sub.end_date || sub.valid_until || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          sub.status === "Active" ||
                          sub.status?.toLowerCase() === "active" ||
                          sub.is_active
                            ? "bg-[#60d62a] text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {sub.status || (sub.is_active ? "Active" : "Inactive")}
                      </span>
                    </td>
                    {user?.role === 'admin' && (
                      <td className="px-6 py-4 text-right flex justify-end gap-3">
                        <button
                          onClick={() => navigate(`/subscriptions/edit/${sub.id}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <Edit className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="text-red-500 hover:text-red-700 font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
