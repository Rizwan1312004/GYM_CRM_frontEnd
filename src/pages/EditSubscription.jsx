import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function EditSubscription() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    member: null,
    plan_id: null,
    status: 'active'
  });

  const [members, setMembers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Status Option
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, packagesRes, subRes] = await Promise.all([
          api.get(`/members/`),
          api.get(`/packages/`),
          api.get(`/subscriptions/${id}/`)
        ]);
        
        setMembers(
          (membersRes.data?.results || membersRes.data || []).map(m => ({
            value: m.id,
            label: m.name || m.email || `Member #${m.id}`
          }))
        );

        setPackages(
          (packagesRes.data?.results || packagesRes.data || []).map(p => ({
            value: p.id,
            label: p.name || `Package #${p.id}`
          }))
        );

        const subData = subRes.data;
        setFormData({
            member: subData.member,
            plan_id: subData.plan ? subData.plan.id : null,
            status: subData.status
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.member || !formData.plan_id) {
      toast.error("Please select a Member and a Package.");
      return;
    }

    setIsSaving(true);
    try {
      await api.put(`/subscriptions/${id}/`, formData);
      toast.success("Subscription updated successfully!");
      navigate('/subscriptions');
    } catch (error) {
      toast.error("Failed to update subscription.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData(prev => ({ ...prev, [name]: selectedOption ? selectedOption.value : null }));
  };

  // Custom react-select styles matching Tailwind
  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: '#f1f5f9',
      borderColor: state.isFocused ? '#3b82f6' : '#cbd5e1',
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
      borderRadius: '0.375rem',
      minHeight: '42px',
      '&:hover': {
        borderColor: '#94a3b8'
      }
    })
  };

  if(isLoading) {
      return (
        <div className="p-10 flex justify-center items-center h-[50vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6 md:p-8">
        <h2 className="text-[#1e293b] text-xl font-semibold mb-6 pb-4 border-b border-slate-100 flex items-center gap-3">
          Edit Subscription <span className="text-slate-400 text-sm font-normal">#{id}</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-slate-600 mb-1 font-medium">Member</label>
              <Select 
                options={members}
                value={members.find(o => o.value === formData.member) || null}
                onChange={(option) => handleSelectChange('member', option)}
                styles={customStyles}
                placeholder="Search Member..."
                isClearable
                isSearchable
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1 font-medium">Package</label>
              <Select 
                options={packages}
                value={packages.find(o => o.value === formData.plan_id) || null}
                onChange={(option) => handleSelectChange('plan_id', option)}
                styles={customStyles}
                placeholder="Select Package..."
                isClearable
                isSearchable
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-slate-600 mb-1 font-medium">Status</label>
              <Select 
                options={statusOptions}
                value={statusOptions.find(o => o.value === formData.status) || null}
                onChange={(option) => handleSelectChange('status', option)}
                styles={customStyles}
                isSearchable={false}
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-8">
            <button 
              type="button"
              onClick={() => navigate('/subscriptions')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-6 rounded-lg text-sm transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-8 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
            >
              {isSaving ? "Saving..." : "Update Subscription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
