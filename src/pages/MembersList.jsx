import React from 'react';
import { useNavigate } from 'react-router-dom';
import MembersTable from '../components/MembersTable';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MembersList() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Members</h1>
        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/members/add')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Member
          </button>
        )}
      </div>

      <MembersTable />
    </div>
  );
}
