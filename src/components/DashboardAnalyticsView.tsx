import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Building,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DepartmentIndicator } from './StatusBadges';
import { gbuBuddhaStatueLibraryImg } from '../assets/images';

export const DashboardAnalyticsView: React.FC = () => {
  const { complaints, inventory, technicians } = useApp();

  const [dateRange, setDateRange] = useState('month');

  // Compute metrics
  const total = complaints.length;
  const closedOrResolved = complaints.filter(
    (c) => c.status === 'resolved' || c.status === 'closed'
  ).length;
  const resolutionRate = total > 0 ? Math.round((closedOrResolved / total) * 100) : 0;

  // SLA calculations
  const now = Date.now();
  const breachedCount = complaints.filter((c) => {
    if (c.status === 'closed') return false;
    const elapsedHrs = (now - new Date(c.createdAt).getTime()) / (3600 * 1000);
    return elapsedHrs > c.slaTargetHours;
  }).length;
  const slaCompliance = total > 0 ? Math.max(0, Math.round(((total - breachedCount) / total) * 100)) : 100;

  // Department counts
  const civilCount = complaints.filter((c) => c.department === 'Civil').length;
  const electricalCount = complaints.filter((c) => c.department === 'Electrical').length;
  const horticultureCount = complaints.filter((c) => c.department === 'Horticulture').length;

  // Region breakdown
  const hostelCount = complaints.filter(
    (c) => c.location.buildingType === 'Hostel'
  ).length;
  const academicCount = complaints.filter(
    (c) => c.location.buildingType === 'Academic'
  ).length;
  const facilityCount = total - hostelCount - academicCount;

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,Title,Department,Category,Priority,Building,Room,Status,Created At\n' +
      complaints
        .map(
          (c) =>
            `"${c.id}","${c.title.replace(/"/g, '""')}","${c.department}","${c.category}","${c.priority}","${c.location.building}","${c.location.room}","${c.status}","${c.createdAt}"`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GBU_CMS_Complaints_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Institutional Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-[#ded6c9] dark:border-[#334440] bg-[#1e2825] text-white min-h-[180px] flex flex-col justify-end p-6 shadow-md">
        <img
          src={gbuBuddhaStatueLibraryImg}
          alt="Gautam Buddha University Campus Central Library and Buddha Statue"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-45 hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141c1a] via-[#141c1a]/75 to-transparent" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-[#d9e6d3] tracking-wider uppercase mb-1">
              Estate & Maintenance Directorate
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-sm">
              Gautam Buddha University Campus Maintenance Analytics
            </h1>
            <p className="text-xs text-[#f6f0e6]/90 mt-1 max-w-xl">
              Real-time oversight of civil, electrical, and horticulture work orders, technician dispatch, inventory burn, and SLA compliance metrics across all university zones.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-semibold bg-[#d9e6d3] hover:bg-[#c5d4c2] text-[#141c1a] rounded-lg flex items-center gap-1.5 transition-colors shadow-sm whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV (FR-31)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1e2825] p-5 rounded-xl border border-[#ded6c9] dark:border-[#334440] shadow-xs transition-colors">
          <div className="text-xs font-medium text-[#5e7366] dark:text-[#a8bda3] flex items-center justify-between">
            <span>SLA Compliance Rate</span>
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-[#2f3e3a] dark:text-[#f6f0e6] mt-2">
            {slaCompliance}%
          </div>
          <div className="text-[11px] text-[#6f8a78] dark:text-[#88a391] mt-1">
            {breachedCount === 0 ? 'Zero breaches recorded' : `${breachedCount} tickets over SLA target`}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e2825] p-5 rounded-xl border border-[#ded6c9] dark:border-[#334440] shadow-xs transition-colors">
          <div className="text-xs font-medium text-[#5e7366] dark:text-[#a8bda3] flex items-center justify-between">
            <span>Resolution Rate</span>
            <CheckCircle2 className="w-4 h-4 text-[#6f8a78] dark:text-[#d9e6d3]" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-[#2f3e3a] dark:text-[#f6f0e6] mt-2">
            {resolutionRate}%
          </div>
          <div className="text-[11px] text-[#6f8a78] dark:text-[#88a391] mt-1">
            {closedOrResolved} of {total} tickets completed
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e2825] p-5 rounded-xl border border-[#ded6c9] dark:border-[#334440] shadow-xs transition-colors">
          <div className="text-xs font-medium text-[#5e7366] dark:text-[#a8bda3] flex items-center justify-between">
            <span>Average Resolution Time</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-[#2f3e3a] dark:text-[#f6f0e6] mt-2">
            18.4h
          </div>
          <div className="text-[11px] text-[#6f8a78] dark:text-[#88a391] mt-1">Across all 3 departments</div>
        </div>

        <div className="bg-white dark:bg-[#1e2825] p-5 rounded-xl border border-[#ded6c9] dark:border-[#334440] shadow-xs transition-colors">
          <div className="text-xs font-medium text-[#5e7366] dark:text-[#a8bda3] flex items-center justify-between">
            <span>Technician Availability</span>
            <ShieldCheck className="w-4 h-4 text-[#6f8a78] dark:text-[#d9e6d3]" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-[#2f3e3a] dark:text-[#f6f0e6] mt-2">
            {technicians.filter((t) => t.isAvailable).length}/{technicians.length}
          </div>
          <div className="text-[11px] text-[#6f8a78] dark:text-[#88a391] mt-1">Ready for on-call dispatch</div>
        </div>
      </div>

      {/* Analytics Breakdown Charts & Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-white dark:bg-[#1e2825] p-5 rounded-xl border border-[#ded6c9] dark:border-[#334440] shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#2f3e3a] dark:text-[#f6f0e6]">
              Department-Wise Maintenance Load
            </h3>
            <span className="text-xs text-[#6f8a78] dark:text-[#a8bda3] font-mono">3 Departments</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-[#2f3e3a] dark:text-[#f6f0e6]">Electrical Maintenance</span>
                <span className="font-mono text-[#5e7366] dark:text-[#a8bda3] font-semibold">
                  {electricalCount} ({total > 0 ? Math.round((electricalCount / total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#f6f0e6] dark:bg-[#141c1a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2f3e3a] dark:bg-[#a8bda3] rounded-full"
                  style={{ width: `${total > 0 ? (electricalCount / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-[#2f3e3a] dark:text-[#f6f0e6]">Civil Maintenance</span>
                <span className="font-mono text-[#5e7366] dark:text-[#a8bda3] font-semibold">
                  {civilCount} ({total > 0 ? Math.round((civilCount / total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#f6f0e6] dark:bg-[#141c1a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6f8a78] dark:bg-[#6f8a78] rounded-full"
                  style={{ width: `${total > 0 ? (civilCount / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-[#2f3e3a] dark:text-[#f6f0e6]">Horticulture Maintenance</span>
                <span className="font-mono text-[#5e7366] dark:text-[#a8bda3] font-semibold">
                  {horticultureCount} ({total > 0 ? Math.round((horticultureCount / total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#f6f0e6] dark:bg-[#141c1a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#88a391] dark:bg-[#88a391] rounded-full"
                  style={{ width: `${total > 0 ? (horticultureCount / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Campus Zone Distribution */}
        <div className="bg-white dark:bg-[#1e2825] p-5 rounded-xl border border-[#ded6c9] dark:border-[#334440] shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#2f3e3a] dark:text-[#f6f0e6]">
              Campus Zone Distribution
            </h3>
            <span className="text-xs text-[#6f8a78] dark:text-[#a8bda3] font-mono">Hostel vs Academic vs Facilities</span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 bg-[#f6f0e6]/50 dark:bg-[#141c1a]/60 rounded-xl border border-[#ded6c9]/80 dark:border-[#334440] text-center">
              <span className="text-xs text-[#5e7366] dark:text-[#a8bda3] block">Student Hostels</span>
              <span className="text-2xl font-bold font-mono tabular-nums text-[#2f3e3a] dark:text-[#f6f0e6] block mt-1">
                {hostelCount}
              </span>
              <span className="text-[10px] text-[#6f8a78] block">
                {total > 0 ? Math.round((hostelCount / total) * 100) : 0}% total load
              </span>
            </div>

            <div className="p-3.5 bg-[#f6f0e6]/50 dark:bg-[#141c1a]/60 rounded-xl border border-[#ded6c9]/80 dark:border-[#334440] text-center">
              <span className="text-xs text-[#5e7366] dark:text-[#a8bda3] block">Schools & Labs</span>
              <span className="text-2xl font-bold font-mono tabular-nums text-[#2f3e3a] dark:text-[#f6f0e6] block mt-1">
                {academicCount}
              </span>
              <span className="text-[10px] text-[#6f8a78] block">
                {total > 0 ? Math.round((academicCount / total) * 100) : 0}% total load
              </span>
            </div>

            <div className="p-3.5 bg-[#f6f0e6]/50 dark:bg-[#141c1a]/60 rounded-xl border border-[#ded6c9]/80 dark:border-[#334440] text-center">
              <span className="text-xs text-[#5e7366] dark:text-[#a8bda3] block">Central Facilities</span>
              <span className="text-2xl font-bold font-mono tabular-nums text-[#2f3e3a] dark:text-[#f6f0e6] block mt-1">
                {facilityCount}
              </span>
              <span className="text-[10px] text-[#6f8a78] block">
                {total > 0 ? Math.round((facilityCount / total) * 100) : 0}% total load
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
