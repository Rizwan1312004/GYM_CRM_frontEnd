import React from 'react';

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:shadow-indigo-100 border border-slate-100 hover:border-indigo-200 transition-all duration-300 relative overflow-hidden flex flex-col p-6">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50/50 rounded-full blur-2xl group-hover:bg-indigo-100/50 transition-colors duration-500"></div>
      
      <div className="flex justify-between items-start relative z-10">
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </h3>
        </div>
        
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {/* Optional decorative bottom line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
    </div>
  );
}

export default StatCard;
