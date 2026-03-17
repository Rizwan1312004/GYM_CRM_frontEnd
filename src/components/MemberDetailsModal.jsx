import React from 'react';
import { X, Calendar, MapPin, Phone, Mail, Droplets, User, Activity, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MemberDetailsModal({ member, isOpen, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <img 
              src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'User')}&background=random`} 
              alt={member.name} 
              className="w-16 h-16 rounded-full border-2 border-white shadow-sm object-cover bg-white"
            />
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                {member.name}
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  member.status === 'Active' || member.status?.toLowerCase() === 'active' || member.is_active
                    ? 'bg-[#60d62a] text-white' 
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {member.status || (member.is_active ? 'Active' : 'Inactive')}
                </span>
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                  ADM: {member.admissionNo || member.admission_no || `#${member.id}`}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                   <Mail className="w-3.5 h-3.5" />
                   {member.email}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                Personal Details
              </h3>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div className="text-slate-500">Gender</div>
                <div className="font-medium text-slate-800">{member.gender || 'N/A'}</div>
                
                <div className="text-slate-500">Date of Birth</div>
                <div className="font-medium text-slate-800 flex items-center gap-1.5">
                   <Calendar className="w-3.5 h-3.5 text-slate-400" />
                   {member.dateOfBirth || member.date_of_birth || 'N/A'}
                </div>
                
                <div className="text-slate-500">Blood Group</div>
                <div className="font-medium text-slate-800 flex items-center gap-1.5">
                   <Droplets className="w-3.5 h-3.5 text-red-400" />
                   {member.bloodGroup || member.blood_group || 'N/A'}
                </div>
              </div>
            </div>

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
                   {member.address ? (
                     <span>
                       {member.address}
                       {member.city && `, ${member.city}`}
                       {member.state && `, ${member.state}`}
                     </span>
                   ) : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Subscriptions Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-500" />
              Active Subscriptions
            </h3>
            
            {member.subscriptions && member.subscriptions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {member.subscriptions.map(sub => (
                  <div key={sub.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800">{sub.package_name || sub.name || 'Package'}</h4>
                      <span className={`text-white text-[10px] font-bold px-2 py-0.5 rounded-full ${sub.status === 'active' ? 'bg-[#60d62a]' : 'bg-slate-400'}`}>
                        {sub.status}
                      </span>
                    </div>
                    {(sub.plan?.services?.length > 0 || sub.services?.length > 0) && (
                       <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                         Includes: {(sub.plan?.services || sub.services || []).map(s => s.name).join(', ')}
                       </p>
                    )}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mt-auto pt-3 border-t border-slate-200">
                      <Clock className="w-3.5 h-3.5" />
                      Valid until: {sub.valid_until || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                <p className="text-sm text-slate-500">No active subscriptions found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors"
          >
            Close
          </button>
          {user?.role === 'admin' && (
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
