import React, { useState } from "react";
import { X, Clock, ChevronDown } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import MemberDetailsModal from "./MemberDetailsModal";

function MemberPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Simulated search function
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await api.get(`/members/?search=${searchQuery}`);
      const members = Array.isArray(res.data)
        ? res.data
        : res.data.results || [];

      if (members.length > 0) {
        setSelectedMember(members[0]);
      } else {
        setSelectedMember(null);
        toast.error(`Member "${searchQuery}" not found.`);
      }
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("An error occurred during search.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setSelectedMember(null);
  };

  return (
    <div className="space-y-6">
      {/* Member Search Box */}
      <div className="bg-white rounded-md shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-[15px]">
            Member Login
          </h3>
        </div>
        <div className="p-4">
          <p className="text-sm text-slate-500 mb-3">
            Please search for a member to get started.
          </p>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-slate-200 rounded p-2 pl-3 pr-8 text-sm focus:outline-none focus:border-blue-500 text-slate-700"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            )}
          </form>
          {isSearching && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                </div>
              </div>
              <div className="h-16 bg-slate-200 rounded-md animate-pulse"></div>
              <div className="h-16 bg-slate-200 rounded-md animate-pulse"></div>
            </div>
          )}
        </div>
      </div>

      {/* Member Details Panel */}
      <div className="bg-white rounded-md shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-[15px]">
            Member Information
          </h3>
        </div>

        {selectedMember ? (
          <div className="p-5">
            {/* Member Profile Header */}
            <div className="flex items-center gap-3 mb-6">
              <img
                src={
                  selectedMember.avatar ||
                  "https://ui-avatars.com/api/?name=" +
                    encodeURIComponent(selectedMember.name)
                }
                alt={selectedMember.name}
                className="w-12 h-12 rounded-full border border-slate-200"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-800 text-[15px]">
                    {selectedMember.name}
                  </h4>
                  <span
                    className={`text-white text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedMember.status === "active" ? "bg-[#60d62a]" : "bg-slate-400"}`}
                  >
                    {selectedMember.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedMember.email}
                </p>
              </div>
            </div>

            {/* Subscriptions */}
            <h4 className="font-semibold text-slate-800 text-sm mb-3">
              Member Subscriptions
            </h4>
            {selectedMember.subscriptions?.length > 0 ? (
              selectedMember.subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="border border-slate-100 rounded-lg p-4 mb-6 shadow-sm bg-slate-50/30"
                >
                  <h5 className="font-bold text-slate-800 text-[15px] mb-1">
                    {sub.name}
                  </h5>
                  <span
                    className={`text-white text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-3 ${sub.status === "active" ? "bg-[#60d62a]" : "bg-slate-400"}`}
                  >
                    {sub.status}
                  </span>

                  {sub.plan?.services?.length > 0 && (
                    <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1 mb-4">
                      {sub.plan.services.map((service, idx) => (
                        <li key={idx}>{service.name}</li>
                      ))}
                    </ul>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <Clock size={14} />
                    Valid Until: {sub.valid_until}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 mb-6 italic">
                No active subscriptions.
              </p>
            )}

            {/* Branches */}
            <h4 className="font-semibold text-slate-800 text-sm mb-3">
              Member Branches
            </h4>
            {selectedMember.branches?.length > 0 ? (
              <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1 mb-8">
                {selectedMember.branches.map((branch, idx) => (
                  <li key={idx}>{branch.name}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 mb-8 italic">
                No branches assigned.
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#111827] hover:bg-slate-800 text-white text-xs font-medium py-2 px-4 rounded-full transition-colors"
              >
                View Profile
              </button>
            </div>
          </div>
        ) : (
          <div className="p-10 flex flex-col items-center justify-center text-center h-48">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
              <X className="text-slate-300" size={24} />
            </div>
            <p className="text-slate-500 text-sm font-medium">
              No member selected
            </p>
            <p className="text-slate-400 text-xs mt-1 max-w-[200px]">
              Use the search bar above to find and view a member's details.
            </p>
          </div>
        )}
      </div>

      <MemberDetailsModal
        member={selectedMember}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default MemberPanel;
