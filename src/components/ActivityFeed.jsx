import React from 'react';

function ActivityFeed() {
  return (
    <div className="bg-white rounded-md shadow-sm border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-200 font-semibold text-slate-800">
        Latest Activities
      </div>
      <div className="p-10 flex justify-center items-center bg-slate-50/50 m-4 rounded border border-slate-100 text-slate-600 font-medium">
        No items found
      </div>
    </div>
  );
}

export default ActivityFeed;
