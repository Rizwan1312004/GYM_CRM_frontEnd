import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  Activity,
  CalendarCheck,
  Users,
  CreditCard,
  Package,
  Server,
  RefreshCw,
  LogOut,
  UserCheck,
} from "lucide-react";

function NavItem({ icon: Icon, label, path, exact }) {
  const to = path || `/${label.toLowerCase()}`;
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        `flex items-center px-6 py-3 text-sm font-medium transition-colors ${isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`
      }
    >
      <Icon className="h-5 w-5 mr-3" />
      {label}
    </NavLink>
  );
}

function Sidebar({ isOpen, onClose }) {
  const { logout, user } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-[#1e2336] text-slate-300 flex flex-col 
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        <div className="h-16 flex items-center px-6 text-white font-bold text-xl tracking-wider border-b border-slate-700">
          The GYM Manager
        </div>
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          <NavItem icon={Home} label="Dashboard" path="/" exact />
          <NavItem icon={Activity} label="Activities" path="/activities" />
          <NavItem icon={CalendarCheck} label="Attendance" path="/attendance" />
          <NavItem icon={Users} label="Members" path="/members" />
          <NavItem icon={CreditCard} label="Subscriptions" />
          <NavItem icon={Package} label="Packages" path="/packages" />
          <NavItem icon={Server} label="Services" path="/services" />
          <NavItem icon={RefreshCw} label="Cycles" />
          {user?.role === "admin" && (
            <NavItem icon={UserCheck} label="Users" path="/users" />
          )}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
