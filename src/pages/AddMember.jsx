import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AddMember() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    admissionNo: '',
    status: 'Active',
    contactNumber: '',
    address: '',
    city: '',
    state: '',
    bloodGroup: null,
    gender: null,
    dateOfBirth: '',
    avatar: null,
    idProof: null,
  });

  const [isSaving, setIsSaving] = useState(false);

  // Options
  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' }
  ];

  const bloodGroupOptions = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' }
  ];

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
    const requiredFields = ['name', 'email', 'admissionNo', 'status', 'contactNumber', 'address', 'city', 'state', 'bloodGroup', 'gender', 'dateOfBirth', 'idProof'];
    const isComplete = requiredFields.every(field => {
      const val = formData[field];
      return val !== '' && val !== null && val !== undefined;
    });

    if (!isComplete) {
      toast.error("Please fill the form completely");
      setIsSaving(false);
      return;
    }  
      
      const payload = new FormData();
      for (const key in formData) {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          payload.append(key, formData[key]);
        }
      }
      
      const response = await api.post(`/members/`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success("Member profile created successfully!");
      navigate('/members');
    } catch (error) {
      toast.error("Failed to create profile.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if(window.confirm('Are you sure you want to completely clear the form?')) {
        setFormData({
            name: '',
            email: '',
            admissionNo: '',
            status: 'Active',
            contactNumber: '',
            address: '',
            city: '',
            state: '',
            bloodGroup: null,
            gender: null,
            dateOfBirth: '',
            avatar: null,
            idProof: null,
        });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value 
    }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData(prev => ({ ...prev, [name]: selectedOption ? selectedOption.value : '' }));
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
    })
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full">
      <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6 md:p-8">
        <h2 className="text-[#1e293b] text-xl md:text-2xl font-semibold mb-8">
          Create New Member
        </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-slate-100 border border-slate-300 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-100 border border-slate-300 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Admission No *</label>
                <input
                  type="text"
                  name="admissionNo"
                  value={formData.admissionNo}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-100 border border-slate-300 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="ADM-001"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <Select 
                  value={statusOptions.find(o => o.value === formData.status)}
                  onChange={(option) => handleSelectChange('status', option)}
                  options={statusOptions}
                  styles={customStyles}
                  isSearchable={false}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number *</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-100 border border-slate-300 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-100 border border-slate-300 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full bg-slate-100 border border-slate-300 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full bg-slate-100 border border-slate-300 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full bg-slate-100 border border-slate-300 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
                <Select 
                  value={bloodGroupOptions.find(o => o.value === formData.bloodGroup)}
                  onChange={(option) => handleSelectChange('bloodGroup', option)}
                  options={bloodGroupOptions}
                  styles={customStyles}
                  placeholder="Select Blood Group"
                  isClearable
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                <Select 
                  value={genderOptions.find(o => o.value === formData.gender)}
                  onChange={(option) => handleSelectChange('gender', option)}
                  options={genderOptions}
                  styles={customStyles}
                  placeholder="Select Gender"
                  isClearable
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Profile Image</label>
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full text-sm text-slate-500 md:col-span-1 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors bg-slate-100 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ID Proof Image *</label>
                <input
                  type="file"
                  name="idProof"
                  accept="image/*"
                  onChange={handleChange}
                  required
                  className="w-full text-sm text-slate-500 md:col-span-1 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors bg-slate-100 rounded-md"
                />
              </div>
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
