import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AddPackage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    status: 'Active',
    billingCycle: '',
    services: []
  });

  const [isSaving, setIsSaving] = useState(false);

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' }
  ];

  const billingCycleOptions = [
    { value: 'Annually', label: 'Annually' },
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Weekly', label: 'Weekly' }
  ];

  const serviceOptions = [
    { value: 'boxing', label: 'Boxing' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'fitness_only', label: 'Fitness Only' },
    { value: 'muai_thai', label: 'Muai Thai' },
    { value: 'crossfit', label: 'Crossfit' },
    { value: 'zumba', label: 'Zumba' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const requiredPackageFields = ['name', 'amount', 'status', 'billingCycle'];
    const isTextComplete = requiredPackageFields.every(field => {
      const val = formData[field];
      return val !== '' && val !== null && val !== undefined;
    });
    const isServicesComplete = Array.isArray(formData.services) && formData.services.length > 0;

    if (!isTextComplete || !isServicesComplete) {
      toast.error("Please fill the form completely.");
      setIsSaving(false);
      return;
    }  
      const response = await api.post(`/packages/`, formData);
      toast.success("Package created successfully!");
      navigate('/packages');
    } catch (error) {
      toast.error("Failed to create package.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData(prev => ({ ...prev, [name]: selectedOption ? selectedOption.value : '' }));
  };

  const handleMultiSelectChange = (name, selectedOptions) => {
    setFormData(prev => ({ ...prev, [name]: selectedOptions || [] }));
  };

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
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#e2e8f0',
      borderRadius: '0.25rem',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#334155',
      fontSize: '0.875rem',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#475569',
      ':hover': {
        backgroundColor: '#cbd5e1',
        color: '#0f172a',
      },
    }),
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl">
      <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6 md:p-8">
        <h2 className="text-[#1e293b] text-xl md:text-2xl font-semibold mb-8">
          Create New Package
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-slate-100 border border-slate-300 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g. Gold Membership"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Amount *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              className="w-full bg-slate-100 border border-slate-300 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <Select 
              value={statusOptions.find(o => o.value === formData.status)}
              onChange={(option) => handleSelectChange('status', option)}
              options={statusOptions}
              styles={customStyles}
              isSearchable={false}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Billing Cycle
            </label>
            <Select 
              value={billingCycleOptions.find(o => o.value === formData.billingCycle)}
              onChange={(option) => handleSelectChange('billingCycle', option)}
              options={billingCycleOptions}
              styles={customStyles}
              isSearchable={false}
              isClearable
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Services
            </label>
            <Select
              isMulti
              name="services"
              options={serviceOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              value={formData.services}
              onChange={(options) => handleMultiSelectChange('services', options)}
              styles={customStyles}
              placeholder="Select services..."
            />
          </div>

          <div className="flex justify-between items-center pt-8 border-t border-slate-100 mt-8">
             <button 
               type="button"
               onClick={() => window.history.back()}
               className="bg-[#e91e63] hover:bg-[#d81b60] text-white font-medium py-2.5 px-6 rounded-full text-sm transition-colors shadow-sm"
             >
               Cancel
             </button>
             
             <button 
               type="submit"
               disabled={isSaving}
               className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium py-2.5 px-6 rounded-full text-sm transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
             >
               {isSaving ? "Submitting..." : "Submit"}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
