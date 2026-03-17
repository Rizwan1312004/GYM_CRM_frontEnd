import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';

export default function MemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: 'Admin',
    email: 'admin@admin.com',
    admissionNo: '',
    status: 'Active',
    contactNumber: '',
    address: '',
    city: '',
    state: '',
    bloodGroup: null,
    gender: null,
    subscribeNewsletter: false,
    dateOfBirth: '',
    avatar: null,
    idProof: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles?.length > 0) {
      setFormData(prev => ({ ...prev, avatar: acceptedFiles[0] }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'image/*': [] },
    multiple: false 
  });

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

  // Simulating Fetch
  useEffect(() => {
    setIsLoading(true);
    api.get(`/members/${id}/`)
      .then(res => {
        // Only set data if found
        if(res.data) setFormData(prev => ({ ...prev, ...res.data }));
      })
      .catch(err => toast.error("Failed to fetch member details."))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const requiredFields = ['name', 'email', 'admissionNo', 'status', 'contactNumber', 'address', 'city', 'state', 'bloodGroup', 'gender', 'dateOfBirth'];
    const isComplete = requiredFields.every(field => {
      const val = formData[field];
      return val !== '' && val !== null && val !== undefined;
    });

    if (!isComplete) {
      toast.error("Please fill the form completely.");
      setIsSaving(false);
      return;
    }

    try {
      const payload = new FormData();
      for (const key in formData) {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          // If avatar or idProof are strings (existing URLs), it's best not to append them,
          // DRF will complain if we send a string URL to an ImageField in update.
          // Only append if it's a File object
          if ((key === 'avatar' || key === 'idProof' || key === 'id_proof') && typeof formData[key] === 'string') {
            continue;
          }
          payload.append(key, formData[key]);
        }
      }

      await api.patch(`/members/${id}/`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success("Member profile updated successfully!");
      navigate('/members');
    } catch (error) {
      toast.error("Failed to update profile.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    // In a real app you'd revert to original server data here.
    if(window.confirm('Are you sure you want to reset the form?')) {
        setFormData(prev => ({
            ...prev,
            contactNumber: '',
            address: '',
            city: '',
            state: '',
            bloodGroup: null,
            gender: null,
            subscribeNewsletter: false
        }));
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

  // Custom react-select styles matching Tailwind
  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: '#f1f5f9', // slate-100
      borderColor: state.isFocused ? '#3b82f6' : '#cbd5e1',
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
      borderRadius: '0.375rem',
      minHeight: '42px',
      '&:hover': {
        borderColor: '#94a3b8'
      }
    })
  };

  if (isLoading) {
    return <div className="p-6 text-slate-500">Loading member data...</div>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full">
      <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6 md:p-8">
        <h2 className="text-[#1e293b] text-xl font-semibold mb-6">
          Member Profile
        </h2>

          {/* Change Avatar Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 pb-8 border-b border-slate-100">
             <div 
               {...getRootProps()} 
               className={`w-32 h-32 rounded-full overflow-hidden border-2 flex shrink-0 items-center justify-center relative cursor-pointer outline-none transition-all duration-300 ${
                 isDragActive 
                   ? 'border-blue-500 bg-blue-50 scale-105 shadow-xl shadow-blue-500/20' 
                   : 'border-dashed border-slate-300 hover:border-blue-400 bg-slate-50'
               }`}
             >
                 <input {...getInputProps()} name="avatar" />
                 
                 <img 
                   src={
                     formData.avatar instanceof File 
                       ? URL.createObjectURL(formData.avatar) 
                       : formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`
                   } 
                   alt={formData.name} 
                   className="w-full h-full object-cover" 
                 />
                 
                 <div className="absolute inset-0 bg-slate-900/60 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                    <span className="text-white text-xs font-semibold tracking-wide uppercase">
                      {isDragActive ? "Drop here!" : "Change"}
                    </span>
                 </div>
             </div>
             <div>
               <p className="text-base font-semibold text-slate-800 mb-1">Upload Profile Photo</p>
               <p className="text-sm text-slate-500 max-w-[280px]">
                 Drag and drop an image here, or click to browse files. Recommended size: 256x256px.
               </p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm text-slate-600 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-[#f1f5f9] border border-[#cbd5e1] rounded-md py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Email & Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#f1f5f9] border border-[#cbd5e1] rounded-md py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Admission No</label>
                <input
                  type="text"
                  name="admissionNo"
                  value={formData.admissionNo || ''}
                  onChange={handleChange}
                  className="w-full bg-[#f1f5f9] border border-[#cbd5e1] rounded-md py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="ADM-001"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Status</label>
                <Select 
                  value={statusOptions.find(o => o.value === formData.status)}
                  onChange={(option) => handleSelectChange('status', option)}
                  options={statusOptions}
                  styles={customStyles}
                  isSearchable={false}
                />
              </div>
            </div>

            {/* Contact Number & Date of Birth Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Contact Number</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full bg-slate-100 border border-slate-300 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full bg-slate-100 border border-slate-300 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm text-slate-600 mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full bg-slate-100 border border-slate-300 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* City & State Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-slate-600 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full bg-slate-100 border border-slate-300 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full bg-slate-100 border border-slate-300 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Blood Group & Gender Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Blood Group</label>
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
                <label className="block text-sm text-slate-600 mb-1">Gender</label>
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

            {/* ID Proof Display / Upload */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4 mt-6">
              <h4 className="text-sm font-semibold text-slate-800 mb-3">ID Proof</h4>
              {formData.idProof && typeof formData.idProof === 'string' && (
                <div className="mb-4">
                  <a href={formData.idProof} target="_blank" rel="noopener noreferrer">
                    <img src={formData.idProof} alt="ID Proof" className="h-32 object-cover rounded shadow-sm border border-slate-200 hover:opacity-90" />
                  </a>
                  <p className="text-xs text-slate-500 mt-2">Click image to view full size</p>
                </div>
              )}
              {formData.idProof instanceof File && (
                <div className="mb-4 text-sm text-green-600 font-medium">
                  Selected new ID Proof to upload: {formData.idProof.name}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">Update ID Proof</label>
                <input
                  type="file"
                  name="idProof"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full text-sm text-slate-500 py-1 file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-colors"
                />
              </div>
            </div>

        

            {/* Actions */}
            <div className="flex justify-between items-center pt-8 border-t border-slate-100 mt-8">
               <div className="flex gap-3">
                 <button 
                   type="button"
                   onClick={() => navigate('/members')}
                   className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2 px-6 rounded-full text-sm transition-colors shadow-sm"
                 >
                   Cancel
                 </button>
                 <button 
                   type="button"
                   onClick={handleReset}
                   className="bg-[#e91e63] hover:bg-[#d81b60] text-white font-medium py-2 px-6 rounded-full text-sm transition-colors shadow-sm"
                 >
                   Reset
                 </button>
               </div>
               
               <button 
                 type="submit"
                 disabled={isSaving}
                 className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium py-2 px-6 rounded-full text-sm transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
               >
                 {isSaving ? "Submitting..." : "Submit"}
               </button>
            </div>
          </form>
      </div>
    </div>
  );
}
