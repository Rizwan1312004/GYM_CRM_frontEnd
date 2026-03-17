import React, { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { Edit, Trash2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import MemberDetailsModal from "./MemberDetailsModal";
import { set } from "date-fns";

export default function MembersTable() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [genderFilter, setGenderFilter] = useState("");

  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  useEffect(() => {
    setIsLoading(true);
    api
      .get(`/members/`)
      .then((response) => {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.data || response.data.results || [];
        setMembers(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching members:", err);
        setError("Failed to load members list.");
        toast.error("Failed to load members directory.");
        setIsLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        await api.delete(`/members/${id}/`);
        setMembers(members.filter((member) => member.id !== id));
        toast.success("Member successfully deleted.");
      } catch (err) {
        console.error("Failed to delete member:", err);
        toast.error("Failed to delete member.");
      }
    }
  };

  const filteredMembers = genderFilter
    ? members.filter(
        (member) => member.gender?.toLowerCase() === genderFilter.toLowerCase(),
      )
    : members;

  return (
    <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 font-semibold text-slate-800 flex justify-between items-center">
        <span>Members Directory</span>
        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className="bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
        >
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {isLoading ? (
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="flex items-center space-x-4 animate-pulse">
              <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              </div>
              <div className="h-8 bg-slate-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 text-center text-red-500 bg-red-50/50 m-4 rounded border border-red-100">
          {error}
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 m-4 rounded-xl border border-slate-200 border-dashed">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            No Members Found
          </h3>
          <p className="text-sm text-slate-500 max-w-sm">
            We couldn't find any members matching your criteria. Try adjusting
            your filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">
                  Admission No
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  Member
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  Email
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  Gender
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  Blood Group
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  Status
                </th>
                {user?.role === "admin" && (
                  <th scope="col" className="px-6 py-4 font-medium text-right">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr
                  key={member.id}
                  className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0 cursor-pointer"
                  onClick={() => handleRowClick(member)}
                >
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {member.admissionNo || `#${member.id}`}
                  </td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img
                      src={
                        member.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || "User")}&background=random`
                      }
                      alt={member.name}
                      className="w-8 h-8 rounded-full border border-slate-200"
                    />
                    <span className="font-medium text-slate-800">
                      {member.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 truncate max-w-[150px]">
                    {member.email}
                  </td>
                  <td className="px-6 py-4">{member.gender || "N/A"}</td>
                  <td className="px-6 py-4">
                    <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-semibold border border-red-100 whitespace-nowrap">
                      {member.blood_group || member.bloodGroup || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        member.status === "Active" ||
                        member.status?.toLowerCase() === "active" ||
                        member.is_active
                          ? "bg-[#60d62a] text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {member.status ||
                        (member.is_active ? "Active" : "Inactive")}
                    </span>
                  </td>
                  {user?.role === "admin" && (
                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/members/${member.id}`);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 transition-colors"
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(member.id);
                        }}
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

      <MemberDetailsModal
        member={selectedMember}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
