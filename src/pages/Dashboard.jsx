import React, { useState, useEffect } from "react";
import api from "../services/api";
import {
  CreditCard as CardIcon,
  Layers,
  Box,
  Users as UsersIcon,
} from "lucide-react";

import StatCard from "../components/StatCard";
import MembersTable from "../components/MembersTable";
import MemberPanel from "../components/MemberPanel";

export default function Dashboard() {
  const [statsData, setStatsData] = useState({
    total_subscriptions: 0,
    total_services: 0,
    total_packages: 0,
    total_members: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    api
      .get(`/dashboard-stats/`)
      .then((response) => {
        setStatsData(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching dashboard stats:", error);
        setError("Failed to load dashboard statistics.");
        setIsLoading(false);
      });
  }, []);

  const stats = [
    {
      title: "Total Subscription",
      value: statsData.total_subscriptions,
      icon: CardIcon,
    },
    { title: "Total Services", value: statsData.total_services, icon: Layers },
    { title: "Total Packages", value: statsData.total_packages, icon: Box },
    { title: "Total Members", value: statsData.total_members, icon: UsersIcon },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-screen bg-slate-50">
      {/* KPI STAT CARDS */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        {isLoading
          ? // Loading Skeletons
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-pulse h-36 flex flex-col justify-between"
              >
                <div className="flex justify-between">
                  <div className="w-1/2">
                    <div className="h-8 bg-slate-200 rounded mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                  </div>
                  <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
                </div>
              </div>
            ))
          : stats.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
              />
            ))}
      </div>

      {/* MAIN TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Members Table) */}
        <div className="lg:col-span-2">
          <MembersTable />
        </div>

        {/* Right Column (Member Login / Info Panel) */}
        <div className="lg:col-span-1">
          <MemberPanel />
        </div>
      </div>
    </div>
  );
}
