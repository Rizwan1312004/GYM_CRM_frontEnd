import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import EditPackage from "./pages/EditPackage";
import MemberProfile from "./pages/MemberProfile";
import MembersList from "./pages/MembersList";
import PackagesList from "./pages/PackagesList";
import ServicesList from "./pages/ServicesList";
import SubscriptionsList from "./pages/SubscriptionsList";
import AddSubscription from "./pages/AddSubscription";
import EditSubscription from "./pages/EditSubscription";
import AddMember from "./pages/AddMember";
import AddPackage from "./pages/AddPackage";
import Attendance from "./pages/Attendance";
import ActivitiesList from "./pages/ActivitiesList";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function AuthenticatedLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-800 relative">
      {/* SIDEBAR */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-x-hidden overflow-y-auto w-full">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/activities" element={<ActivitiesList />} />
          <Route path="/packages" element={<PackagesList />} />
          <Route path="/services" element={<ServicesList />} />
          <Route path="/subscriptions" element={<SubscriptionsList />} />
          <Route path="/subscriptions/add" element={<AddSubscription />} />
          <Route path="/subscriptions/edit/:id" element={<EditSubscription />} />
          <Route path="/packages/add" element={<AddPackage />} />
          <Route path="/packages/edit/:id" element={<EditPackage />} />
          <Route path="/members" element={<MembersList />} />
          <Route path="/members/add" element={<AddMember />} />
          <Route path="/members/:id" element={<MemberProfile />} />
          {/* Fallback route for unimplemented pages */}
          <Route path="*" element={<div className="p-6 text-slate-500">Page under construction...</div>} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <AuthenticatedLayout />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
